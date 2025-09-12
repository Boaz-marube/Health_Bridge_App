"""
Simple API endpoint to test N8n appointment booking integration.
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import sys
from pathlib import Path

# Add the src directory to Python path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir / "src"))

try:
    from healthbridge_genai.tools.n8n_appointment_tool import N8nAppointmentTool
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure you're running this from the healthbridge_genai directory")
    sys.exit(1)

app = FastAPI(title="HealthBridge N8n Appointment API", version="1.0.0")


class AppointmentRequest(BaseModel):
    email: str
    desired_time: str  # ISO format like "2025-09-16T10:00"
    desired_doctor: str
    user_message: str
    session_id: int


class AppointmentResponse(BaseModel):
    status: str
    result: str
    request_details: dict


@app.post("/book-appointment", response_model=AppointmentResponse)
async def book_appointment(request: AppointmentRequest):
    """
    Book an appointment using the N8n workflow integration.
    """
    try:
        # Initialize the N8n appointment tool
        tool = N8nAppointmentTool()
        
        # Execute the appointment booking
        result = tool._run(
            email=request.email,
            desired_time=request.desired_time,
            desired_doctor=request.desired_doctor,
            user_message=request.user_message,
            session_id=request.session_id
        )
        
        return AppointmentResponse(
            status="success",
            result=result,
            request_details={
                "email": request.email,
                "desired_time": request.desired_time,
                "desired_doctor": request.desired_doctor,
                "session_id": request.session_id
            }
        )
        
    except Exception as e:
        return AppointmentResponse(
            status="error",
            result=f"Error booking appointment: {str(e)}",
            request_details=request.dict()
        )


@app.get("/")
async def root():
    return {
        "message": "HealthBridge N8n Appointment Booking API",
        "endpoints": {
            "POST /book-appointment": "Book an appointment using N8n workflow",
            "GET /docs": "API documentation"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Test if the N8n tool can be initialized
        tool = N8nAppointmentTool()
        return {"status": "healthy", "n8n_tool": "available"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    print("🏥 Starting HealthBridge N8n Appointment API...")
    print("📚 API docs available at: http://localhost:8000/docs")
    print("🔧 Test endpoint: http://localhost:8000/book-appointment")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
