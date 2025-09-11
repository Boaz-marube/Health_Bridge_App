#!/usr/bin/env python3
"""
HealthBridge FastAPI Server Startup Script

This script starts the HealthBridge FastAPI server with the /ai/chat endpoint
and n8n appointment booking integration.

Usage:
    python run_server.py [--port 8000] [--host 0.0.0.0] [--api crew_api]

Available APIs:
    - crew_api: Full CrewAI with authentication (recommended)
    - with_login: CrewAI with login system
    - working_api: Simple CrewAI without authentication
"""

import argparse
import sys
import os
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
 

# Add the src directory to Python path
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))

def parse_args():
    parser = argparse.ArgumentParser(description="Start HealthBridge FastAPI Server")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to (default: 8000)")
    parser.add_argument("--api", choices=["crew_api", "with_login", "working_api"], 
                       default="crew_api", help="Which API module to use (default: crew_api)")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    return parser.parse_args()

def main():
    args = parse_args()
    
    print("🏥 Starting HealthBridge AI Server...")
    print(f"📡 API Module: {args.api}")
    print(f"🌐 Server URL: http://{args.host}:{args.port}")
    print(f"📚 API Docs: http://{args.host}:{args.port}/docs")
    print(f"🤖 Chat Endpoint: http://{args.host}:{args.port}/ai/chat")
    print("-" * 50)
    
    try:
        import uvicorn
        
        # Import the selected API module
        if args.api == "crew_api":
            from healthbridge_genai.crew_api import app
            print("✅ Using crew_api (with authentication)")
        elif args.api == "with_login":
            from healthbridge_genai.with_login import app
            print("✅ Using with_login (with login system)")
        elif args.api == "working_api":
            from healthbridge_genai.working_api import app
            print("✅ Using working_api (simple, no auth)")
        
        # Check if required environment variables are set
        required_env_vars = ["GROQ_API_KEY", "GOOGLE_API_KEY"]
        missing_vars = [var for var in required_env_vars if not os.getenv(var)]
        
        if missing_vars:
            print(f"⚠️  Warning: Missing environment variables: {missing_vars}")
            print("   Set these in your .env file or environment")
            print()
        
        print("🚀 Starting server...")
        
        # Start the server
        uvicorn.run(
            app,
            host=args.host,
            port=args.port,
            reload=args.reload,
            log_level="debug" if args.debug else "info"
        )
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("\nMake sure you have installed the required dependencies:")
        print("  pip install fastapi uvicorn")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
