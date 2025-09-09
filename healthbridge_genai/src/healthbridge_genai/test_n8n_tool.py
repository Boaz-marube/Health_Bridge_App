"""
Test script for the N8nAppointmentTool
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from tools.n8n_appointment_tool import N8nAppointmentTool

def test_n8n_appointment_tool():
    """Test the N8nAppointmentTool with sample data"""
    
    print("🧪 Testing N8nAppointmentTool...")
    
    # Create an instance of the tool
    tool = N8nAppointmentTool()
    
    # Test data
    test_email = "nderituwahome09@gmail.com"
    test_time = "2025-09-10T10:00"
    test_doctor = "Alice Kim"
    test_message = "Hello I'd like to book an appointment on Monday"
    test_session_id = 13
    
    print(f"📧 Email: {test_email}")
    print(f"⏰ Desired Time: {test_time}")
    print(f"👨‍⚕️ Doctor: {test_doctor}")
    print(f"💬 Message: {test_message}")
    print(f"🔢 Session ID: {test_session_id}")
    print("\n" + "="*50)
    
    try:
        # Call the tool
        result = tool._run(
            email=test_email,
            desired_time=test_time,
            desired_doctor=test_doctor,
            user_message=test_message,
            session_id=test_session_id
        )
        
        print("✅ Tool execution successful!")
        print("\n📋 Result:")
        print(result)
        
    except Exception as e:
        print(f"❌ Tool execution failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_n8n_appointment_tool()
