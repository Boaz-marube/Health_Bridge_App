# src/healthbridge/vectorstore_llama3.py
from chromadb import Client
from chromadb.config import Settings
from .llama_embeddings import LlamaEmbeddings

# Initialize Chroma
client = Client(Settings(chroma_db_impl="duckdb+parquet", persist_directory="./chroma_db"))
collection = client.get_or_create_collection("patient_records")

# Llama 3 embeddings
llama = LlamaEmbeddings()

def add_patient_record(patient_id, text):
    """Add patient record to Chroma with embedding"""
    collection.add(
        documents=[text],
        metadatas=[{"patient_id": patient_id}],
        ids=[f"{patient_id}_{len(collection.get_all()['ids'])}"],
        embeddings=llama.embed_documents([text])
    )

def query_patient_history(patient_id, query, k=3):
    """Retrieve top-k relevant records for a patient query"""
    query_embedding = llama.embed_query(query)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k,
        where={"patient_id": patient_id}
    )
    # Returns a list of dicts with 'page_content'
    return [{"page_content": doc} for doc in results['documents'][0]]
