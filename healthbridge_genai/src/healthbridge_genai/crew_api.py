from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
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
import jwt
from jwt.exceptions import InvalidTokenError
from dotenv import load_dotenv
import os
from fuzzywuzzy import fuzz


# ---- CONFIG ----
# PERSIST_DIRECTORY = r"C:\Users\IdeaPad-320\Desktop\health_bridge_second\Health_Bridge_App\healthbridge_genai\real_medical_db"

# # print("📂 BASE_DIR:", BASE_DIR)
# print("📂 PERSIST_DIRECTORY:", PERSIST_DIRECTORY)
BASE_DIR = Path(__file__).parent.parent.parent.resolve()  
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
print("SECRET KEY:",SECRET_KEY)

# Go up to project root
PERSIST_DIRECTORY = BASE_DIR / "real_medical_db"

# # ---- AUTH CONFIG ----
# SECRET_KEY = "healthbridge-secret-key-2024-change-in-production"
# ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Add the path to your crew module
# sys.path.append(r"C:\Users\IdeaPad-320\Desktop\health_bridge_second\Health_Bridge_App\healthbridge_genai\real_medical_db")

# ---- FASTAPI APP ----
app = FastAPI(title="HealthBridge AI API", version="1.0.0")

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- SECURITY ----
security = HTTPBearer()

# ---- GLOBAL CHROMA CLIENT ----
chroma_client = PersistentClient(path=str(PERSIST_DIRECTORY))

# Global variables for CrewAI
crew = None
agents_map = None
tasks_map = None

# ---- MEMORY STORAGE ----
user_conversation_memory = defaultdict(list)
user_profiles = {}
user_roles = {}  # Store user roles for authentication

# ---- REQUEST MODELS ----
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class UserProfileRequest(BaseModel):
    role: str 
    specialty: Optional[str] = None 
    medical_conditions: Optional[List[str]] = None

class LoginRequest(BaseModel):
    username: str
    password: str
    role: str  # "doctor" or "patient"

class TokenData(BaseModel):
    user_id: str
    role: str

# ---- AUTHENTICATION FUNCTIONS ----
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    """Get current user from JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
        return TokenData(user_id=user_id, role=role)
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

# ---- AUTHENTICATION ENDPOINTS ----
@app.post("/auth/login")
async def login(request: LoginRequest):
    """Login endpoint - in production, use proper user database"""
    # Simple demo authentication - in real app, verify against database
    user_id = f"{request.role}_{request.username}"
    
    # Store user role for future reference
    user_roles[user_id] = request.role
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id, "role": request.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user_id,
        "role": request.role,
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@app.get("/auth/me")
async def get_current_user_info(current_user: TokenData = Depends(get_current_user)):
    """Get current user information"""
    profile = user_profiles.get(current_user.user_id, {})
    return {
        "user_id": current_user.user_id,
        "role": current_user.role,
        "profile": profile
    }

# ---- STARTUP EVENT ----
@app.on_event("startup")
async def startup_event():
    """Runs once when FastAPI starts — check DB status and initialize CrewAI."""
    # Cross-platform paths
    BASE_DIR = Path(__file__).parent.resolve()
    PERSIST_DIRECTORY = BASE_DIR / "real_medical_db"
    CONFIG_DIR = BASE_DIR / "config"

    print(f"📂 Loading ChromaDB from: {PERSIST_DIRECTORY}")

    # Ensure the DB folder exists
    if not PERSIST_DIRECTORY.exists():
        print(f"⚠️ ChromaDB directory not found at {PERSIST_DIRECTORY}.")
    else:
        collections = chroma_client.list_collections()
        print(f"✅ Collections found: {[c.name for c in collections]}")

        if collections:
            for c in collections:
                stats = c.count()
                print(f"📄 Number of documents in collection '{c.name}': {stats}")

    # Initialize CrewAI
    try:
        if not CONFIG_DIR.exists():
            print(f"⚠️ CrewAI config directory not found at {CONFIG_DIR}. Skipping Crew initialization.")
            return

        from .crew import create_healthbridge_crew
        global crew, agents_map, tasks_map
        crew, agents_map, tasks_map = create_healthbridge_crew(CONFIG_DIR)

        print("✅ CrewAI initialized successfully")
        print(f"🤖 Available agents: {list(agents_map.keys())}")
        print(f"📋 Available tasks: {list(tasks_map.keys())}")

    except Exception as e:
        print(f"⚠️ CrewAI initialization failed: {e}")

# ---- MEMORY FUNCTIONS ----
def get_conversation_history(user_id: str, conversation_id: str = None, max_messages: int = 10) -> List[Dict]:
    """Get conversation history for a user"""
    if conversation_id:
        return [msg for msg in user_conversation_memory[user_id] if msg.get("conversation_id") == conversation_id][-max_messages:]
    else:
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
    
    # Keep only last 50 messages per user
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

def format_response_for_role(response: str, role: str, query: str) -> str:
    """Format the response based on user role"""
    if role.lower() == "doctor":
        formatted = f"**Clinical Analysis for Healthcare Professional:**\n\n"
        formatted += f"**Query:** {query}\n\n"
        formatted += f"**Evidence-Based Response:**\n{response}\n\n"
        formatted += "**Clinical Considerations:**\n- Always verify with current guidelines\n- Consider patient-specific factors\n- Review contraindications\n\n"
        formatted += "*This information is based on available medical literature and should be integrated with clinical judgment.*"
    else:
        formatted = f"**Medical Information for You:**\n\n"
        formatted += f"**Regarding your question about {query.lower()}:**\n\n"
        formatted += f"{response}\n\n"
        formatted += "**Important Notes:**\n- This is general information, not medical advice\n- Always consult your healthcare provider\n- Individual cases may vary\n\n"
        formatted += "*I'm here to provide information, but please see a doctor for personal medical concerns.*"
    
    return formatted

# ---- TASK SELECTION LOGIC ----

def analyze_query_and_select_task(query: str, role: str = "patient") -> Dict:
    query_lower = query.lower()
    
    task_patterns = {
        "appointment_booking_task": {
            "keywords": ["appointment", "schedule", "booking", "visit", "availability",
                         "book a", "make an appointment", "when can i", "doctor available",
                         "book appointment", "schedule appointment", "need appointment",
                         "see doctor", "meet doctor", "consultation", "reserve", "slot"],
            "weight": 1.0
        },
        # ... other tasks ...
        "general_medical_task": {
            "keywords": ["what is", "explain", "define", "information about", "tell me about",
                         "overview of", "understanding", "education about"],
            "weight": 0.8
        }
    }
    
    task_scores = {}
    for task_key, pattern in task_patterns.items():
        score = 0
        for keyword in pattern["keywords"]:
            # Exact match
            if keyword in query_lower:
                score += pattern["weight"]
                if re.search(rf'\b{keyword}\b', query_lower):
                    score += 0.5
            # Fuzzy match for typos (threshold: 80% similarity)
            elif any(fuzz.partial_ratio(keyword, word) > 80 for word in query_lower.split()):
                score += pattern["weight"] * 0.8  # Reduced weight for fuzzy match
        task_scores[task_key] = score
    
    if "?" in query:
        if any(word in query_lower for word in ["what", "how", "why", "when", "where"]):
            task_scores["general_medical_task"] += 1.0
    
    selected_task = max(task_scores.items(), key=lambda x: x[1])
    
    # Avoid defaulting to general_medical_task unless no keywords match
    if selected_task[1] < 0.5:  # Lower threshold for fuzzy matches
        selected_task = ("general_medical_task", 0.5)
    
    confidence = min(selected_task[1] / 3.0, 1.0)
    
    return {
        "task_key": selected_task[0],
        "confidence": round(confidence, 2),
        "scores": task_scores
    }
# ---- RAG ONLY ENDPOINT ----
@app.post("/rag/query")
async def rag_query_endpoint(request: ChatRequest, current_user: TokenData = Depends(get_current_user)):
    """Pure RAG endpoint - retrieves relevant medical information only."""
    query_text = request.message
    user_id = current_user.user_id

    print(f"\n🔍 RAG query from user '{user_id}': {query_text}")

    collection = chroma_client.get_or_create_collection("healthbridge_ai")
    results = collection.query(query_texts=[query_text], n_results=5)

    if not results or not results.get("documents"):
        print("⚠️ No relevant data found in ChromaDB")
        return {
            "status": "no_data",
            "user_id": user_id,
            "query": query_text,
            "results": []
        }

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

# ---- MAIN CHAT ENDPOINT ----
@app.post("/ai/chat")
async def crewai_chat_endpoint(request: ChatRequest, current_user: TokenData = Depends(get_current_user)):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    query_text = request.message
    user_id = current_user.user_id
    role = current_user.role
    conversation_id = request.conversation_id

    print(f"\n🤖 CrewAI chat request from user '{user_id}' (role: {role}): {query_text}")

    try:
        conversation_history = get_conversation_history(user_id, conversation_id)
        conversation_summary = get_conversation_summary(user_id, conversation_id) if conversation_history else "No previous conversation."

        rag_response = await rag_query_endpoint(request, current_user)
        if rag_response["status"] == "no_data":
            return {
                "status": "no_context",
                "user_id": user_id,
                "query": query_text,
                "response": "I couldn't find relevant medical information in our database to answer your question. Please consult with a healthcare professional for personalized medical advice."
            }

        task_analysis = analyze_query_and_select_task(query_text, role)
        task_key = task_analysis["task_key"]
        confidence = task_analysis["confidence"]
        print(f"🎯 Auto-selected task: {task_key} (confidence: {confidence})")

        rag_documents = rag_response["results"]
        rag_context = "\n\n".join([
            f"Document {result['rank']} (Relevance: {result['similarity_score']:.3f}):\n{result['content']}"
            for result in rag_documents
        ])

        if task_key == "appointment_booking_task":
            try:
                from healthbridge_genai.tools.n8n_appointment_tool import N8nAppointmentTool
                appointment_tool = N8nAppointmentTool()
                profile = user_profiles.get(user_id, {})
                
                # Simple parsing for doctor and time (improve as needed)
                desired_doctor = "Dr. Smith"  # Extract from query, e.g., regex or NLP
                desired_time = "2025-09-11T14:00"  # Extract from query
                appointment_data = {
                    "email": profile.get("email", f"{user_id}@example.com"),
                    "desired_time": desired_time,
                    "desired_doctor": desired_doctor,
                    "user_message": query_text,
                    "session_id": conversation_id or str(uuid.uuid4())
                }
                result = appointment_tool._run(**appointment_data)
                formatted_response = format_response_for_role(result, role, query_text)
            except Exception as e:
                print(f"❌ N8nAppointmentTool error: {e}")
                formatted_response = format_response_for_role(
                    f"Failed to book appointment: {str(e)}. Please contact your doctor's office directly.",
                    role,
                    query_text
                )
        else:
            if crew is None or tasks_map is None:
                raise HTTPException(status_code=500, detail="AI system not initialized")

            enhanced_query = f"""
            USER QUERY: {query_text}
            USER ROLE: {role.upper()}
            
            CONVERSATION CONTEXT:
            {conversation_summary}
            
            RELEVANT MEDICAL CONTEXT FROM DATABASE:
            {rag_context}

            TASK CONTEXT: You are a specialized medical AI assistant focused on {task_key.replace('_', ' ').replace('task', '').title()}.

            INSTRUCTIONS:
            1. Analyze the user's query in context of their role ({role}) and conversation history
            2. Provide a comprehensive, professional medical response appropriate for {role}
            3. If the context is insufficient, acknowledge limitations and provide general guidance
            4. Always include appropriate medical disclaimers
            5. Maintain continuity with previous conversation if relevant
            """
            raw_result = run_single_task(enhanced_query, task_key)
            formatted_response = format_response_for_role(raw_result, role, query_text)
        
        new_conversation_id = add_to_memory(user_id, query_text, formatted_response, role, conversation_id)
        
        return {
            "status": "success",
            "user_id": user_id,
            "query": query_text,
            "selected_task": task_key,
            "selection_confidence": confidence,
            "user_role": role,
            "conversation_id": new_conversation_id,
            "rag_context_summary": f"Found {len(rag_documents)} relevant documents",
            "response": formatted_response
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ CrewAI execution error: {e}")
        formatted_response = format_response_for_role(
            f"Error processing your query: {str(e)}. Please try again or contact support.",
            role,
            query_text
        )
        return {
            "status": "error",
            "user_id": user_id,
            "query": query_text,
            "error": str(e),
            "response": formatted_response
        }
# ---- USER PROFILE MANAGEMENT ----
@app.post("/user/profile")
async def set_user_profile(request: UserProfileRequest, current_user: TokenData = Depends(get_current_user)):
    """Set or update user profile information"""
    user_profiles[current_user.user_id] = {
        "role": current_user.role,
        "specialty": request.specialty,
        "medical_conditions": request.medical_conditions or [],
        "last_updated": datetime.now().isoformat()
    }
    
    return {
        "status": "success",
        "user_id": current_user.user_id,
        "profile": user_profiles[current_user.user_id]
    }

@app.get("/user/profile")
async def get_user_profile(current_user: TokenData = Depends(get_current_user)):
    """Get user profile information"""
    profile = user_profiles.get(current_user.user_id, {})
    return {"status": "success", "profile": profile}

@app.get("/user/conversations")
async def get_user_conversations(current_user: TokenData = Depends(get_current_user)):
    """Get list of conversations for authenticated user"""
    conversations = {}
    for msg in user_conversation_memory.get(current_user.user_id, []):
        conv_id = msg["conversation_id"]
        if conv_id not in conversations:
            conversations[conv_id] = {
                "start_time": msg["timestamp"],
                "message_count": 0,
                "role": msg["role"]
            }
        conversations[conv_id]["message_count"] += 1
    
    return {
        "user_id": current_user.user_id,
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
            "auto_task_selection": "✅",
            "authentication": "✅"
        },
        "endpoints": {
            "auth_login": "POST /auth/login",
            "ai_chat": "POST /ai/chat",
            "rag_query": "POST /rag/query",
            "user_profile": "GET/POST /user/profile",
            "user_conversations": "GET /user/conversations"
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

# ---- TASK ANALYSIS ENDPOINT ----
@app.post("/analyze-query")
async def analyze_query_endpoint(request: ChatRequest, current_user: TokenData = Depends(get_current_user)):
    """Debug endpoint to see how queries are analyzed"""
    analysis = analyze_query_and_select_task(request.message, current_user.role)
    
    return {
        "user_id": current_user.user_id,
        "query": request.message,
        "user_role": current_user.role,
        "analysis": analysis
    }