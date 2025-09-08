# test_client.py
import requests
import json
import os
from datetime import datetime

class HealthBridgeTester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.role = None
        
    def login(self, username, password, role="patient"):
        """Simulate login and get JWT token"""
        try:
            response = requests.post(
                f"{self.base_url}/auth/login",
                json={
                    "username": username,
                    "password": password,
                    "role": role
                }
            )
            response.raise_for_status()
            data = response.json()
            self.token = data["access_token"]
            self.user_id = data["user_id"]
            self.role = data["role"]
            print(f"✅ Logged in as {self.role}: {self.user_id}")
            return True
        except Exception as e:
            print(f"❌ Login failed: {e}")
            return False
    
    def send_message(self, message, conversation_id=None):
        """Send a message to the AI chat endpoint"""
        if not self.token:
            print("❌ Not logged in. Please login first.")
            return None
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.post(
                f"{self.base_url}/ai/chat",
                headers=headers,
                json={
                    "message": message,
                    "conversation_id": conversation_id
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Chat failed: {e}")
            return None
    
    def test_rag_query(self, query):
        """Test RAG endpoint directly"""
        if not self.token:
            print("❌ Not logged in. Please login first.")
            return None
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.post(
                f"{self.base_url}/rag/query",
                headers=headers,
                json={
                    "message": query,
                    "user_id": self.user_id
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ RAG query failed: {e}")
            return None
    
    def get_conversations(self):
        """Get user conversations"""
        if not self.token:
            print("❌ Not logged in. Please login first.")
            return None
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(
                f"{self.base_url}/user/conversations",
                headers=headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Get conversations failed: {e}")
            return None
    
    def set_profile(self, specialty=None, medical_conditions=None):
        """Set user profile"""
        if not self.token:
            print("❌ Not logged in. Please login first.")
            return None
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            profile_data = {}
            if specialty:
                profile_data["specialty"] = specialty
            if medical_conditions:
                profile_data["medical_conditions"] = medical_conditions
            profile_data["role"] = self.role
            
            response = requests.post(
                f"{self.base_url}/user/profile",
                headers=headers,
                json=profile_data
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Set profile failed: {e}")
            return None

def run_demo_test():
    """Run a comprehensive demo test"""
    tester = HealthBridgeTester()
    
    print("🧪 Starting HealthBridge AI Demo Test")
    print("=" * 50)
    
    # Test 1: Login as Doctor
    print("\n1. 🔐 Logging in as Doctor...")
    if not tester.login("dr_smith", "password123", "doctor"):
        return
    
    # Test 2: Set doctor profile
    print("\n2. 📝 Setting doctor profile...")
    profile_result = tester.set_profile(specialty="Cardiology")
    if profile_result:
        print(f"   Profile set: {json.dumps(profile_result, indent=2)}")
    
    # Test 3: Test medical query as doctor
    print("\n3. 🩺 Testing doctor medical query...")
    doctor_query = "What are the latest guidelines for statin therapy in patients with high cholesterol?"
    result = tester.send_message(doctor_query)
    if result:
        print(f"   Query: {doctor_query}")
        print(f"   Response: {result['response'][:200]}...")
        print(f"   Task: {result['selected_task']}")
        print(f"   Confidence: {result['selection_confidence']}")
    
    # Test 4: Test RAG directly
    print("\n4. 🔍 Testing RAG directly...")
    rag_result = tester.test_rag_query("statin therapy guidelines")
    if rag_result and rag_result['status'] == 'success':
        print(f"   Found {len(rag_result['results'])} documents")
        for doc in rag_result['results'][:2]:
            print(f"   - {doc['content'][:100]}...")
    
    # Test 5: Login as Patient
    print("\n5. 🔐 Logging in as Patient...")
    if not tester.login("john_doe", "password123", "patient"):
        return
    
    # Test 6: Set patient profile
    print("\n6. 📝 Setting patient profile...")
    profile_result = tester.set_profile(medical_conditions=["hypertension", "high cholesterol"])
    if profile_result:
        print(f"   Profile set: {json.dumps(profile_result, indent=2)}")
    
    # Test 7: Test patient query
    print("\n7. 💊 Testing patient medical query...")
    patient_query = "I have high cholesterol, what medications are usually prescribed?"
    result = tester.send_message(patient_query)
    if result:
        print(f"   Query: {patient_query}")
        print(f"   Response: {result['response'][:200]}...")
        print(f"   Task: {result['selected_task']}")
    
    # Test 8: Test conversation history
    print("\n8. 💬 Testing conversation history...")
    conversations = tester.get_conversations()
    if conversations:
        print(f"   Found {len(conversations.get('conversations', {}))} conversations")
    
    print("\n" + "=" * 50)
    print("✅ Demo test completed successfully!")

def interactive_test():
    """Interactive testing mode"""
    tester = HealthBridgeTester()
    
    print("🎮 HealthBridge AI Interactive Tester")
    print("Type 'exit' to quit, 'help' for commands")
    print("=" * 50)
    
    # Login first
    print("\n🔐 Please login:")
    role = input("Role (doctor/patient): ").strip().lower() or "patient"
    username = input("Username: ").strip() or "test_user"
    password = input("Password: ").strip() or "test_pass"
    
    if not tester.login(username, password, role):
        return
    
    conversation_id = None
    
    while True:
        print(f"\n💬 You are: {tester.role.upper()} - {tester.user_id}")
        message = input("You: ").strip()
        
        if message.lower() in ['exit', 'quit']:
            break
        elif message.lower() == 'help':
            print("\n📋 Available commands:")
            print("  - 'rag [query]' - Test RAG directly")
            print("  - 'profile' - View current profile")
            print("  - 'conversations' - View conversation history")
            print("  - 'exit' - Quit tester")
            continue
        elif message.startswith('rag '):
            query = message[4:].strip()
            result = tester.test_rag_query(query)
            if result:
                print(f"\n🔍 RAG Results ({len(result.get('results', []))} documents):")
                for doc in result.get('results', [])[:3]:
                    print(f"   📄 {doc['content'][:150]}...")
            continue
        elif message == 'profile':
            # Simulate getting profile
            print(f"\n👤 Profile: Role={tester.role}, UserID={tester.user_id}")
            continue
        elif message == 'conversations':
            convs = tester.get_conversations()
            if convs:
                print(f"\n📚 Conversations: {len(convs.get('conversations', {}))}")
            continue
        
        # Normal chat message
        result = tester.send_message(message, conversation_id)
        if result:
            conversation_id = result.get('conversation_id')
            print(f"\n🤖 AI ({result.get('selected_task', 'unknown')}):")
            print(result['response'])
            print(f"\n   📊 Confidence: {result.get('selection_confidence', 0)}")
            print(f"   💬 Conversation ID: {conversation_id}")

if __name__ == "__main__":
    print("HealthBridge AI Local Tester")
    print("1. Run demo test")
    print("2. Interactive mode")
    
    choice = input("Choose option (1 or 2): ").strip()
    
    if choice == "1":
        run_demo_test()
    else:
        interactive_test()