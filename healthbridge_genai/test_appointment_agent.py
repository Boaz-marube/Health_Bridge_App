#!/usr/bin/env python3
"""
Quick test script for the appointment scheduler agent only
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_appointment_agent():
    from healthbridge_genai.crew import create_healthbridge_crew
    
    # Initialize CrewAI
    config_dir = Path(__file__).parent / "src" / "healthbridge_genai" / "config"
    crew, agents, tasks = create_healthbridge_crew(config_dir)
    
    # Test appointment booking
    appointment_query = """
    Hi, I'm John Doe and my email is john.doe@example.com. 
    I'd like to book an appointment with Dr. Alice Kim for Monday, September 16th at 10:00 AM. 
    I need a consultation for my back pain.
    Session ID: 456
    """
    
    # Run just the appointment booking task
    result = tasks["appointment_booking_task"].execute_sync(appointment_query)
    print("🏥 Appointment Agent Response:")
    print(result)

if __name__ == "__main__":
    test_appointment_agent()
