"""
N8n Appointment Tool for HealthBridge AI

This tool integrates with the n8n workflow for appointment booking.
"""

import requests
import json
from typing import Type, Optional
from crewai.tools import BaseTool
from pydantic import BaseModel, Field


class N8nAppointmentInput(BaseModel):
    """Input schema for N8nAppointmentTool."""
    email: str = Field(..., description="Patient's email address")
    desired_time: str = Field(..., description="Desired appointment time in ISO format (e.g., '2025-09-10T10:00')")
    desired_doctor: str = Field(..., description="Name of the desired doctor")
    user_message: str = Field(..., description="User's message about the appointment request")
    session_id: int = Field(..., description="Session ID for tracking the conversation")


class N8nAppointmentTool(BaseTool):
    name: str = "N8n Appointment Booking Tool"
    description: str = (
        "Books patient appointments through an n8n workflow. "
        "This tool handles appointment scheduling, availability checking, "
        "and provides feedback on available time slots if the requested time is unavailable. "
        "Use this tool when patients want to book, reschedule, or check appointment availability. "
        "Required parameters: email, desired_time (ISO format), desired_doctor, user_message, session_id."
    )
    args_schema: Type[BaseModel] = N8nAppointmentInput
    
    # Class attribute for the webhook URL
    webhook_url: str = "https://mansolo.app.n8n.cloud/webhook/3f50f086-4e26-4fd4-8cf2-0c685c06ed4c"

    def _run(
        self, 
        email: str, 
        desired_time: str, 
        desired_doctor: str, 
        user_message: str, 
        session_id: int
    ) -> str:
        """
        Execute the appointment booking request through n8n workflow.
        
        Args:
            email: Patient's email address
            desired_time: Desired appointment time in ISO format
            desired_doctor: Name of the desired doctor
            user_message: User's message about the appointment
            session_id: Session ID for tracking
            
        Returns:
            Response from the n8n workflow with appointment status or available alternatives
        """
        try:
            # Prepare the payload for the n8n webhook
            payload = {
                "email": email,
                "desired_time": desired_time,
                "desired_doctor": desired_doctor,
                "user_messsage": user_message,  # Note: keeping the typo from the original spec
                "session_id": session_id
            }
            
            # Set headers
            headers = {
                "Content-Type": "application/json"
            }
            
            # Make the POST request to the n8n webhook
            response = requests.post(
                self.webhook_url,
                json=payload,
                headers=headers,
                timeout=30  # 30 seconds timeout
            )
            
            # Check if the request was successful
            response.raise_for_status()
            
            # Parse the response
            result = response.json()
            
            # Extract the response message
            if isinstance(result, dict) and "response" in result:
                appointment_response = result["response"]
            elif isinstance(result, dict) and "output" in result:
                appointment_response = result["output"]
            else:
                appointment_response = str(result)
            
            # Format the response for better readability
            formatted_response = f"""
🏥 **APPOINTMENT BOOKING RESULT**

**Patient Email:** {email}
**Requested Doctor:** {desired_doctor}
**Requested Time:** {desired_time}

**Response:**
{appointment_response}

**Session ID:** {session_id}
            """.strip()
            
            return formatted_response
            
        except requests.exceptions.RequestException as e:
            error_message = f"""
❌ **APPOINTMENT BOOKING ERROR**

There was an error processing your appointment request:
{str(e)}

Please try again later or contact the hospital directly.

**Requested Details:**
- Email: {email}
- Doctor: {desired_doctor}
- Time: {desired_time}
            """.strip()
            return error_message
            
        except Exception as e:
            error_message = f"""
❌ **UNEXPECTED ERROR**

An unexpected error occurred while booking your appointment:
{str(e)}

Please contact the hospital directly for assistance.

**Requested Details:**
- Email: {email}
- Doctor: {desired_doctor}
- Time: {desired_time}
            """.strip()
            return error_message
