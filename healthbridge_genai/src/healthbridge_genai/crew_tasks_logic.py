# src/healthbridge/crew_tasks_logic.py
from healthbridge.vectorstore_llama3 import query_patient_history

def medical_history_logic(inputs):
    """
    inputs: {'patient_id': 'P12345', 'query': 'What were my last lab results?'}
    """
    patient_id = inputs['patient_id']
    query = inputs['query']

    # Retrieve top 3 relevant records
    results = query_patient_history(patient_id, query, k=3)

    # Combine results into a single answer
    answer = "\n".join([doc.page_content for doc in results])

    return {"answer": answer}
