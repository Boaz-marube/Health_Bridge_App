# unified_chatbot.py
import asyncio
from crewai import Agent, Task, Crew
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type
from mcp.client import ClientSession
from mcp.client.stdio import stdio_client


# === MCP Wrappers for CrewAI ===

# ---- Appointment Tool ----
class MCPAppointmentInput(BaseModel):
    email: str = Field(..., description="Patient's email address")
    desired_time: str = Field(..., description="Desired appointment time in ISO format")
    desired_doctor: str = Field(..., description="Doctor's name")
    user_message: str = Field(..., description="User's request message")
    session_id: str = Field(..., description="Conversation session ID")


class MCPAppointmentTool(BaseTool):
    name: str = "MCP Appointment Tool"
    description: str = "Books appointments using the MCP appointment server (integrated with n8n)."
    args_schema: Type[BaseModel] = MCPAppointmentInput

    async def _arun(self, **kwargs) -> str:
        async with stdio_client("python", ["mcp_appointment_server.py"]) as (read, write):
            async with ClientSession(read, write) as session:
                result = await session.call_tool("book_appointment", kwargs)
                if result.content and result.content[0].type == "text":
                    return result.content[0].text
                return str(result)

    def _run(self, **kwargs) -> str:
        return asyncio.run(self._arun(**kwargs))


# ---- RAG Tool ----
class MCPRAGInput(BaseModel):
    query_text: str = Field(..., description="Medical question to search for")
    source_type: str = Field(..., description="Source type: 'patient' or 'guideline'")
    user_id: str = Field(default="", description="Optional patient ID for patient records")
    top_k: int = Field(default=3, description="Number of results to return")
    distance_threshold: float = Field(default=1.6, description="Max distance threshold")


class MCPRAGTool(BaseTool):
    name: str = "MCP RAG Tool"
    description: str = "Retrieves medical knowledge via MCP RAG server."
    args_schema: Type[BaseModel] = MCPRAGInput

    async def _arun(self, **kwargs) -> str:
        async with stdio_client("python", ["mcp_rag_server.py"]) as (read, write):
            async with ClientSession(read, write) as session:
                result = await session.call_tool("retrieve_medical_knowledge", kwargs)
                if result.content and result.content[0].type == "text":
                    return result.content[0].text
                return str(result)

    def _run(self, **kwargs) -> str:
        return asyncio.run(self._arun(**kwargs))


# === CrewAI Chatbot Setup ===
def build_chatbot():
    appointment_tool = MCPAppointmentTool()
    rag_tool = MCPRAGTool()

    doctor_agent = Agent(
        role="Doctor Assistant",
        goal="Assist patients with medical knowledge and appointment booking",
        backstory="You are a helpful AI doctor assistant working at HealthBridge Hospital.",
        tools=[appointment_tool, rag_tool],
        allow_delegation=False
    )

    return doctor_agent


# === Run chatbot demo ===
if __name__ == "__main__":
    chatbot = build_chatbot()

    # Example: booking
    booking_task = Task(
        description="Book an appointment with Dr. Smith at 2025-09-12T10:00 for user john@example.com.",
        agent=chatbot
    )

    # Example: medical query
    rag_task = Task(
        description="Retrieve latest guideline information about diabetes treatment.",
        agent=chatbot
    )

    crew = Crew(agents=[chatbot], tasks=[booking_task, rag_task])
    result = crew.run()

    print("\n[FINAL RESULT]")
    print(result)
# Note: Ensure mcp_rag_server.py and mcp_appointment_server.py are implemented and accessible.