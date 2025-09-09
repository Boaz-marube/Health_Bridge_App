"""
Crew setup for HealthBridge.

- Loads YAML configs for agents and tasks
- Builds CrewAI Agents and Tasks
- Exposes helpers to run one or all tasks
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Dict, Tuple, List

from dotenv import load_dotenv

try:
    from crewai import Agent, Task, Crew, Process
except ImportError as e:
    raise ImportError(
        "crewai is not installed. Please install it first:\n\n"
        "  pip install crewai crewai-tools\n"
    ) from e

try:
    import yaml
except ImportError as e:
    raise ImportError(
        "PyYAML is not installed. Please install it first:\n\n"
        "  pip install pyyaml\n"
    ) from e

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from crewai.llm import LLM
except ImportError as e:
    raise ImportError(
        "Required packages not installed. Please install them first:\n\n"
        "  pip install langchain-google-genai\n"
        "  pip install litellm\n"
    ) from e

# Import our custom RAG tools
from .tools import PatientRAGTool, GuidelineRAGTool, create_rag_tool, N8nAppointmentTool

logger = logging.getLogger("healthbridge.crew")

# ---------------------------
# LLM Configuration
# ---------------------------

def _create_gemini_llm():
    """Create a Gemini 1.5 LLM instance for CrewAI agents using LiteLLM format."""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError(
            "GOOGLE_API_KEY not found in environment variables. "
            "Please add your Gemini API key to your .env file:\n"
            "GOOGLE_API_KEY=your_api_key_here"
        )
    
    # Set the environment variable for LiteLLM
    os.environ["GOOGLE_API_KEY"] = api_key
    
    # Use CrewAI's LLM wrapper with proper LiteLLM format
    llm = LLM(
        model="gemini/gemini-1.5-flash",  # LiteLLM format: provider/model
        temperature=0.1,
        api_key=api_key
    )
    
    logger.info("Gemini 1.5 LLM initialized successfully with LiteLLM format")
    return llm

# ---------------------------
# YAML loading
# ---------------------------

def _read_yaml(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}

# ---------------------------
# Builders
# ---------------------------

def _build_agents(agents_cfg: dict, db_path: str = None) -> Dict[str, Agent]:
    """Create CrewAI Agent objects from agents.yaml with appropriate RAG tools."""
    agents: Dict[str, Agent] = {}
    
    # Initialize Gemini LLM
    llm = _create_gemini_llm()
    
    # Initialize RAG tools
    patient_rag_tool = PatientRAGTool(db_path=db_path)
    guideline_rag_tool = GuidelineRAGTool(db_path=db_path)
    general_rag_tool = create_rag_tool("general", db_path=db_path)
    
    # Initialize N8n appointment tool
    n8n_appointment_tool = N8nAppointmentTool()
    
    for key, spec in agents_cfg.items():
        role = (spec.get("role") or "").strip()
        goal = (spec.get("goal") or "").strip()
        backstory = (spec.get("backstory") or "").strip()

        # Assign appropriate tools based on agent type
        tools = []
        if key == "medical_history_agent":
            # Medical history agent gets patient records tool
            tools = [patient_rag_tool]
        elif key == "treatment_guideline_agent":
            # Treatment guideline agent gets medical guidelines tool
            tools = [guideline_rag_tool]
        elif key == "symptom_checker_agent":
            # Symptom checker might need both patient records and guidelines
            tools = [patient_rag_tool, guideline_rag_tool]
        elif key == "appointment_scheduler_agent":
            # Appointment scheduler gets the n8n appointment booking tool
            tools = [n8n_appointment_tool]
        # Other agents can use the general RAG tool if needed
        # elif key in ["queue_monitoring_agent", "analytics_agent"]:
        #     tools = [general_rag_tool]
        elif key == "general_medical_agent":
            # General medical agent uses guidelines RAG if relevant
            tools = [guideline_rag_tool, general_rag_tool]



        agent = Agent(
            role=role or key,
            goal=goal or f"Execute responsibilities for {key}",
            backstory=backstory or "",
            tools=tools,
            llm=llm,  # Add Gemini LLM to each agent
            allow_delegation=False,
            verbose=True,
        )
        agents[key] = agent
        tool_names = [tool.name for tool in tools]
        logger.debug("Built agent: %s -> %s with tools: %s", key, role, tool_names)
    return agents


def _build_tasks(tasks_cfg: dict, agents: Dict[str, Agent]) -> Dict[str, Task]:
    """Create CrewAI Task objects from tasks.yaml, wiring to the proper agent."""
    tasks: Dict[str, Task] = {}
    for key, spec in tasks_cfg.items():
        desc = (spec.get("description") or "").strip()
        expected = (spec.get("expected_output") or "").strip()
        agent_key = (spec.get("agent") or "").strip()

        if not agent_key or agent_key not in agents:
            raise ValueError(
                f"Task '{key}' references unknown agent '{agent_key}'. "
                f"Known agents: {list(agents.keys())}"
            )

        disclaimer = (
            "\n\n[Safety Note]\n"
            "This output is for informational purposes only and is not a substitute "
            "for professional medical advice, diagnosis, or treatment. "
            "Always consult a qualified clinician for medical decisions."
        )

        task = Task(
            description=desc + disclaimer,
            expected_output=expected,
            agent=agents[agent_key],
            async_execution=False,
        )
        tasks[key] = task
        logger.debug("Built task: %s -> agent=%s", key, agent_key)
    return tasks

# ---------------------------
# Public API
# ---------------------------

def create_healthbridge_crew(config_dir: Path, db_path: str = None) -> Tuple[Crew, Dict[str, Agent], Dict[str, Task]]:
    """Build the Crew, returning (crew, agents_map, tasks_map)."""
    load_dotenv()

    config_dir = Path(config_dir)
    agents_cfg = _read_yaml(config_dir / "agents.yaml")
    tasks_cfg = _read_yaml(config_dir / "tasks.yaml")

    if not isinstance(agents_cfg, dict) or not agents_cfg:
        raise ValueError("agents.yaml must be a non-empty mapping")
    if not isinstance(tasks_cfg, dict) or not tasks_cfg:
        raise ValueError("tasks.yaml must be a non-empty mapping")

    agents_map = _build_agents(agents_cfg, db_path=db_path)
    tasks_map = _build_tasks(tasks_cfg, agents_map)

    crew = Crew(
        agents=list(agents_map.values()),
        tasks=list(tasks_map.values()),
        verbose=True,
        process=Process.sequential,
    )

    logger.info(
        "Crew created with %d agents and %d tasks",
        len(agents_map),
        len(tasks_map),
    )
    return crew, agents_map, tasks_map


def run_single_task_by_key(crew: Crew, tasks_map: Dict[str, Task], task_key: str, user_input: str = None) -> str:
    """Execute a single task by its key from tasks.yaml."""
    if task_key not in tasks_map:
        raise KeyError(f"Unknown task key: {task_key}. Available: {list(tasks_map.keys())}")

    single_task = tasks_map[task_key]
    
    # If user input is provided, modify the task description to include it
    if user_input:
        original_description = single_task.description
        enhanced_description = f"""
User Request: "{user_input}"

{original_description}

Please process the above user request according to your role and responsibilities.
"""
        single_task.description = enhanced_description
    
    mini = Crew(
        agents=[single_task.agent],
        tasks=[single_task],
        verbose=True,
        process=Process.sequential,
    )
    result = mini.kickoff()
    return str(result)


def run_all_tasks_sequentially(tasks_map: Dict[str, Task], user_input: str = None) -> Dict[str, str]:
    """Execute all tasks one by one, return outputs keyed by task name."""
    outputs: Dict[str, str] = {}
    for key, task in tasks_map.items():
        try:
            # If user input is provided, modify the task description to include it
            if user_input:
                original_description = task.description
                enhanced_description = f"""
User Request: "{user_input}"

{original_description}

Please process the above user request according to your role and responsibilities.
"""
                task.description = enhanced_description
            
            mini = Crew(
                agents=[task.agent],
                tasks=[task],
                verbose=True,
                process=Process.sequential,
            )
            result = mini.kickoff()
            outputs[key] = str(result)
        except Exception as e:
            outputs[key] = f"[ERROR] {e}"
    return outputs
