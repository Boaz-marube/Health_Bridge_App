from fastapi import FastAPI
from healthbridge.crew import HealthBridgeCrew
from healthbridge.vectorstore_llama3 import query_patient_history

app_rag = FastAPI(title="HealthBridge RAG API")  # renamed app

# Initialize CrewAI crew if needed
crew = HealthBridgeCrew().crew()

@app_rag.get("/patient_history")
def get_patient_history(patient_id: str, query: str):
    """Retrieve patient history via RAG"""
    results = query_patient_history(patient_id, query)
    answer = "\n".join([r['page_content'] for r in results])
    return {"answer": answer}
