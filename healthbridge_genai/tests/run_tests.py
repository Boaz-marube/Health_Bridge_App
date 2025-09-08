# run_tests.py
import subprocess
import time
import webbrowser
import threading

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting FastAPI server...")
    subprocess.run([
        "uvicorn", "src.healthbridge_genai.crew_api:app", 
        "--reload", "--host", "0.0.0.0", "--port", "8000"
    ])

def open_test_page():
    """Open the test HTML page"""
    time.sleep(3)  # Wait for server to start
    print("🌐 Opening test page...")
    webbrowser.open("http://localhost:8000/test")

if __name__ == "__main__":
    print("🏥 HealthBridge AI Local Test Environment")
    print("Starting server and opening test page...")
    
    # Start server in a separate thread
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()
    
    # Open test page
    open_test_page()
    
    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")