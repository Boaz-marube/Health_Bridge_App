from fastapi import FastAPI, Request
from pydantic import BaseModel
from chromadb import PersistentClient
from typing import Optional, Dict, List
import sys
from pathlib import Path
import json
import re
from datetime import datetime, timedelta
import uuid
from collections import defaultdict

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

# ---- MEMORY STORAGE ----
# In production, use a proper database. For now, we'll use in-memory storage
user_conversation_memory = defaultdict(list)
user_profiles = {}  # Store user roles and preferences

# ---- REQUEST MODELS ----
class ChatRequest(BaseModel):
    user_id: str
    message: str
    role: Optional[str] = "patient"  # "doctor" or "patient"
    conversation_id: Optional[str] = None  # For continuing conversations

class UserProfileRequest(BaseModel):
    user_id: str
    role: str  # "doctor" or "patient"
    specialty: Optional[str] = None  # For doctors
    medical_conditions: Optional[List[str]] = None  # For patients

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

# ---- MEMORY MANAGEMENT FUNCTIONS ----
def get_conversation_history(user_id: str, conversation_id: str = None, max_messages: int = 10) -> List[Dict]:
    """Get conversation history for a user"""
    if conversation_id:
        # Get specific conversation
        return [msg for msg in user_conversation_memory[user_id] if msg.get("conversation_id") == conversation_id][-max_messages:]
    else:
        # Get latest conversation
        return user_conversation_memory[user_id][-max_messages:]

def add_to_memory(user_id: str, message: str, response: str, role: str, conversation_id: str = None):
    """Add message to conversation memory"""
    if conversation_id is None:
        conversation_id = str(uuid.uuid4())
    
    timestamp = datetime.now().isoformat()
    
    user_conversation_memory[user_id].append({
        "conversation_id": conversation_id,
        "timestamp": timestamp,
        "role": role,
        "user_message": message,
        "ai_response": response
    })
    
    # Keep only last 50 messages per user to prevent memory overload
    if len(user_conversation_memory[user_id]) > 50:
        user_conversation_memory[user_id] = user_conversation_memory[user_id][-50:]
    
    return conversation_id

def get_conversation_summary(user_id: str, conversation_id: str) -> str:
    """Generate a summary of the conversation for context"""
    history = get_conversation_history(user_id, conversation_id)
    if not history:
        return "No previous conversation history."
    
    summary = f"Conversation History (User role: {history[0].get('role', 'patient')}):\n"
    for i, msg in enumerate(history[-5:]):  # Last 5 messages
        summary += f"{i+1}. User: {msg['user_message'][:100]}...\n"
        summary += f"   AI: {msg['ai_response'][:100]}...\n"
    
    return summary

# ---- ROLE-BASED RESPONSE FORMATTING ----
def format_response_for_role(response: str, role: str, query: str) -> str:
    """Format the response based on user role"""
    if role.lower() == "doctor":
        # Professional, clinical tone for doctors
        formatted = f"**Clinical Analysis for Healthcare Professional:**\n\n"
        formatted += f"**Query:** {query}\n\n"
        formatted += f"**Evidence-Based Response:**\n{response}\n\n"
        formatted += "**Clinical Considerations:**\n- Always verify with current guidelines\n- Consider patient-specific factors\n- Review contraindications\n\n"
        formatted += "*This information is based on available medical literature and should be integrated with clinical judgment.*"
    else:
        # Patient-friendly, empathetic tone
        formatted = f"**Medical Information for You:**\n\n"
        formatted += f"**Regarding your question about {query.lower()}:**\n\n"
        formatted += f"{response}\n\n"
        formatted += "**Important Notes:**\n- This is general information, not medical advice\n- Always consult your healthcare provider\n- Individual cases may vary\n\n"
        formatted += "*I'm here to provide information, but please see a doctor for personal medical concerns.*"
    
    return formatted

# ---- ENHANCED TASK SELECTION LOGIC ----
def analyze_query_and_select_task(query: str, role: str = "patient") -> Dict:
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
    
    # Adjust weights based on role
    if role == "doctor":
        task_patterns["treatment_guideline_task"]["weight"] = 1.2
        task_patterns["general_medical_task"]["weight"] = 0.6
    else:
        task_patterns["symptom_checker_task"]["weight"] = 1.2
        task_patterns["general_medical_task"]["weight"] = 1.0
    
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
        n_results=2
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

# ---- MAIN USER ENDPOINT (WITH MEMORY AND ROLE SUPPORT) ----
@app.post("/ai/chat")
async def crewai_chat_endpoint(request: ChatRequest):
    """
    Main endpoint for user interaction - combines RAG retrieval with CrewAI processing.
    Now with memory preservation and role-based responses.
    """
    query_text = request.message
    user_id = request.user_id
    role = request.role or "patient"
    conversation_id = request.conversation_id

    print(f"\n🤖 CrewAI chat request from user '{user_id}' (role: {role}): {query_text}")

    # Get conversation history for context
    conversation_history = get_conversation_history(user_id, conversation_id)
    conversation_summary = get_conversation_summary(user_id, conversation_id) if conversation_history else "No previous conversation."

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
    task_analysis = analyze_query_and_select_task(query_text, role)
    task_key = task_analysis["task_key"]
    confidence = task_analysis["confidence"]
    
    print(f"🎯 Auto-selected task: {task_key} (confidence: {confidence})")

    # Prepare RAG context for CrewAI with memory integration
    rag_context = "\n\n".join([
        f"Document {result['rank']} (Relevance: {result['similarity_score']:.3f}):\n{result['content']}"
        for result in rag_response["results"]
    ])

    # Enhanced query with memory and role context
    enhanced_query = f"""
    USER QUERY: {query_text}
    USER ROLE: {role.upper()}
    
    CONVERSATION CONTEXT:
    {conversation_summary}
    
    RELEVANT MEDICAL CONTEXT FROM DATABASE:
    {rag_context}

    TASK CONTEXT: You are a specialized medical AI assistant focused on {task_key.replace('_', ' ').replace('task', '').title()}.
    Your response should be tailored for a {role} - use appropriate tone and detail level.

    INSTRUCTIONS:
    1. Analyze the user's query in context of their role ({role}) and conversation history
    2. Provide a comprehensive, professional medical response appropriate for {role}
    3. If the context is insufficient, acknowledge limitations and provide general guidance
    4. Always include appropriate medical disclaimers
    5. Maintain continuity with previous conversation if relevant
    6. Tailor response depth and terminology for {role} understanding
    """

    # Process with CrewAI
    try:
        if crew is None or tasks_map is None:
            raise Exception("CrewAI not initialized")

        # Fallback to general if specific task not found
        if task_key not in tasks_map:
            print(f"⚠️ Task '{task_key}' not found, falling back to general_medical_task")
            task_key = "general_medical_task"
            confidence = 0.5

        # Run the selected task
        raw_result = run_single_task(enhanced_query, task_key)
        
        # Format response based on role
        formatted_response = format_response_for_role(raw_result, role, query_text)
        
        # Store in memory
        new_conversation_id = add_to_memory(user_id, query_text, formatted_response, role, conversation_id)
        
        response_data = {
            "status": "success",
            "user_id": user_id,
            "query": query_text,
            "selected_task": task_key,
            "selection_confidence": confidence,
            "user_role": role,
            "conversation_id": new_conversation_id,
            "rag_context_summary": f"Found {len(rag_response['results'])} relevant documents",
            "response": formatted_response
        }
        
        return response_data
        
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

# ---- USER PROFILE MANAGEMENT ----
@app.post("/user/profile")
async def set_user_profile(request: UserProfileRequest):
    """Set or update user profile information"""
    user_profiles[request.user_id] = {
        "role": request.role,
        "specialty": request.specialty,
        "medical_conditions": request.medical_conditions or [],
        "last_updated": datetime.now().isoformat()
    }
    
    return {
        "status": "success",
        "user_id": request.user_id,
        "profile": user_profiles[request.user_id]
    }

@app.get("/user/{user_id}/profile")
async def get_user_profile(user_id: str):
    """Get user profile information"""
    profile = user_profiles.get(user_id)
    if not profile:
        return {"status": "not_found", "user_id": user_id}
    
    return {"status": "success", "profile": profile}

@app.get("/user/{user_id}/conversations")
async def get_user_conversations(user_id: str):
    """Get list of conversations for a user"""
    conversations = {}
    for msg in user_conversation_memory.get(user_id, []):
        conv_id = msg["conversation_id"]
        if conv_id not in conversations:
            conversations[conv_id] = {
                "start_time": msg["timestamp"],
                "message_count": 0,
                "role": msg["role"]
            }
        conversations[conv_id]["message_count"] += 1
    
    return {
        "user_id": user_id,
        "conversations": conversations
    }

# ---- SINGLE TASK EXECUTION ----
def run_single_task(query: str, task_key: str) -> str:
    """Execute a single CrewAI task with the given query"""
    if task_key not in tasks_map:
        raise ValueError(f"Unknown task: {task_key}")
    
    task = tasks_map[task_key]
    
    # Create a mini crew for single task execution
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
        "features": {
            "role_based_responses": "✅ (doctor/patient)",
            "conversation_memory": "✅",
            "rag_integration": "✅",
            "auto_task_selection": "✅"
        },
        "endpoints": {
            "ai_chat": "/ai/chat (POST) - MAIN ENDPOINT",
            "rag_only": "/rag/query (POST)",
            "user_profile": "/user/profile (POST)",
            "user_conversations": "/user/{id}/conversations (GET)",
            "analyze_query": "/analyze-query (POST)"
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
        "available_tasks": list(tasks_map.keys()) if tasks_map else [],
        "users_in_memory": len(user_conversation_memory),
        "user_profiles": len(user_profiles)
    }

# ---- TASK ANALYSIS ENDPOINT (FOR DEBUGGING) ----
@app.post("/analyze-query")
async def analyze_query_endpoint(request: ChatRequest):
    """
    Debug endpoint to see how queries are analyzed without executing tasks.
    """
    analysis = analyze_query_and_select_task(request.message, request.role or "patient")
    
    return {
        "user_id": request.user_id,
        "query": request.message,
        "user_role": request.role or "patient",
        "analysis": analysis
    }