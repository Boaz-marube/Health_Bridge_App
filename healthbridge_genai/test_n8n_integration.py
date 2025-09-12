"""
Test script for the N8n Appointment Tool integration
"""

import sys
import os
from pathlib import Path

# Add the src directory to the Python path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

def test_n8n_appointment_tool():
    """Test the N8nAppointmentTool directly"""
    try:
        from healthbridge_genai.tools.n8n_appointment_tool import N8nAppointmentTool
        
        print("🧪 Testing N8nAppointmentTool...")
        
        # Create an instance of the tool
        tool = N8nAppointmentTool()
        
        # Test data
        test_data = {
            "email": "test@example.com",
            "desired_time": "2025-09-11T14:00",
            "desired_doctor": "Dr. Smith",
            "user_message": "I would like to book an appointment for a checkup",
            "session_id": 42
        }
        
        print(f"🔍 Testing with data: {test_data}")
        
        # Run the tool
        result = tool._run(**test_data)
        
        print("✅ Tool executed successfully!")
        print("📋 Result:")
        print(result)
        print("-" * 50)
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing N8nAppointmentTool: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_crew_integration():
    """Test the CrewAI integration"""
    try:
        from healthbridge_genai.crew_api import analyze_query_and_select_task
        
        print("🧪 Testing query analysis for appointment booking...")
        
        test_queries = [
            "I want to book an appointment with Dr. Alice Kim for Monday",
            "Can I schedule a visit with Dr. Smith next week?",
            "I need to see a doctor, when is Dr. Johnson available?",
            "Book me an appointment please",
            "I have a headache and need to see someone"
        ]
        
        for query in test_queries:
            result = analyze_query_and_select_task(query, "patient")
            print(f"Query: '{query}'")
            print(f"Selected task: {result['task_key']} (confidence: {result['confidence']})")
            print(f"Scores: {result['scores']}")
            print("-" * 30)
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing crew integration: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Starting N8n Appointment Tool Integration Tests")
    print("=" * 60)
    
    # Test 1: Direct tool test
    print("\n📝 Test 1: N8nAppointmentTool Direct Test")
    tool_test = test_n8n_appointment_tool()
    
    # Test 2: CrewAI integration test
    print("\n📝 Test 2: CrewAI Query Analysis Test")
    crew_test = test_crew_integration()
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 60)
    print(f"Direct Tool Test: {'✅ PASSED' if tool_test else '❌ FAILED'}")
    print(f"CrewAI Integration Test: {'✅ PASSED' if crew_test else '❌ FAILED'}")
    
    if tool_test and crew_test:
        print("\n🎉 All tests passed! N8n integration is ready.")
    else:
        print("\n⚠️ Some tests failed. Please check the errors above.")
