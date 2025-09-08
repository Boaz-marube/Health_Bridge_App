from fastapi import FastAPI, Request
from pydantic import BaseModel
from chromadb import PersistentClient
from typing import Optional, Dict, List
import sys
from pathlib import Path
import json
import re

# ---- CONFIG ----
PERSIST_DIRECTORY = r"C:\Users\IdeaPad-320\Desktop\health_bridge_second\Health_Bridge_App\healthbridge_genai\real_medical_db"

# Add the path to your crew module
sys.path.append(r"C:\Users\IdeaPad-320\Desktop\health_bridge_second\Health_Bridge_App\healthbridge_genai\real_medical_db")

# ---- FASTAPI APP ----
app = FastAPI(title="HealthBridge AI API", version="1.0.0")

# ---- GLOBAL CHROMA CLIENT ----
chroma_client = PersistentClient(path=PERSIST_DIRECTORY)

# Global variables for CrewAI
crew = None
agents_map = None
tasks_map = None

# ---- REQUEST MODELS ----
class ChatRequest(BaseModel):
    user_id: str
    message: str

# ---- STARTUP EVENT ----
@app.on_event("startup")
async def startup_event():
    """Runs once when FastAPI starts — check DB status and initialize CrewAI."""
    print(f"📂 Loading ChromaDB from: {PERSIST_DIRECTORY}")

    collections = chroma_client.list_collections()
    print(f"✅ Collections found: {[c.name for c in collections]}")

    if collections:
        for c in collections:
            stats = c.count()
            print(f"📄 Number of documents in collection '{c.name}': {stats}")
    
    # Initialize CrewAI
    try:
        from .crew import create_healthbridge_crew
        config_dir = Path(r"C:\Users\IdeaPad-320\Desktop\health_bridge_second\Health_Bridge_App\healthbridge_genai\src\healthbridge_genai\config")
        global crew, agents_map, tasks_map
        crew, agents_map, tasks_map = create_healthbridge_crew(config_dir)
        print("✅ CrewAI initialized successfully")
        print(f"🤖 Available agents: {list(agents_map.keys())}")
        print(f"📋 Available tasks: {list(tasks_map.keys())}")
    except Exception as e:
        print(f"⚠️ CrewAI initialization failed: {e}")

# ---- ENHANCED TASK SELECTION LOGIC ----
def analyze_query_and_select_task(query: str) -> Dict:
    """
    Advanced query analysis to determine the most appropriate task type.
    Returns both the task key and confidence score.
    """
    query_lower = query.lower()
    
    # Define task patterns with weights
    task_patterns = {
        "symptom_checker_task": {
            "keywords": ["symptom", "pain", "ache", "feel", "hurt", "unwell", "nausea", 
                        "dizziness", "fever", "headache", "cough", "shortness of breath",
                        "rash", "swelling", "fatigue", "weakness", "what does", "what could"],
            "weight": 1.0
        },
        "treatment_guideline_task": {
            "keywords": ["treatment", "medication", "therapy", "prescription", "drug",
                        "how to treat", "cure", "remedy", "management", "intervention",
                        "dosage", "medicate", "what medicine", "what drug", "should i take"],
            "weight": 1.0
        },
        "medical_history_task": {
            "keywords": ["history", "record", "previous", "past", "diagnosis", "chronic",
                        "condition", "allergy", "allergic", "family history", "medical background",
                        "have had", "suffered from", "been diagnosed"],
            "weight": 1.0
        },
        "appointment_scheduling_task": {
            "keywords": ["appointment", "schedule", "booking", "visit", "availability",
                        "book a", "make an appointment", "when can i", "doctor available"],
            "weight": 1.0
        },
        "general_medical_task": {
            "keywords": ["what is", "explain", "define", "information about", "tell me about",
                        "overview of", "understanding", "education about"],
            "weight": 0.8
        }
    }
    
    # Calculate scores for each task
    task_scores = {}
    for task_key, pattern in task_patterns.items():
        score = 0
        for keyword in pattern["keywords"]:
            if keyword in query_lower:
                score += pattern["weight"]
                # Additional points for exact matches or proximity to important words
                if re.search(rf'\b{keyword}\b', query_lower):
                    score += 0.5
        
        task_scores[task_key] = score
    
    # Also check for question patterns
    if "?" in query:
        if any(word in query_lower for word in ["what", "how", "why", "when", "where"]):
            task_scores["general_medical_task"] += 1.0
    
    # Select the task with highest score
    selected_task = max(task_scores.items(), key=lambda x: x[1])
    
    # If no clear winner, use general medical task
    if selected_task[1] < 1.0:
        selected_task = ("general_medical_task", 0.5)
    
    confidence = min(selected_task[1] / 3.0, 1.0)  # Normalize confidence to 0-1
    
    return {
        "task_key": selected_task[0],
        "confidence": round(confidence, 2),
        "scores": task_scores
    }

# ---- RAG ONLY ENDPOINT ----
@app.post("/rag/query")
async def rag_query_endpoint(request: ChatRequest):
    """
    Pure RAG endpoint - retrieves relevant medical information only
    without CrewAI processing.
    """
    query_text = request.message
    user_id = request.user_id

    print(f"\n🔍 RAG query from user '{user_id}': {query_text}")

    # Load collection
    collection = chroma_client.get_or_create_collection("healthbridge_ai")

    # Perform similarity search
    results = collection.query(
        query_texts=[query_text],
        n_results=5
    )

    if not results or not results.get("documents"):
        print("⚠️ No relevant data found in ChromaDB")
        return {
            "status": "no_data",
            "user_id": user_id,
            "query": query_text,
            "results": []
        }

    # Extract and format RAG context
    docs = results["documents"][0]
    metadatas = results.get("metadatas", [[]])[0] if results.get("metadatas") else []
    distances = results.get("distances", [[]])[0] if results.get("distances") else []

    formatted_results = []
    for i, (doc, metadata, distance) in enumerate(zip(docs, metadatas, distances)):
        formatted_results.append({
            "rank": i + 1,
            "content": doc,
            "metadata": metadata,
            "similarity_score": float(1 - distance) if distance is not None else None
        })

    print(f"✅ Found {len(formatted_results)} relevant documents")

    return {
        "status": "success",
        "user_id": user_id,
        "query": query_text,
        "results": formatted_results
    }

# ---- MAIN USER ENDPOINT (AUTOMATIC TASK DETECTION) ----
@app.post("/ai/chat")
async def crewai_chat_endpoint(request: ChatRequest):
    """
    Main endpoint for user interaction - combines RAG retrieval with CrewAI processing.
    Automatically determines the best task type based on query content.
    """
    query_text = request.message
    user_id = request.user_id

    print(f"\n🤖 CrewAI chat request from user '{user_id}': {query_text}")

    # First get RAG context
    rag_response = await rag_query_endpoint(request)
    
    if rag_response["status"] == "no_data":
        return {
            "status": "no_context",
            "user_id": user_id,
            "query": query_text,
            "response": "I couldn't find relevant medical information in our database to answer your question. Please consult with a healthcare professional for personalized medical advice."
        }

    # Automatically determine the best task type
    task_analysis = analyze_query_and_select_task(query_text)
    task_key = task_analysis["task_key"]
    confidence = task_analysis["confidence"]
    
    print(f"🎯 Auto-selected task: {task_key} (confidence: {confidence})")

    # Prepare RAG context for CrewAI
    rag_context = "\n\n".join([
        f"Document {result['rank']} (Relevance: {result['similarity_score']:.3f}):\n{result['content']}"
        for result in rag_response["results"]
    ])

    # Process with CrewAI
    try:
        if crew is None or tasks_map is None:
            raise Exception("CrewAI not initialized")

        # Fallback to general if specific task not found
        if task_key not in tasks_map:
            print(f"⚠️ Task '{task_key}' not found, falling back to general_medical_task")
            task_key = "general_medical_task"
            confidence = 0.5

        # Enhance the query with RAG context and task context
        enhanced_query = f"""
        USER QUERY: {query_text}

        RELEVANT MEDICAL CONTEXT FROM DATABASE:
        {rag_context}

        TASK CONTEXT: You are a specialized medical AI assistant focused on {task_key.replace('_', ' ').replace('task', '').title()}.
        Your expertise is particularly suited for this type of medical inquiry.

        INSTRUCTIONS:
        1. Analyze the user's query in the context of the provided medical information
        2. Provide a comprehensive, professional medical response
        3. If the context is insufficient, acknowledge limitations and provide general guidance
        4. Always include appropriate medical disclaimers
        5. Tailor your response to the specific medical domain indicated by your task specialization
        """

        # Run the selected task
        result = run_single_task(enhanced_query, task_key)
        
        return {
            "status": "success",
            "user_id": user_id,
            "query": query_text,
            "selected_task": task_key,
            "selection_confidence": confidence,
            "rag_context_summary": f"Found {len(rag_response['results'])} relevant documents",
            "response": result
        }
        
    except Exception as e:
        print(f"❌ CrewAI execution error: {e}")
        # Fallback to just returning RAG results
        return {
            "status": "crewai_error",
            "user_id": user_id,
            "query": query_text,
            "error": str(e),
            "rag_results": rag_response["results"],
            "response": "I encountered an error processing your request with our AI system. Here's the relevant information I found: " + 
                       "\n\n".join([result["content"][:200] + "..." for result in rag_response["results"][:3]])
        }

# ---- SINGLE TASK EXECUTION ----
def run_single_task(query: str, task_key: str) -> str:
    """Execute a single CrewAI task with the given query"""
    if task_key not in tasks_map:
        raise ValueError(f"Unknown task: {task_key}")
    
    task = tasks_map[task_key]
    
    # Create a mini crew for single task execution
    # Note: You might need to adjust this based on your actual CrewAI implementation
    from crewai import Task, Crew, Process
    
    mini_crew = Crew(
        agents=[task.agent],
        tasks=[Task(
            description=query,
            expected_output=task.expected_output,
            agent=task.agent
        )],
        verbose=True,
        process=Process.sequential,
    )
    
    result = mini_crew.kickoff()
    return str(result)

# ---- HEALTH CHECK ENDPOINT ----
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "HealthBridge AI API",
        "version": "1.0.0",
        "endpoints": {
            "rag_only": "/rag/query (POST)",
            "ai_chat": "/ai/chat (POST) - RECOMMENDED FOR USERS",
            "health": "/ (GET)",
            "status": "/status (GET)"
        }
    }

# ---- SYSTEM STATUS ENDPOINT ----
@app.get("/status")
async def system_status():
    """System status endpoint"""
    collections = chroma_client.list_collections()
    collection_info = [{"name": c.name, "count": c.count()} for c in collections]
    
    crewai_status = "initialized" if crew is not None else "not_initialized"
    
    return {
        "chromadb_status": "connected",
        "collections": collection_info,
        "crewai_status": crewai_status,
        "available_tasks": list(tasks_map.keys()) if tasks_map else []
    }

# ---- TASK ANALYSIS ENDPOINT (FOR DEBUGGING) ----
@app.post("/analyze-query")
async def analyze_query_endpoint(request: ChatRequest):
    """
    Debug endpoint to see how queries are analyzed without executing tasks.
    """
    analysis = analyze_query_and_select_task(request.message)
    
    return {
        "user_id": request.user_id,
        "query": request.message,
        "analysis": analysis
    }