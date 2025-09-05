"""
Crew setup for HealthBridge.

- Loads YAML configs for agents and tasks
- Builds CrewAI Agents and Tasks
- Exposes helpers to run one or all tasks
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, Tuple

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

logger = logging.getLogger("healthbridge.crew")

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

def _build_agents(agents_cfg: dict) -> Dict[str, Agent]:
    """Create CrewAI Agent objects from agents.yaml."""
    agents: Dict[str, Agent] = {}
    for key, spec in agents_cfg.items():
        role = (spec.get("role") or "").strip()
        goal = (spec.get("goal") or "").strip()
        backstory = (spec.get("backstory") or "").strip()

        agent = Agent(
            role=role or key,
            goal=goal or f"Execute responsibilities for {key}",
            backstory=backstory or "",
            allow_delegation=False,
            verbose=True,
        )
        agents[key] = agent
        logger.debug("Built agent: %s -> %s", key, role)
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

def create_healthbridge_crew(config_dir: Path) -> Tuple[Crew, Dict[str, Agent], Dict[str, Task]]:
    """Build the Crew, returning (crew, agents_map, tasks_map)."""
    load_dotenv()

    config_dir = Path(config_dir)
    agents_cfg = _read_yaml(config_dir / "agents.yaml")
    tasks_cfg = _read_yaml(config_dir / "tasks.yaml")

    if not isinstance(agents_cfg, dict) or not agents_cfg:
        raise ValueError("agents.yaml must be a non-empty mapping")
    if not isinstance(tasks_cfg, dict) or not tasks_cfg:
        raise ValueError("tasks.yaml must be a non-empty mapping")

    agents_map = _build_agents(agents_cfg)
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


def run_single_task_by_key(crew: Crew, tasks_map: Dict[str, Task], task_key: str) -> str:
    """Execute a single task by its key from tasks.yaml."""
    if task_key not in tasks_map:
        raise KeyError(f"Unknown task key: {task_key}. Available: {list(tasks_map.keys())}")

    single_task = tasks_map[task_key]
    mini = Crew(
        agents=[single_task.agent],
        tasks=[single_task],
        verbose=True,
        process=Process.sequential,
    )
    result = mini.kickoff()
    return str(result)


def run_all_tasks_sequentially(tasks_map: Dict[str, Task]) -> Dict[str, str]:
    """Execute all tasks one by one, return outputs keyed by task name."""
    outputs: Dict[str, str] = {}
    for key, task in tasks_map.items():
        try:
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
