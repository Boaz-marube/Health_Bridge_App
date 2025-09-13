#!/usr/bin/env python3
"""
MCP Appointment Booking Server
Bridges MCP <-> n8n webhook
"""

import asyncio
import json
import aiohttp
from mcp.server import Server
from mcp.server.models import Tool, ToolResponse

# Replace with your actual n8n webhook URL
N8N_WEBHOOK_URL = "http://localhost:5678/webhook/appointment"

server = Server("appointment_mcp")

@server.tool(name="appointment_book", description="Book an appointment via n8n webhook")
async def appointment_book(email: str, desired_time: str, desired_doctor: str, user_message: str, session_id: str):
    """Send appointment booking request to n8n."""
    payload = {
        "email": email,
        "desired_time": desired_time,
        "desired_doctor": desired_doctor,
        "user_message": user_message,
        "session_id": session_id,
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(N8N_WEBHOOK_URL, json=payload) as resp:
            data = await resp.json()
            return ToolResponse(content=json.dumps(data))

async def main():
    await server.serve_stdio()

if __name__ == "__main__":
    asyncio.run(main())
