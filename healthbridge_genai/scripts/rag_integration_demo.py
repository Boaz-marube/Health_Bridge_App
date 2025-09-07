"""
Example script demonstrating how to use RAG tools with CrewAI agents.

This script shows:
1. How to set up the RAG database with sample data
2. How to create CrewAI agents with RAG tools
3. How to run tasks that utilize the RAG tools
"""

import os
import shutil
from pathlib import Path

# Add the src directory to Python path to import our modules
import sys
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))

from healthbridge_genai.crew import create_healthbridge_crew
from healthbridge_genai.tools import create_rag_tool

# Import RAG service for initial setup
rag_system_path = Path(__file__).parent.parent / "rag-system"
sys.path.append(str(rag_system_path))
from rag_service import RAGService, run_ingestion


def setup_demo_data():
    """Set up demo data for RAG system testing."""
    print("Setting up demo data...")
    
    # Paths
    db_dir = Path(__file__).parent.parent / "demo_chroma_db"
    data_dir = Path(__file__).parent.parent / "demo_data"
    
    # Clean up previous runs
    if db_dir.exists():
        shutil.rmtree(db_dir)
    if data_dir.exists():
        shutil.rmtree(data_dir)
    
    patient_dir = data_dir / "patient_records"
    guideline_dir = data_dir / "medical_guidelines"
    patient_dir.mkdir(parents=True, exist_ok=True)
    guideline_dir.mkdir(parents=True, exist_ok=True)

    # Create sample patient records
    with open(patient_dir / "patient-123_notes.txt", "w", encoding='utf-8') as f:
        f.write("""
        Patient: John Doe (ID: 123)
        Date: 2024-01-15
        
        Chief Complaint: Persistent headaches for 2 weeks
        
        History of Present Illness:
        Patient reports severe headaches occurring daily for the past 2 weeks.
        Pain is described as throbbing, located in the frontal region.
        Pain intensity: 7/10
        Associated symptoms: Nausea, sensitivity to light
        No fever, no neck stiffness
        
        Past Medical History:
        - Hypertension (controlled with medication)
        - No history of migraines
        
        Current Medications:
        - Lisinopril 10mg daily
        - Ibuprofen 400mg as needed
        
        Assessment and Plan:
        1. Tension headache vs. medication overuse headache
        2. Prescribed: Sumatriptan 50mg for acute episodes
        3. Advised to limit ibuprofen use
        4. Follow-up in 1 week
        """)

    with open(patient_dir / "patient-456_allergies.txt", "w", encoding='utf-8') as f:
        f.write("""
        Patient: Jane Smith (ID: 456)
        Date: 2024-02-01
        
        Chief Complaint: Seasonal allergy symptoms
        
        History of Present Illness:
        Patient presents with typical seasonal allergy symptoms:
        - Runny nose
        - Sneezing
        - Itchy, watery eyes
        - Mild cough
        Symptoms started 1 week ago with onset of spring weather.
        
        Allergies:
        - Tree pollen (confirmed by skin test)
        - Grass pollen
        - No drug allergies known
        
        Current Treatment:
        - Loratadine 10mg daily
        - Fluticasone nasal spray
        
        Assessment:
        Seasonal allergic rhinitis, well-controlled
        """)

    # Create sample medical guidelines
    with open(guideline_dir / "hypertension_guidelines.txt", "w", encoding='utf-8') as f:
        f.write("""
        HYPERTENSION MANAGEMENT GUIDELINES
        
        DEFINITION:
        Hypertension is defined as systolic BP greater than or equal to 140 mmHg or diastolic BP greater than or equal to 90 mmHg
        
        CLASSIFICATION:
        - Normal: less than 120/80 mmHg
        - Elevated: 120-129/less than 80 mmHg
        - Stage 1: 130-139/80-89 mmHg
        - Stage 2: greater than or equal to 140/90 mmHg
        
        TREATMENT APPROACH:
        
        1. LIFESTYLE MODIFICATIONS (First-line for all patients):
           - Weight reduction if overweight
           - DASH diet (rich in fruits, vegetables, low in sodium)
           - Regular aerobic exercise (30 min, 5 days/week)
           - Limit alcohol consumption
           - Smoking cessation
        
        2. PHARMACOLOGICAL TREATMENT:
           
           First-line agents:
           - ACE inhibitors (e.g., Lisinopril 5-40mg daily)
           - ARBs (e.g., Losartan 25-100mg daily)
           - Thiazide diuretics (e.g., HCTZ 12.5-50mg daily)
           - Calcium channel blockers (e.g., Amlodipine 2.5-10mg daily)
        
        3. MONITORING:
           - Home BP monitoring recommended
           - Target BP: less than 130/80 mmHg for most patients
           - Follow-up every 4-6 weeks until target achieved
        """)

    with open(guideline_dir / "headache_guidelines.txt", "w", encoding='utf-8') as f:
        f.write("""
        HEADACHE MANAGEMENT GUIDELINES
        
        PRIMARY HEADACHES:
        
        1. TENSION-TYPE HEADACHE:
           - Most common type of headache
           - Bilateral, pressing/tightening quality
           - Mild to moderate intensity
           - Not aggravated by physical activity
           
           Treatment:
           - Acute: NSAIDs (ibuprofen 400-600mg), acetaminophen
           - Preventive: Tricyclic antidepressants if frequent
        
        2. MIGRAINE:
           - Unilateral, pulsating quality
           - Moderate to severe intensity
           - Associated with nausea, photophobia, phonophobia
           
           Treatment:
           - Acute: Triptans (sumatriptan 50-100mg), NSAIDs
           - Preventive: Beta-blockers, anticonvulsants, antidepressants
        
        RED FLAGS (require immediate evaluation):
        - Sudden onset "thunderclap" headache
        - Headache with fever and neck stiffness
        - New headache in patient greater than 50 years
        - Progressive worsening headache
        - Headache with neurological deficits
        
        MEDICATION OVERUSE HEADACHE:
        - Caused by frequent use of acute headache medications
        - Withdrawal of overused medication is key treatment
        """)

    # Initialize RAG service and ingest data
    rag_service = RAGService(db_path=str(db_dir))
    run_ingestion(rag_service, base_data_path=str(data_dir))
    
    print(f"Demo data setup complete!")
    print(f"Database location: {db_dir}")
    print(f"Sample data location: {data_dir}")
    
    return str(db_dir)


def demo_rag_tools():
    """Demonstrate RAG tools usage with CrewAI."""
    print("\n" + "="*60)
    print("RAG TOOLS INTEGRATION DEMO")
    print("="*60)
    
    # Set up demo data
    db_path = setup_demo_data()
    
    # Create CrewAI crew with RAG tools
    config_dir = Path(__file__).parent.parent / "src" / "healthbridge_genai" / "config"
    crew, agents_map, tasks_map = create_healthbridge_crew(config_dir, db_path=db_path)
    
    print(f"\nCreated crew with {len(agents_map)} agents:")
    for agent_name, agent in agents_map.items():
        tool_names = [tool.name for tool in agent.tools] if agent.tools else ["No tools"]
        print(f"  - {agent_name}: {tool_names}")
    
    # Test individual RAG tools
    print(f"\n" + "-"*50)
    print("TESTING RAG TOOLS DIRECTLY")
    print("-"*50)
    
    # Test patient records tool
    patient_tool = create_rag_tool("patient", db_path)
    print("\n1. Testing Patient Records Tool:")
    print("Query: 'What medication is John taking for headaches?'")
    result = patient_tool._run(
        query_text="What medication is John taking for headaches?",
        user_id="123",
        source_type="patient"
    )
    print(f"Result:\n{result}")
    
    # Test guidelines tool
    guideline_tool = create_rag_tool("guideline", db_path)
    print("\n2. Testing Medical Guidelines Tool:")
    print("Query: 'What are the first-line treatments for hypertension?'")
    result = guideline_tool._run(
        query_text="What are the first-line treatments for hypertension?",
        source_type="guideline"
    )
    print(f"Result:\n{result}")
    
    print(f"\n" + "-"*50)
    print("TESTING CREWAI INTEGRATION")
    print("-"*50)
    
    # Demonstrate how agents can use the tools
    print("\nNote: To use tools in CrewAI tasks, the agents will automatically")
    print("call the appropriate RAG tools based on the task description.")
    print("\nExample task descriptions that would trigger RAG tool usage:")
    print("- 'Retrieve patient medical history for patient ID 123'")
    print("- 'Find treatment guidelines for hypertension management'")
    print("- 'Search for information about headache medications'")
    
    return crew, agents_map, tasks_map


def example_medical_history_query():
    """Example of how a medical history agent would use RAG tools."""
    print(f"\n" + "-"*50)
    print("MEDICAL HISTORY AGENT EXAMPLE")
    print("-"*50)
    
    # Set up the RAG tool
    db_path = Path(__file__).parent.parent / "demo_chroma_db"
    if not db_path.exists():
        print("Demo database not found. Run setup_demo_data() first.")
        return
    
    patient_tool = create_rag_tool("patient", str(db_path))
    
    # Simulate agent queries
    queries = [
        ("What medications is patient 123 currently taking?", "123"),
        ("What are the symptoms reported by patient 123?", "123"),
        ("What allergies does patient 456 have?", "456"),
    ]
    
    for query, patient_id in queries:
        print(f"\nQuery: {query}")
        print(f"Patient ID: {patient_id}")
        result = patient_tool._run(
            query_text=query,
            user_id=patient_id,
            source_type="patient"
        )
        print(f"Response:\n{result}")
        print("-" * 30)


if __name__ == "__main__":
    try:
        # Run the demo
        crew, agents, tasks = demo_rag_tools()
        
        # Show example medical history queries
        example_medical_history_query()
        
        print(f"\n" + "="*60)
        print("INTEGRATION COMPLETE!")
        print("="*60)
        print("\nYour RAG service is now integrated as CrewAI tools!")
        print("\nKey components created:")
        print("1. RAGTool - General purpose RAG tool")
        print("2. PatientRAGTool - Specialized for patient records")
        print("3. GuidelineRAGTool - Specialized for medical guidelines")
        print("4. Updated crew.py to automatically assign tools to agents")
        print("\nAgents with RAG tools:")
        print("- medical_history_agent: PatientRAGTool")
        print("- treatment_guideline_agent: GuidelineRAGTool")
        print("- symptom_checker_agent: Both PatientRAGTool and GuidelineRAGTool")
        
    except Exception as e:
        print(f"Error running demo: {e}")
        import traceback
        traceback.print_exc()
