# src/healthbridge/vectorstore_llama3.py
from langchain.vectorstores import Chroma
from healthbridge.llama_embeddings import Llama3Embeddings
from langchain.docstore.document import Document

# Initialize Llama 3 embeddings
embeddings = Llama3Embeddings(model_name="meta-llama/Llama-3-7b-hf")

# Create/load vector DB
vector_db = Chroma(persist_directory="./patient_data", embedding_function=embeddings)

def add_patient_record(patient_id: str, text: str):
    doc = Document(page_content=text, metadata={"patient_id": patient_id})
    vector_db.add_documents([doc])
    vector_db.persist()

def query_patient_history(patient_id: str, query: str, k: int = 3):
    results = vector_db.similarity_search(query, k=k, filter={"patient_id": patient_id})
    return results
