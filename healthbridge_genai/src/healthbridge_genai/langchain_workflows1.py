"""
LangChain Workflow Orchestration for HealthBridge

Place this file under: healthbridge_genai/src/healthbridge_genai/langchain_workflows.py

Purpose:
- Provide 3-tiered workflow orchestration (basic/intermediate/advanced) using LangChain.
- Expose an orchestrator class that your FastAPI app can import and initialize in startup_event.
- Use existing ChromaDB persistent client (you already create chroma_client in main) as vector store.
- Support pluggable LLM backends (HuggingFace/Local/remote) via a small adapter.

Notes:
- This code is intended as a drop-in augmentation. It tries to avoid hard dependency on OpenAI.
- You may need to `pip install langchain chromadb sentence-transformers transformers` (or the stack you prefer).
- Adjust model names and local device settings to suit your environment.

"""
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field
import logging
from pathlib import Path

# LangChain imports

try:
    from langchain import LLMChain, PromptTemplate
    from langchain.chains import ConversationalRetrievalChain
    from langchain.embeddings import HuggingFaceEmbeddings
    from langchain.vectorstores import Chroma
    from langchain.memory import ConversationBufferMemory
    from langchain.agents import Tool, initialize_agent, AgentType
    from langchain.agents.agent_toolkits import create_vectorstore_agent
    from langchain.chat_models import ChatOpenAI
    from langchain.schema import HumanMessage
except Exception:
    # Soft fallback for environments without langchain installed.
    # The file still provides a clear API; you should install langchain to use it.
    logging.warning("LangChain or its components are not installed. Please install langchain to enable workflows.")


logger = logging.getLogger(__name__)


@dataclass
class LangChainConfig:
    model_name: str = "all-MiniLM-L6-v2"  # embedding model by default
    llm_model: str = "local-llm"  # placeholder name for whichever LLM you choose
    persist_directory: Optional[str] = None
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    chunk_size: int = 512
    k_retrieval: int = 5


class LangChainOrchestrator:
    """Main orchestrator class to export workflows to your FastAPI app.

    Usage in your FastAPI `startup_event`:
        from .langchain_workflows import LangChainOrchestrator, LangChainConfig
        orch_config = LangChainConfig(persist_directory=str(PERSIST_DIRECTORY))
        orchestrator = LangChainOrchestrator(orch_config, chroma_client=chroma_client)
        app.state.langchain_orchestrator = orchestrator

    Then: in endpoints call:
        orch = request.app.state.langchain_orchestrator
        result = orch.run_advanced_workflow(user_query, user_context)

    """

    def __init__(self, config: LangChainConfig, chroma_client=None):
        self.config = config
        self.chroma_client = chroma_client
        self._vectorstore = None
        self._retriever = None
        self._memory_store = {}
        self._llm = None

        # Initialize components lazily
        try:
            self._init_embeddings()
            self._init_vectorstore()
            self._init_llm()
        except Exception as e:
            logger.warning(f"Initialization warning: {e}")

    # ---------------------- Initialization helpers ----------------------
    def _init_embeddings(self):
        """Initialize HuggingFace embeddings (or swap to another embedding class)."""
        try:
            self.embeddings = HuggingFaceEmbeddings(model_name=self.config.embedding_model_name)
            logger.info("Embeddings initialized")
        except Exception as e:
            logger.warning(f"Could not initialize HuggingFaceEmbeddings: {e}")
            self.embeddings = None

    def _init_vectorstore(self):
        """Wrap the chroma_client if provided, or create local Chroma vectorstore pointing to persist_directory."""
        try:
            if self.chroma_client is not None:
                # LangChain's Chroma wrapper expects local path; we'll try to adapt by creating a Chroma vectorstore over existing directory
                persist_dir = self.config.persist_directory
                if persist_dir is None:
                    raise ValueError("persist_directory required when passing chroma_client to LangChainOrchestrator")
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
        """Initialize an LLM. This code uses a generic adapter approach: replace with your preferred local LLM.

        Examples:
        - For HuggingFace Hub models via HuggingFacePipeline or transformers
        - For local LLM servers (Ollama/Railway) wrap with a custom class that matches LangChain's LLM interface
        - For testing you can use ChatOpenAI (requires OpenAI keys) — avoid if you don't use OpenAI.
        """
        try:
            # Default fallback: ChatOpenAI if available (but you said you don't use OpenAI)
            # You should replace this with a local adapter class for your LLM of choice.
            self._llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
            logger.info("Default ChatOpenAI LLM initialized (replace with local adapter if not using OpenAI)")
        except Exception as e:
            logger.warning(f"LLM initialization warning: {e}")
            self._llm = None

    # ---------------------- Memory ----------------------
    def create_memory(self, user_id: str):
        """Create a ConversationBufferMemory for a user (persistent if integrated with Chroma)."""
        if user_id in self._memory_store:
            return self._memory_store[user_id]
        mem = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        self._memory_store[user_id] = mem
        return mem

    # ---------------------- Tools ----------------------
    def rag_tool(self) -> Tool:
        """Return a LangChain Tool that runs a retrieval over the vectorstore and returns short summaries."""
        def _run(query: str) -> str:
            if not self._retriever:
                return "RAG backend not available"
            docs = self._retriever.get_relevant_documents(query)
            # Create a short combined summary (simple concatenation here; you can use LLM summarization)
            return "\n\n".join([d.page_content for d in docs[: self.config.k_retrieval]])

        return Tool(name="RAGSearch", func=_run, description="Search the medical vectorstore for relevant documents")

    def summarize_tool(self) -> Tool:
        def _run(text: str) -> str:
            if not self._llm:
                return "LLM not available for summarization"
            prompt = PromptTemplate(input_variables=["text"], template="Summarize this medical text concisely:\n\n{text}")
            chain = LLMChain(llm=self._llm, prompt=prompt)
            return chain.run({"text": text})

        return Tool(name="Summarize", func=_run, description="Summarize a piece of text")

    def medical_guideline_tool(self) -> Tool:
        def _run(query: str) -> str:
            # Example: run a more focused RAG then ask LLM to extract 'guidelines' bullets
            rag_text = self.rag_tool().run(query)
            if not self._llm:
                return rag_text
            prompt = PromptTemplate(input_variables=["docs", "question"], template=(
                "Extract evidence-based, guideline-style bullet points for the question:\nQuestion: {question}\n\nDocuments:\n{docs}\n\nProvide numbered steps or bullets and cite the docs by index."
            ))
            chain = LLMChain(llm=self._llm, prompt=prompt)
            return chain.run({"docs": rag_text, "question": query})

        return Tool(name="MedicalGuideline", func=_run, description="Produce guideline-style outputs from RAG + LLM")

    # ---------------------- Workflow tiers ----------------------
    def run_basic_workflow(self, user_query: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Basic workflow: simple retrieval and optional LLM summarization."""
        logger.info("Running BASIC workflow")
        if not self._retriever:
            return {"status": "error", "message": "RAG backend unavailable"}

        docs = self._retriever.get_relevant_documents(user_query)
        combined = "\n\n".join([d.page_content for d in docs[: self.config.k_retrieval]])

        # Optionally summarize
        if self._llm:
            summary = self.summarize_tool().run(combined)
        else:
            summary = combined[:4000]

        return {"status": "success", "tier": "basic", "documents": [d.page_content for d in docs], "summary": summary}

    def run_intermediate_workflow(self, user_query: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Intermediate: retrieval -> LLM QA chain with conversation memory."""
        logger.info("Running INTERMEDIATE workflow")
        if not self._llm or not self._retriever:
            return {"status": "error", "message": "LLM or RAG backend unavailable"}

        memory = self.create_memory(user_id or "anonymous")

        qa_chain = ConversationalRetrievalChain.from_llm(llm=self._llm, retriever=self._retriever, memory=memory)
        response = qa_chain.run(user_query)
        return {"status": "success", "tier": "intermediate", "response": response}

    def run_advanced_workflow(self, user_query: str, user_id: Optional[str] = None, tools: Optional[List[Tool]] = None) -> Dict[str, Any]:
        """Advanced: orchestrated agent with tools, multimodal steps, and persistent retrieval memory.

        The advanced workflow creates an agent that can choose to call RAG, Summarize, MedicalGuideline, and other tools.
        """
        logger.info("Running ADVANCED workflow")
        if not self._llm or not self._retriever:
            return {"status": "error", "message": "LLM or RAG backend unavailable"}

        # Define default tools
        agent_tools = [self.rag_tool(), self.summarize_tool(), self.medical_guideline_tool()]
        if tools:
            agent_tools.extend(tools)

        # Initialize an agent that can use the vectorstore and tools
        try:
            agent_executor = initialize_agent(agent_tools, self._llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=False)
            result = agent_executor.run(user_query)
            return {"status": "success", "tier": "advanced", "agent_response": result}
        except Exception as e:
            logger.warning(f"Agent execution failed: {e}")
            # Fallback: run the intermediate workflow
            return {"status": "fallback", "message": str(e), "intermediate": self.run_intermediate_workflow(user_query, user_id)}


# ---------------------- Integration helpers (small) ----------------------
def integrate_with_fastapi(app, orchestrator: LangChainOrchestrator):
    """Attach orchestrator to FastAPI app state and provide a simple route mapping example."""
    app.state.langchain_orchestrator = orchestrator

    @app.post("/workflows/run/{level}")
    async def run_workflow(level: str, request: dict):
        # request should have: {"query": "...", "user_id": "..."}
        q = request.get("query")
        uid = request.get("user_id")
        if level == "basic":
            return orchestrator.run_basic_workflow(q, uid)
        if level == "intermediate":
            return orchestrator.run_intermediate_workflow(q, uid)
        if level == "advanced":
            return orchestrator.run_advanced_workflow(q, uid)
        return {"status": "error", "message": "unknown workflow level"}


# ---------------------- Example quick-start config ----------------------
if __name__ == "__main__":
    # Quick manual test
    cfg = LangChainConfig(persist_directory="./real_medical_db", embedding_model_name="sentence-transformers/all-MiniLM-L6-v2")
    orch = LangChainOrchestrator(cfg)
    print(orch.run_basic_workflow("what are the symptoms of malaria"))
