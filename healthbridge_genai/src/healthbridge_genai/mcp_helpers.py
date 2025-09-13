import asyncio
from mcp.client.stdio import stdio_client

# -------------------------
# RAG MCP helper
# -------------------------
async def rag_mcp_call(query_text: str, user_id: str, source_type: str = "guideline", top_k: int = 3, distance_threshold: float = 1.6):
    """
    Call the MCP RAG server to retrieve relevant medical knowledge.
    """
    async with stdio_client() as (read_stream, write_stream):
        # Instead of Client, we directly send tool calls through stdio_client
        tool_name = "retrieve_medical_knowledge"
        args = {
            "query_text": query_text,
            "source_type": source_type,
            "user_id": user_id,
            "top_k": top_k,
            "distance_threshold": distance_threshold
        }

        # write request
        await write_stream.write({
            "method": "tools/call",
            "params": {"name": tool_name, "arguments": args},
            "id": "rag-call"
        })

        # read response
        async for message in read_stream:
            if message.get("id") == "rag-call":
                return message["result"]["content"][0]["text"]

    return None

# -------------------------
# Appointment MCP helper
# -------------------------
async def appointment_mcp_call(email: str, desired_time: str, desired_doctor: str, user_message: str, session_id: str):
    """
    Call the MCP Appointment server to book an appointment through n8n.
    """
    async with stdio_client() as (read_stream, write_stream):
        tool_name = "book_appointment"
        args = {
            "email": email,
            "desired_time": desired_time,
            "desired_doctor": desired_doctor,
            "user_message": user_message,
            "session_id": session_id
        }

        await write_stream.write({
            "method": "tools/call",
            "params": {"name": tool_name, "arguments": args},
            "id": "appt-call"
        })

        async for message in read_stream:
            if message.get("id") == "appt-call":
                return message["result"]["content"][0]["text"]

    return None
