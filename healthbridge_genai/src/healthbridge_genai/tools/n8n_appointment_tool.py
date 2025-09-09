"""
N8n Appointment Tool for CrewAI - HealthBridge AI

This tool integrates with the n8n appointment booking workflow to handle
doctor appointment scheduling, availability checking, and booking confirmations.
"""

from crewai.tools import BaseTool
from typing import Type, Optional
from pydantic import BaseModel, Field
import requests
import json
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class N8nAppointmentInput(BaseModel):
    """Input schema for N8n Appointment Tool."""
    email: str = Field(
        ..., 
        description="Patient's email address for appointment booking and confirmations"
    )
    desired_time: str = Field(
        ..., 
        description="Desired appointment time in ISO format (e.g., '2025-09-10T10:00')"
    )
    desired_doctor: str = Field(
        ..., 
        description="Name of the desired doctor (e.g., 'Alice Kim')"
    )
    user_message: str = Field(
        ..., 
        description="The original user message or request for context"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session ID for tracking the conversation (optional)"
    )


class N8nAppointmentTool(BaseTool):
    name: str = "Appointment Booking Tool"
    description: str = (
        "Books doctor appointments through the HealthBridge n8n workflow system. "
        "This tool can check doctor availability, book appointments, and handle conflicts. "
        "It automatically checks the doctor's database for existence and availability, "
        "prevents double bookings, and sends confirmation emails when successful. "
        "If the requested time is unavailable, it will suggest alternative slots."
    )
    args_schema: Type[BaseModel] = N8nAppointmentInput
    webhook_url: str = "https://mansolo.app.n8n.cloud/webhook-test/3f50f086-4e26-4fd4-8cf2-0c685c06ed4c"

    def __init__(self, webhook_url: str = None, **kwargs):
        super().__init__(**kwargs)
        # Use the provided webhook URL or default to the one defined above
        if webhook_url:
            self.webhook_url = webhook_url

    def _run(
        self, 
        email: str,
        desired_time: str,
        desired_doctor: str,
        user_message: str,
        session_id: str
    ) -> str:
        """
        Execute the appointment booking request via n8n webhook.
        
        Returns:
            Formatted response with booking confirmation or alternative suggestions
        """
        try:
            # Prepare the payload exactly as your n8n workflow expects
            payload = {
                "email": email,
                "desired_time": desired_time,
                "desired_doctor": desired_doctor,
                "user_message": user_message,
                "session_id": session_id
            }
            
            # Add session_id if provided
            if session_id:
                payload["session_id"] = session_id
            
            logger.info(f"Sending appointment request to n8n: {payload}")
            
            # Make the POST request to n8n webhook
            response = requests.post(
                self.webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30  # 30 second timeout
            )
            
            # Check if request was successful
            response.raise_for_status()
            
            # Parse the response
            response_data = response.json() if response.content else {}
            
            # Extract the response message from n8n
            if isinstance(response_data, dict):
                # Look for common response fields
                message = (
                    response_data.get('message') or 
                    response_data.get('response') or 
                    response_data.get('result') or
                    str(response_data)
                )
            else:
                message = str(response_data)
            
            # Format a comprehensive response for the agent
            formatted_response = self._format_response(payload, message, response.status_code)
            
            logger.info(f"N8n appointment response: {formatted_response}")
            return formatted_response
            
        except requests.exceptions.Timeout:
            error_msg = (
                f"Appointment booking request timed out. Please try again later.\n"
                f"Attempted to book: Dr. {desired_doctor} at {desired_time} for {email}"
            )
            logger.error(error_msg)
            return error_msg
            
        except requests.exceptions.RequestException as e:
            error_msg = (
                f"Failed to connect to appointment booking system. Error: {str(e)}\n"
                f"Please check your internet connection and try again.\n"
                f"Attempted booking: Dr. {desired_doctor} at {desired_time} for {email}"
            )
            logger.error(error_msg)
            return error_msg
            
        except json.JSONDecodeError as e:
            error_msg = (
                f"Received invalid response from booking system. Error: {str(e)}\n"
                f"The appointment system may be experiencing issues. Please try again later."
            )
            logger.error(error_msg)
            return error_msg
            
        except Exception as e:
            error_msg = (
                f"Unexpected error during appointment booking: {str(e)}\n"
                f"Please contact support if this issue persists.\n"
                f"Attempted booking: Dr. {desired_doctor} at {desired_time} for {email}"
            )
            logger.error(error_msg)
            return error_msg

    def _format_response(self, request_payload: dict, n8n_response: str, status_code: int) -> str:
        """
        Format the n8n response into a structured message for the CrewAI agent.
        """
        email = request_payload.get('email', 'Unknown')
        desired_time = request_payload.get('desired_time', 'Unknown')
        desired_doctor = request_payload.get('desired_doctor', 'Unknown')
        
        # Format the datetime for better readability
        try:
            dt = datetime.fromisoformat(desired_time.replace('Z', '+00:00'))
            formatted_time = dt.strftime("%A, %B %d, %Y at %I:%M %p")
        except:
            formatted_time = desired_time
        
        # Create a structured response
        response_header = f"Appointment Booking Request for {email}:\n"
        response_header += f"Doctor: Dr. {desired_doctor}\n"
        response_header += f"Requested Time: {formatted_time}\n"
        response_header += f"Status Code: {status_code}\n\n"
        
        # Add the n8n workflow response
        response_body = f"Booking System Response:\n{n8n_response}\n\n"
        
        # Add helpful context for the agent
        if "confirmed" in n8n_response.lower() or "appointment" in n8n_response.lower():
            response_footer = (
                "✅ This appears to be a successful booking. "
                "Confirmation emails should be sent automatically."
            )
        elif "unavailable" in n8n_response.lower() or "next available" in n8n_response.lower():
            response_footer = (
                "ℹ️ The requested time slot was unavailable. "
                "Alternative options have been provided above."
            )
        else:
            response_footer = (
                "ℹ️ Please review the booking system response above for next steps."
            )
        
        return response_header + response_body + response_footer

    def check_availability(self, doctor_name: str, desired_time: str) -> str:
        """
        Convenience method to check availability without booking.
        This uses the same n8n endpoint but with a specific message indicating it's just a check.
        """
        return self._run(
            email="availability-check@healthbridge.com",  # Placeholder email
            desired_time=desired_time,
            desired_doctor=doctor_name,
            user_message=f"Checking availability for Dr. {doctor_name} at {desired_time}",
            session_id = str(uuid.uuid4())
        )
