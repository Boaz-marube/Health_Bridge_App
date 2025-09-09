#!/usr/bin/env python3
"""
Simple startup script for HealthBridge CrewAI API with n8n appointment booking
"""

import sys
import os
from pathlib import Path

# Add the src directory to Python path
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))

def main():
    print("🏥 HealthBridge AI Server Starting...")
    print("📡 Loading CrewAI API with n8n appointment booking...")
    
    try:
        # Import uvicorn for running the server
        import uvicorn
        
        # Import the main FastAPI app
        from healthbridge_genai.crew_api import app
        
        print("✅ CrewAI API loaded successfully")
        print("🤖 N8n appointment booking integration active")
        print("-" * 50)
        print("🌐 Server will start on: http://0.0.0.0:8000")
        print("📚 API Documentation: http://localhost:8000/docs")
        print("🤖 Chat Endpoint: http://localhost:8000/ai/chat")
        print("📅 Available endpoints:")
        print("  - POST /ai/chat (main chat with n8n booking)")
        print("  - POST /rag/query (RAG-only queries)")
        print("  - GET /status (system status)")
        print("  - POST /analyze-query (query analysis debug)")
        print("-" * 50)
        
        # Start the server
        uvicorn.run(app, host="0.0.0.0", port=8000)
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure you're in the healthbridge_genai directory")
        print("2. Install required packages: pip install fastapi uvicorn")
        print("3. Set environment variables in .env file")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
