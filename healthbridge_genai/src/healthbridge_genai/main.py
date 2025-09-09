#!/usr/bin/env python3
"""
HealthBridge CLI & CrewAI entrypoint.

CLI Examples:
  python -m src.healthbridge_genai.main --all
  python -m src.healthbridge_genai.main --task symptom_check_task
"""

import argparse
import logging
import sys
from pathlib import Path

from .crew import (
    create_healthbridge_crew,
    run_single_task_by_key,
    run_all_tasks_sequentially,
)

logger = logging.getLogger("healthbridge")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)


def parse_args():
    parser = argparse.ArgumentParser(description="HealthBridge Multi-Agent Orchestrator")

    # Auto-detect config dir relative to this file
    default_config_dir = Path(__file__).parent / "config"

    parser.add_argument(
        "--config-dir",
        default=str(default_config_dir),
        help="Directory containing agents.yaml and tasks.yaml",
    )
    
    parser.add_argument(
        "--input",
        type=str,
        help="Input text/query to provide to the agent(s)",
    )
    
    group = parser.add_mutually_exclusive_group(required=False)
    group.add_argument("--all", action="store_true", help="Run all tasks sequentially")
    group.add_argument(
        "--task",
        type=str,
        help="Run a single task by its key from tasks.yaml (e.g., appointment_booking_task)",
    )
    args = parser.parse_args()

    # Default to --all if nothing provided
    if not args.all and not args.task:
        args.all = True

    return args


def main() -> int:
    args = parse_args()
    config_dir = Path(args.config_dir)

    try:
        crew, agents_map, tasks_map = create_healthbridge_crew(config_dir)
    except Exception as e:
        logger.exception("Failed to initialize crew: %s", e)
        return 1

    try:
        if args.all:
            logger.info("Running all tasks sequentially…")
            results = run_all_tasks_sequentially(tasks_map, user_input=args.input)
            print("\n=== RESULTS (All Tasks) ===")
            for key, res in results.items():
                print(f"\n--- {key} ---\n{res}\n")
        else:
            task_key = args.task.strip()
            logger.info("Running single task: %s", task_key)
            res = run_single_task_by_key(crew, tasks_map, task_key, user_input=args.input)
            print(f"\n=== RESULT ({task_key}) ===\n{res}\n")

        return 0
    except KeyboardInterrupt:
        logger.warning("Interrupted by user.")
        return 130
    except Exception as e:
        logger.exception("Run failed: %s", e)
        return 1


def run():
    """CrewAI entrypoint"""
    return main()


if __name__ == "__main__":
    sys.exit(main())
