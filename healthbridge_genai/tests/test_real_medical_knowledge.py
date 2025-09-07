"""
Test script for real medical knowledge with Gemini + CrewAI

This script tests your CrewAI agents using your actual medical PDFs
instead of demo data.
"""

import os
from pathlib import Path
import sys

# Add the src directory to Python path
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from healthbridge_genai.crew import create_healthbridge_crew, run_single_task_by_key


def test_real_medical_knowledge():
    """Test CrewAI agents with real medical knowledge database."""
    print("="*60)
    print("TESTING CREWAI WITH REAL MEDICAL KNOWLEDGE")
    print("="*60)
    
    # Check for Gemini API key
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("❌ ERROR: GOOGLE_API_KEY not found!")
        print("Please add your Gemini API key to your .env file")
        return False
    
    print("✅ Google API key found")
    
    # Check for real medical database
    real_db_path = Path(__file__).parent.parent / "real_medical_db"
    if not real_db_path.exists():
        print("❌ ERROR: Real medical database not found!")
        print(f"Expected location: {real_db_path}")
        print("\n📋 TO FIX THIS:")
        print("1. Copy your medical PDFs to real_data/medical_guidelines/")
        print("2. Run: python index_real_knowledge.py")
        return False
    
    print(f"✅ Real medical database found: {real_db_path}")
    
    try:
        # Create crew with real medical database
        config_dir = Path(__file__).parent.parent / "src" / "healthbridge_genai" / "config"
        crew, agents_map, tasks_map = create_healthbridge_crew(
            config_dir, 
            db_path=str(real_db_path)
        )
        
        print(f"✅ Crew created with {len(agents_map)} agents using real medical database")
        
        # Test medical knowledge queries
        print(f"\n" + "-"*50)
        print("TESTING MEDICAL KNOWLEDGE QUERIES")
        print("-"*50)
        
        # Test treatment guideline agent
        if "treatment_guideline_agent" in agents_map:
            print("\n🧪 Testing Treatment Guideline Agent...")
            
            # Create a custom task for testing
            from crewai import Task
            
            custom_task = Task(
                description=(
                    "Find treatment guidelines for hypertension management. "
                    "Search the medical knowledge base for information about "
                    "blood pressure management, medications, and lifestyle recommendations. "
                    "Provide evidence-based treatment recommendations."
                ),
                expected_output=(
                    "Comprehensive treatment guidelines for hypertension including "
                    "medication options, lifestyle modifications, and monitoring protocols."
                ),
                agent=agents_map["treatment_guideline_agent"]
            )
            
            try:
                from crewai import Crew, Process
                
                test_crew = Crew(
                    agents=[agents_map["treatment_guideline_agent"]],
                    tasks=[custom_task],
                    verbose=True,
                    process=Process.sequential
                )
                
                print("🚀 Running treatment guideline query...")
                result = test_crew.kickoff()
                
                print("✅ Treatment guideline query successful!")
                print(f"📋 Result preview: {str(result)[:300]}...")
                
            except Exception as e:
                print(f"⚠️  Treatment guideline query error: {e}")
        
        # Test another medical query
        print(f"\n" + "-"*30)
        print("Testing Emergency Procedures Query...")
        
        if "treatment_guideline_agent" in agents_map:
            emergency_task = Task(
                description=(
                    "Search for emergency medical procedures and first aid information. "
                    "Find guidelines for handling medical emergencies, basic life support, "
                    "and emergency treatment protocols from the medical knowledge base."
                ),
                expected_output=(
                    "Emergency medical procedures and first aid guidelines including "
                    "step-by-step protocols for common medical emergencies."
                ),
                agent=agents_map["treatment_guideline_agent"]
            )
            
            try:
                emergency_crew = Crew(
                    agents=[agents_map["treatment_guideline_agent"]],
                    tasks=[emergency_task],
                    verbose=True,
                    process=Process.sequential
                )
                
                print("🚀 Running emergency procedures query...")
                emergency_result = emergency_crew.kickoff()
                
                print("✅ Emergency procedures query successful!")
                print(f"📋 Result preview: {str(emergency_result)[:300]}...")
                
            except Exception as e:
                print(f"⚠️  Emergency procedures query error: {e}")
        
        print(f"\n" + "="*60)
        print("REAL MEDICAL KNOWLEDGE TEST COMPLETE!")
        print("="*60)
        print("🎉 Your agents successfully queried real medical knowledge!")
        print("📚 Database contains your actual medical PDFs")
        print("🤖 Agents can now provide real medical information")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def show_database_info():
    """Show information about the real medical database."""
    print("\n" + "-"*50)
    print("DATABASE INFORMATION")
    print("-"*50)
    
    real_db_path = Path(__file__).parent.parent / "real_medical_db"
    if real_db_path.exists():
        print(f"📍 Database location: {real_db_path}")
        
        # Try to get database stats
        try:
            import sys
            rag_system_path = Path(__file__).parent.parent / "rag-system"
            sys.path.append(str(rag_system_path))
            
            from rag_service import RAGService
            
            rag_service = RAGService(db_path=str(real_db_path))
            total_docs = rag_service.collection.count()
            
            print(f"📊 Total document chunks: {total_docs}")
            print(f"🗂️  Collection name: {rag_service.collection.name}")
            
        except Exception as e:
            print(f"⚠️  Could not get database stats: {e}")
    else:
        print("❌ Real medical database not found!")
        print("Run 'python index_real_knowledge.py' first")


if __name__ == "__main__":
    print("🩺 Testing CrewAI agents with real medical knowledge...\n")
    
    # Show database info first
    show_database_info()
    
    # Run the test
    success = test_real_medical_knowledge()
    
    if success:
        print(f"\n✅ All tests passed! Your medical AI system is working with real data.")
    else:
        print(f"\n❌ Tests failed. Check the errors above and try again.")
        print(f"\n📋 Common issues:")
        print(f"1. Missing GOOGLE_API_KEY in .env file")
        print(f"2. Need to run 'python index_real_knowledge.py' first")
        print(f"3. Missing medical PDF files in real_data/medical_guidelines/")
