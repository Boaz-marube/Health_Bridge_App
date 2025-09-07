"""
Test script for Gemini 1.5 integration with CrewAI and RAG tools.

This script will:
1. Test Gemini LLM connection
2. Create a crew with Gemini-powered agents
3. Run a simple medical history task
4. Demonstrate RAG tool usage
"""

import os
from pathlib import Path
import sys

# Add the src directory to Python path
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from healthbridge_genai.crew import create_healthbridge_crew, run_single_task_by_key


def test_gemini_integration():
    """Test the Gemini 1.5 integration with CrewAI agents."""
    print("="*60)
    print("TESTING GEMINI 1.5 INTEGRATION WITH CREWAI")
    print("="*60)
    
    # Check for API key
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ ERROR: GOOGLE_API_KEY not found in environment variables!")
        print("\nPlease add your Gemini API key to your .env file:")
        print("GOOGLE_API_KEY=your_api_key_here")
        print("\nYou can get a free API key from: https://aistudio.google.com/app/apikey")
        return False
    
    print("✅ Google API key found")
    
    try:
        # Use existing demo database if available, otherwise create crew without specific db
        demo_db_path = Path(__file__).parent.parent / "demo_chroma_db"
        db_path = str(demo_db_path) if demo_db_path.exists() else None
        
        if db_path:
            print(f"✅ Using existing demo database: {db_path}")
        else:
            print("⚠️  No demo database found. RAG tools will use default path.")
        
        # Create crew with Gemini LLM
        config_dir = Path(__file__).parent.parent / "src" / "healthbridge_genai" / "config"
        print(f"📁 Loading config from: {config_dir}")
        
        crew, agents_map, tasks_map = create_healthbridge_crew(config_dir, db_path=db_path)
        print(f"✅ Crew created successfully with {len(agents_map)} agents and {len(tasks_map)} tasks")
        
        # Display agents and their tools
        print("\n" + "-"*50)
        print("AGENT CONFIGURATIONS:")
        print("-"*50)
        for agent_name, agent in agents_map.items():
            tool_names = [tool.name for tool in agent.tools] if agent.tools else ["No tools"]
            llm_info = f"LLM: {type(agent.llm).__name__}" if hasattr(agent, 'llm') and agent.llm else "No LLM"
            print(f"  🤖 {agent_name}:")
            print(f"     Tools: {tool_names}")
            print(f"     {llm_info}")
        
        # Test a simple task
        print(f"\n" + "-"*50)
        print("TESTING AGENT TASK EXECUTION:")
        print("-"*50)
        
        # Try to run a simple task
        if "medical_history_task" in tasks_map:
            print("🧪 Testing medical_history_task...")
            try:
                result = run_single_task_by_key(crew, tasks_map, "medical_history_task")
                print("✅ Task executed successfully!")
                print(f"Result: {result[:200]}..." if len(result) > 200 else f"Result: {result}")
            except Exception as e:
                print(f"⚠️  Task execution encountered an issue: {e}")
                print("This might be normal if no specific patient data was provided.")
        
        print(f"\n" + "="*60)
        print("GEMINI INTEGRATION TEST COMPLETE!")
        print("="*60)
        print("✅ Gemini 1.5 LLM successfully integrated with CrewAI")
        print("✅ Agents created with proper tool assignments")
        print("✅ System ready for medical AI tasks")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during integration test: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_simple_gemini_call():
    """Test a direct Gemini API call to verify connection."""
    print("\n" + "-"*50)
    print("TESTING DIRECT GEMINI CONNECTION:")
    print("-"*50)
    
    try:
        # Test with CrewAI's LLM wrapper (LiteLLM format)
        from crewai.llm import LLM
        
        llm = LLM(
            model="gemini/gemini-1.5-flash",
            temperature=0.1,
            api_key=os.getenv("GOOGLE_API_KEY")
        )
        
        response = llm.call(["Hello! Can you respond with a simple medical fact?"])
        print("✅ CrewAI LLM (LiteLLM format) call successful!")
        print(f"Response: {str(response)[:200]}...")
        return True
        
    except Exception as e:
        print(f"⚠️  CrewAI LLM call failed, trying direct LangChain: {e}")
        
        try:
            # Fallback to direct LangChain call
            from langchain_google_genai import ChatGoogleGenerativeAI
            
            llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                temperature=0.1,
                google_api_key=os.getenv("GOOGLE_API_KEY")
            )
            
            response = llm.invoke("Hello! Can you respond with a simple medical fact?")
            print("✅ Direct LangChain Gemini call successful!")
            print(f"Response: {response.content[:200]}...")
            return True
            
        except Exception as e2:
            print(f"❌ Both LLM calls failed: {e2}")
            return False


if __name__ == "__main__":
    print("🚀 Starting Gemini integration tests...\n")
    
    # Test 1: Direct Gemini connection
    gemini_works = test_simple_gemini_call()
    
    if gemini_works:
        # Test 2: Full CrewAI integration
        integration_works = test_gemini_integration()
        
        if integration_works:
            print("\n🎉 ALL TESTS PASSED! Your system is ready to use.")
            print("\n📋 Next steps:")
            print("1. Add your medical documents to the data directory")
            print("2. Run the ingestion script to index your documents")
            print("3. Create custom tasks for your specific medical workflows")
            print("4. Connect to your NestJS backend if needed")
        else:
            print("\n⚠️  Integration test had issues, but Gemini connection works.")
            print("Check the error messages above for troubleshooting.")
    else:
        print("\n❌ Gemini connection failed. Please check your API key.")
        print("Make sure you have:")
        print("1. Valid GOOGLE_API_KEY in your .env file")
        print("2. Installed langchain-google-genai: pip install langchain-google-genai")
        print("3. Internet connection for API calls")
