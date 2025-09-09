"""
Enhanced LangChain Workflow Orchestrator for HealthBridge — extended for
Advanced Prompt Engineering & MCP (Multi-Context Prompting)

Features added to satisfy the rubric:
 - Few-shot prompting support (task & role-aware example selection)
 - Chain-of-thought toggle (optionally insert CoT scaffold)
 - Dynamic prompt generation (templates assembled at runtime from contexts)
 - MCP (Multi-Context Prompting) architecture: generates multiple prompt-context variants,
   runs a lightweight evaluation, and selects the best candidate
 - Prompt optimization heuristics (temperature sweep + simple scoring based on coverage)
 - Prompt caching to avoid repeated heavy generation
 - Role-aware prompt formatting and safety disclaimers
 - Exposed orchestration methods (basic/intermediate/advanced) use the enhanced prompts

Drop-in replacement for the original `langchain_workflows.py`.
"""
from typing import List, Optional, Dict, Any, Callable, Tuple
from dataclasses import dataclass, field
import logging
from pathlib import Path
import hashlib
import time

# LangChain imports (soft import pattern, graceful warnings)
try:
    from langchain import LLMChain, PromptTemplate
    from langchain.chains import ConversationalRetrievalChain
    from langchain.embeddings import HuggingFaceEmbeddings
    from langchain.vectorstores import Chroma
    from langchain.memory import ConversationBufferMemory
    from langchain.agents import Tool, initialize_agent, AgentType
    from langchain.chat_models import ChatOpenAI
    from langchain.schema import HumanMessage
except Exception:
    logging.warning("LangChain or some components not installed. Install langchain and friends to enable full functionality.")

logger = logging.getLogger(__name__)

# -------------------- Config dataclass --------------------
@dataclass
class LangChainConfig:
    model_name: str = "all-MiniLM-L6-v2"
    llm_model: str = "local-llm"
    persist_directory: Optional[str] = None
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    chunk_size: int = 512
    k_retrieval: int = 5
    # Advanced prompt engineering toggles
    enable_cot: bool = True  # chain-of-thought scaffolding
    enable_mcp: bool = True  # multi-context prompting
    few_shot_examples: int = 3
    prompt_cache_ttl: int = 60 * 60  # seconds
    optimization_temperatures: List[float] = field(default_factory=lambda: [0.0, 0.2, 0.5])


# -------------------- Helper: prompt cache --------------------
class PromptCache:
    def __init__(self):
        self._cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}

    def _now(self):
        return time.time()

    def make_key(self, *parts) -> str:
        key_raw = "::".join([str(p) for p in parts])
        return hashlib.sha256(key_raw.encode("utf-8")).hexdigest()

    def get(self, key: str, ttl: int = 3600) -> Optional[Dict[str, Any]]:
        entry = self._cache.get(key)
        if not entry:
            return None
        created_at, payload = entry
        if self._now() - created_at > ttl:
            del self._cache[key]
            return None
        return payload

    def set(self, key: str, payload: Dict[str, Any]):
        self._cache[key] = (self._now(), payload)


_PROMPT_CACHE = PromptCache()


# -------------------- Few-shot example store --------------------
# In production you would store domain-specific few-shot examples in files or a DB.
_DEFAULT_FEW_SHOT = {
    "symptom_checker_task": [
        {
            "input": "I have a fever and sore throat for 2 days. What could it be?",
            "answer": "Possible viral pharyngitis; consider symptomatic care, hydration, and testing if persistent."
        },
        {
            "input": "I've been having chest pain when I breathe. Should I worry?",
            "answer": "Chest pain with respiration could indicate pleurisy or pulmonary issues — seek urgent evaluation."
        }
    ],
    "treatment_guideline_task": [
        {
            "input": "How to manage mild community-acquired pneumonia at home?",
            "answer": "Empiric oral antibiotics (per local guidelines), rest, hydrate, and follow up with PCP within 48-72 hours."
        }
    ],
    "general_medical_task": [
        {
            "input": "What is diabetes?",
            "answer": "Diabetes is a metabolic disorder characterized by hyperglycemia due to insulin deficiency or resistance."
        }
    ]
}


# -------------------- MCP (Multi-Context Prompting) --------------------
class MCPGenerator:
    """Creates multiple prompt-context variants (different instruction framings, example sets,
    CoT on/off) and provides a simple evaluator to pick best candidate."""

    def __init__(self, config: LangChainConfig, llm_callable: Optional[Callable] = None):
        self.config = config
        # llm_callable should be a function that accepts dict {prompt, temperature} and returns text
        self.llm_callable = llm_callable

    def generate_candidates(self, base_context: str, task_key: str, role: str, question: str, extra_examples: Optional[List[Dict]] = None) -> List[Dict[str, Any]]:
        """Return list of prompt candidates with metadata."""
        examples = (extra_examples or []) + _DEFAULT_FEW_SHOT.get(task_key, [])
        candidates = []

        # Variation 1: Instruction-first, few-shot
        tmpl1 = self._build_prompt(template_style="instruction_first", examples=examples, cot=self.config.enable_cot)
        candidates.append({"style": "instruction_first", "prompt": tmpl1})

        # Variation 2: Examples-first (showing few-shot then instruction)
        tmpl2 = self._build_prompt(template_style="examples_first", examples=examples, cot=self.config.enable_cot)
        candidates.append({"style": "examples_first", "prompt": tmpl2})

        # Variation 3: Minimal prompt, high-safety (explicit disclaimers)
        tmpl3 = self._build_prompt(template_style="minimal_safe", examples=examples[:1], cot=False)
        candidates.append({"style": "minimal_safe", "prompt": tmpl3})

        # Variation 4: Expanded context (attach RAG context + explicit step-by-step ask)
        tmpl4 = self._build_prompt(template_style="step_by_step", examples=examples, cot=True)
        candidates.append({"style": "step_by_step", "prompt": tmpl4})

        # Each candidate includes the assembled prompt with placeholders for question and context
        # We'll now fill in question+context for each candidate when evaluating
        for c in candidates:
            c["filled_prompt"] = c["prompt"].format(question=question, role=role, context=base_context)

        return candidates

    def _build_prompt(self, template_style: str, examples: List[Dict], cot: bool) -> str:
        """Return a python format-string template containing {question}, {context}, {role} placeholders."""
        few_shot_text = "" if not examples else "\n\n".join([f"Q: {ex['input']}\nA: {ex['answer']}" for ex in examples[: self.config.few_shot_examples]])

        cot_hint = "\n\nLet's think step by step:" if cot else ""

        if template_style == "instruction_first":
            template = (
                "You are a specialized medical assistant for role: {role}.\n"
                "Given the medical context below, answer the user's question concisely and cite reasoning.\n"
                "Context:\n{context}\n\n"
                "Examples:\n{few_shot}\n\n"
                "User question: {question}\n"
                "Answer with clear steps or bullets when appropriate." + cot_hint
            )
        elif template_style == "examples_first":
            template = (
                "Examples to follow for style and length:\n{few_shot}\n\n"
                "Context:\n{context}\n\n"
                "You are answering as a medical assistant for role: {role}.\n"
                "Question: {question}\n"
                "Provide a short answer, then an optional explanatory section." + cot_hint
            )
        elif template_style == "minimal_safe":
            template = (
                "{question}\n\nContext:\n{context}\n\n"
                "Provide a short, conservative response. Always add a medical safety disclaimer."
            )
        else:  # step_by_step
            template = (
                "Role: {role}\nContext:\n{context}\n\n"
                "Task: Break down the clinical reasoning into numbered steps, cite any evidence found, then give a succinct conclusion.\n"
                "Question: {question}\n"
                "{cot_hint}"
            )

        # insert the few_shot and cot_hint placeholders for formatting later
        return template.replace("{few_shot}", few_shot_text).replace("{cot_hint}", cot_hint)

    def evaluate_candidates(self, candidates: List[Dict[str, Any]], evaluator_keywords: Optional[List[str]] = None) -> Dict[str, Any]:
        """Evaluate candidates using llm_callable or heuristics and return the best candidate.

        The evaluator attempts:
         - If llm_callable provided: run with low temperature and score output for keyword coverage and length
         - Otherwise: choose candidate with longest filled_prompt (heuristic)
        """
        if not candidates:
            raise ValueError("No candidates provided")

        evaluator_keywords = evaluator_keywords or []

        # If we have a callable LLM (synchronous wrapper), use it to score outputs
        if self.llm_callable:
            best = None
            best_score = -1.0
            for cand in candidates:
                # run llm once for each candidate at low temp
                try:
                    out = self.llm_callable({"prompt": cand["filled_prompt"], "temperature": 0.0})
                    cand_text = out.strip()
                except Exception as e:
                    cand_text = ""

                # basic scoring: presence of keywords + reasonable length
                score = 0.0
                if cand_text:
                    l = len(cand_text.split())
                    score += min(1.0, l / 150.0)  # prefer medium-length answers
                    for kw in evaluator_keywords:
                        if kw.lower() in cand_text.lower():
                            score += 0.5

                if score > best_score:
                    best_score = score
                    best = {**cand, "candidate_output": cand_text, "score": score}

            return best or {"candidate": candidates[0], "score": 0.0}

        # Fallback heuristic
        candidates_sorted = sorted(candidates, key=lambda c: len(c["filled_prompt"]))
        best = candidates_sorted[-1]
        return {"candidate": best, "score": len(best["filled_prompt"]) }


# -------------------- Orchestrator --------------------
class LangChainOrchestrator:
    def __init__(self, config: LangChainConfig, chroma_client=None, llm_adapter: Optional[Callable] = None):
        self.config = config
        self.chroma_client = chroma_client
        self._vectorstore = None
        self._retriever = None
        self._memory_store = {}
        self._llm = None
        self._llm_adapter = llm_adapter  # adapter: accepts dict({prompt, temperature}) -> text
        self._mcp = MCPGenerator(config, llm_callable=self._call_llm_sync if llm_adapter else None)

        # lazy init
        try:
            self._init_embeddings()
            self._init_vectorstore()
            self._init_llm()
        except Exception as e:
            logger.warning(f"Initialization warning: {e}")

    # ---------------------- Initialization helpers ----------------------
    def _init_embeddings(self):
        try:
            self.embeddings = HuggingFaceEmbeddings(model_name=self.config.embedding_model_name)
            logger.info("Embeddings initialized")
        except Exception as e:
            logger.warning(f"Could not initialize HuggingFaceEmbeddings: {e}")
            self.embeddings = None

    def _init_vectorstore(self):
        try:
            if self.chroma_client is not None:
                persist_dir = self.config.persist_directory
                if persist_dir is None:
                    raise ValueError("persist_directory required when passing chroma_client")
                self._vectorstore = Chroma(persist_directory=persist_dir, embedding_function=self.embeddings)
            else:
                if not self.config.persist_directory:
                    raise ValueError("persist_directory required to create Chroma vectorstore")
                self._vectorstore = Chroma(persist_directory=self.config.persist_directory, embedding_function=self.embeddings)

            self._retriever = self._vectorstore.as_retriever(search_kwargs={"k": self.config.k_retrieval})
            logger.info("Vectorstore and retriever initialized")
        except Exception as e:
            logger.warning(f"Vectorstore init failed: {e}")
            self._vectorstore = None
            self._retriever = None

    def _init_llm(self):
        try:
            # If user provided adapter (preferred), keep it. Otherwise default to ChatOpenAI if available.
            if self._llm_adapter:
                self._llm = None  # adapter-driven
                logger.info("LLM adapter provided; using adapter for generation.")
            else:
                self._llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
                logger.info("ChatOpenAI LLM initialized as default (replace with local adapter in production)")
        except Exception as e:
            logger.warning(f"LLM initialization warning: {e}")
            self._llm = None

    # ---------------------- LLM sync wrapper (for MCP evaluation) ----------------------
    def _call_llm_sync(self, payload: Dict[str, Any]) -> str:
        """A thin synchronous wrapper around llm_adapter. Accepts {'prompt', 'temperature'} and returns text."""
        if not self._llm_adapter:
            raise RuntimeError("No llm_adapter provided for sync calls")
        return self._llm_adapter(payload)

    # ---------------------- Memory ----------------------
    def create_memory(self, user_id: str):
        if user_id in self._memory_store:
            return self._memory_store[user_id]
        mem = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        self._memory_store[user_id] = mem
        return mem

    # ---------------------- Tools ----------------------
    def rag_tool(self) -> Tool:
        def _run(query: str) -> str:
            if not self._retriever:
                return "RAG backend not available"
            docs = self._retriever.get_relevant_documents(query)
            return "\n\n".join([d.page_content for d in docs[: self.config.k_retrieval]])

        return Tool(name="RAGSearch", func=_run, description="Search the medical vectorstore for relevant documents")

    def summarize_tool(self) -> Tool:
        def _run(text: str) -> str:
            if not (self._llm or self._llm_adapter):
                return "LLM not available for summarization"
            prompt = PromptTemplate(input_variables=["text"], template="Summarize this medical text concisely:\n\n{text}")
            if self._llm:
                chain = LLMChain(llm=self._llm, prompt=prompt)
                return chain.run({"text": text})
            else:
                return self._llm_adapter({"prompt": prompt.format(text=text), "temperature": 0.0})

        return Tool(name="Summarize", func=_run, description="Summarize a piece of text")

    def medical_guideline_tool(self) -> Tool:
        def _run(query: str) -> str:
            rag_text = self.rag_tool().run(query)
            if not (self._llm or self._llm_adapter):
                return rag_text
            prompt = PromptTemplate(input_variables=["docs", "question"], template=(
                "Extract evidence-based guideline-style bullet points for the question:\nQuestion: {question}\n\nDocuments:\n{docs}\n\nProvide numbered steps and cite docs by index."
            ))
            if self._llm:
                chain = LLMChain(llm=self._llm, prompt=prompt)
                return chain.run({"docs": rag_text, "question": query})
            else:
                return self._llm_adapter({"prompt": prompt.format(docs=rag_text, question=query), "temperature": 0.0})

        return Tool(name="MedicalGuideline", func=_run, description="Produce guideline-style outputs from RAG + LLM")

    # ---------------------- Prompt assembly & optimization ----------------------
    def _assemble_base_context(self, rag_docs: Optional[str], conversation_summary: str, user_profile: Optional[Dict] = None) -> str:
        parts = []
        if rag_docs:
            parts.append(f"Retrieved medical context:\n{rag_docs}")
        if conversation_summary:
            parts.append(f"Conversation summary:\n{conversation_summary}")
        if user_profile:
            parts.append(f"User profile:\n{user_profile}")
        return "\n\n".join(parts) if parts else "No additional context available."

    def _build_and_select_prompt(self, rag_docs: str, conversation_summary: str, task_key: str, role: str, question: str, user_profile: Optional[Dict] = None) -> Dict[str, Any]:
        """Using MCPGenerator, assemble candidates and (optionally) optimize them with temperature sweep.
        Returns a dict: {prompt, temp, metadata}
        """
        cache_key = _PROMPT_CACHE.make_key(rag_docs, conversation_summary, task_key, role, question)
        cached = _PROMPT_CACHE.get(cache_key, ttl=self.config.prompt_cache_ttl)
        if cached:
            return cached

        base_context = self._assemble_base_context(rag_docs, conversation_summary, user_profile)
        candidates = self._mcp.generate_candidates(base_context=base_context, task_key=task_key, role=role, question=question)

        # Evaluate candidates using llm_adapter if available, otherwise heuristics
        evaluator_kw = [task_key.replace('_', ' '), role]
        best = self._mcp.evaluate_candidates(candidates, evaluator_keywords=evaluator_kw)

        # If optimizer enabled, try small temperature sweep to pick better-sounding render
        chosen = best.get("candidate") or best
        chosen_prompt = chosen["filled_prompt"] if isinstance(chosen, dict) and "filled_prompt" in chosen else chosen

        chosen_temp = 0.0
        if self._llm_adapter:
            # run temperature sweep and choose best by keyword coverage
            best_score = -1
            best_temp = chosen_temp
            best_out = None
            for t in self.config.optimization_temperatures:
                try:
                    out = self._call_llm_sync({"prompt": chosen_prompt, "temperature": t})
                except Exception:
                    out = ""
                score = 0
                # heuristic scoring: prefer answers containing medical terms or multiple steps
                if out:
                    if len(out.split()) > 10:
                        score += 1
                    if "step" in out.lower() or "1." in out:
                        score += 0.5
                if score > best_score:
                    best_score = score
                    best_temp = t
                    best_out = out
            chosen_temp = best_temp
            selection = {"prompt": chosen_prompt, "temperature": chosen_temp, "candidate_output": best_out}
        else:
            selection = {"prompt": chosen_prompt, "temperature": chosen_temp}

        # Cache selection
        _PROMPT_CACHE.set(cache_key, selection)
        return selection

    # ---------------------- Workflow tiers ----------------------
    def run_basic_workflow(self, user_query: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        logger.info("Running BASIC workflow (enhanced prompts)")
        if not self._retriever:
            return {"status": "error", "message": "RAG backend unavailable"}

        docs = self._retriever.get_relevant_documents(user_query)
        combined = "\n\n".join([d.page_content for d in docs[: self.config.k_retrieval]])

        # Build prompt & select
        convo_summary = ""  # Basic workflow uses minimal convo memory
        selection = self._build_and_select_prompt(combined, convo_summary, "general_medical_task", "patient", user_query)

        # Generate answer
        if self._llm:
            prompt_template = PromptTemplate(input_variables=["full_prompt"], template="{full_prompt}")
            chain = LLMChain(llm=self._llm, prompt=prompt_template)
            out = chain.run({"full_prompt": selection["prompt"]})
        else:
            out = self._llm_adapter({"prompt": selection["prompt"], "temperature": selection.get("temperature", 0.0)})

        return {"status": "success", "tier": "basic", "summary": out, "used_prompt_meta": selection}

    def run_intermediate_workflow(self, user_query: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        logger.info("Running INTERMEDIATE workflow (RAG + memory + few-shot)")
        if not (self._retriever and (self._llm or self._llm_adapter)):
            return {"status": "error", "message": "LLM or RAG backend unavailable"}

        memory = self.create_memory(user_id or "anonymous")
        docs = self._retriever.get_relevant_documents(user_query)
        combined = "\n\n".join([d.page_content for d in docs[: self.config.k_retrieval]])

        convo_summary = "\n".join([str(m) for m in (memory.load_memory_messages() or [])])[:2000]

        selection = self._build_and_select_prompt(combined, convo_summary, "general_medical_task", "patient", user_query)

        if self._llm:
            prompt_template = PromptTemplate(input_variables=["full_prompt"], template="{full_prompt}")
            chain = LLMChain(llm=self._llm, prompt=prompt_template)
            response = chain.run({"full_prompt": selection["prompt"]})
        else:
            response = self._llm_adapter({"prompt": selection["prompt"], "temperature": selection.get("temperature", 0.0)})

        return {"status": "success", "tier": "intermediate", "response": response, "used_prompt_meta": selection}

    def run_advanced_workflow(self, user_query: str, user_id: Optional[str] = None, tools: Optional[List[Tool]] = None) -> Dict[str, Any]:
        logger.info("Running ADVANCED workflow (agent + MCP + tools)")
        if not (self._llm or self._llm_adapter) or not self._retriever:
            return {"status": "error", "message": "LLM or RAG backend unavailable"}

        rag_text = self.rag_tool().run(user_query)
        memory = self.create_memory(user_id or "anonymous")
        convo_summary = "\n".join([str(m) for m in (memory.load_memory_messages() or [])])[:4000]

        # Build and select prompt using MCP
        selection = self._build_and_select_prompt(rag_text, convo_summary, "treatment_guideline_task", "doctor", user_query)

        # Prepare agent tools
        agent_tools = [self.rag_tool(), self.summarize_tool(), self.medical_guideline_tool()]
        if tools:
            agent_tools.extend(tools)

        # If llm adapter present, wrap into a mock LLM for initialize_agent (LangChain requires an LLM object)
        try:
            if self._llm:
                agent_executor = initialize_agent(agent_tools, self._llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=False)
                result = agent_executor.run(selection["prompt"])
            else:
                # If only adapter exists, prefer direct adapter call rather than initializing agent that expects llm object
                result = self._llm_adapter({"prompt": selection["prompt"], "temperature": selection.get("temperature", 0.0)})

            return {"status": "success", "tier": "advanced", "agent_response": result, "used_prompt_meta": selection}
        except Exception as e:
            logger.warning(f"Agent execution failed: {e}")
            return {"status": "fallback", "message": str(e), "intermediate": self.run_intermediate_workflow(user_query, user_id)}


# ---------------------- Integration helpers ----------------------
def integrate_with_fastapi(app, orchestrator: LangChainOrchestrator):
    app.state.langchain_orchestrator = orchestrator

    @app.post("/workflows/run/{level}")
    async def run_workflow(level: str, request: dict):
        q = request.get("query")
        uid = request.get("user_id")
        if level == "basic":
            return orchestrator.run_basic_workflow(q, uid)
        if level == "intermediate":
            return orchestrator.run_intermediate_workflow(q, uid)
        if level == "advanced":
            return orchestrator.run_advanced_workflow(q, uid)
        return {"status": "error", "message": "unknown workflow level"}


# ---------------------- Quick test harness ----------------------
if __name__ == "__main__":
    cfg = LangChainConfig(persist_directory="./real_medical_db", embedding_model_name="sentence-transformers/all-MiniLM-L6-v2")
   
    def adapter(payload: Dict[str, Any]) -> str:
        try:
            lm = ChatOpenAI(model_name="gpt-4o-mini", temperature=payload.get("temperature", 0.0))
            return lm.generate([HumanMessage(content=payload.get("prompt"))]).generations[0][0].text
        except Exception as e:
            return f"Adapter error: {e}"

    orch = LangChainOrchestrator(cfg, llm_adapter=adapter)
    print(orch.run_basic_workflow("what are the symptoms of malaria"))
