# src/healthbridge/crew_service.py
from __future__ import annotations
import logging
from pathlib import Path
from threading import RLock
from typing import Dict, Tuple, Optional, Any

from .crew import create_healthbridge_crew, run_single_task_by_key

logger = logging.getLogger("healthbridge.crew_service")

class CrewService:
    def __init__(self):
        self._lock = RLock()
        self.crew: Optional[Any] = None
        self.agents: Optional[Dict[str, Any]] = None
        self.tasks: Optional[Dict[str, Any]] = None
        self.config_dir: Optional[Path] = None
        self.db_path: Optional[str] = None

    def create_crew(self, config_dir: str, db_path: Optional[str] = None) -> Tuple[int, int]:
        with self._lock:
            cfg_dir_path = Path(config_dir)
            crew, agents_map, tasks_map = create_healthbridge_crew(cfg_dir_path, db_path=db_path)
            self.crew = crew
            self.agents = agents_map
            self.tasks = tasks_map
            self.config_dir = cfg_dir_path
            self.db_path = db_path
            logger.info("CrewService: crew created with %d agents and %d tasks", len(agents_map), len(tasks_map))
            return len(agents_map), len(tasks_map)

    def get_agents(self):
        with self._lock:
            return list(self.agents.keys()) if self.agents else []

    def get_tasks(self):
        with self._lock:
            return list(self.tasks.keys()) if self.tasks else []

    def run_task(self, task_key: str, inputs: Optional[Dict[str, Any]] = None) -> str:
        with self._lock:
            if not self.crew or not self.tasks:
                raise RuntimeError("Crew not initialized. Call /crew/create first.")
            if task_key not in self.tasks:
                raise KeyError(f"Unknown task key: {task_key}")

            # Pass the inputs to the task execution
            try:
                # Use your existing run_single_task_by_key function
                # Make sure it can accept context/inputs
                result = run_single_task_by_key(self.crew, self.tasks, task_key, inputs or {})
                return str(result)
            except Exception as e:
                logger.error(f"Task execution failed: {e}")
                # Provide meaningful fallback based on task type
                if "treatment" in task_key:
                    return "I need more specific information about the medical condition to provide treatment guidelines. Please specify the condition and any relevant patient details."
                elif "symptom" in task_key:
                    return "Please describe the symptoms in more detail, including duration, severity, and any associated factors."
                else:
                    return "I need more information to assist you properly. Please provide additional details about your query."