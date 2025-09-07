# --- Installation ---
# pip install chromadb "langchain_community[docloaders]" pydantic

import os
import shutil
import uuid
from typing import List, Dict, Any, Literal

from pydantic import BaseModel
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import chromadb

# --- 1. Define the "Contract" with Pydantic Models ---
class RAGQuery(BaseModel):
    query_text: str
    user_id: str | None = None
    source_type: Literal['patient', 'guideline']
    top_k: int = 3

class DocumentChunk(BaseModel):
    content: str
    metadata: Dict[str, Any]
    score: float

class RAGResponse(BaseModel):
    retrieved_chunks: List[DocumentChunk]

# --- 2. The RAG Service Class
class RAGService:
    def __init__(self, db_path: str, collection_name: str = "healthbridge_ai"):
        self.db_path = db_path
        self.collection_name = collection_name
        self.client = chromadb.PersistentClient(path=self.db_path)
        
        # Note: By not specifying an embedding function, we are using Chroma's default:
        # 'all-MiniLM-L6-v2' via sentence-transformers. This requires onnxruntime.
        self.collection = self.client.get_or_create_collection(name=self.collection_name)
        
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        print(f"RAGService initialized. Collection '{self.collection_name}' loaded with {self.collection.count()} documents.")

    def _clear_collection(self):
        """Clears all documents from the collection for a fresh start."""
        print("Clearing existing collection...")
        self.client.delete_collection(name=self.collection_name)
        self.collection = self.client.get_or_create_collection(name=self.collection_name)
        print("Collection cleared.")

    def _load_and_chunk_document(self, file_path: str) -> List[str]:
        """Loads and chunks a document based on its file type."""
        if file_path.lower().endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        elif file_path.lower().endswith(".txt"):
            loader = TextLoader(file_path, encoding='utf-8')
        else:
            print(f"Skipping unsupported file type: {file_path}")
            return []
        
        documents = loader.load()
        chunks = self.text_splitter.split_documents(documents)
        return [chunk.page_content for chunk in chunks]

    def _ingest_single_document(self, file_path: str, source_type: Literal['patient', 'guideline'], user_id: str | None = None):
        """Helper to ingest one document."""
        chunks = self._load_and_chunk_document(file_path)
        if not chunks:
            return
        
        metadatas = []
        for i, chunk in enumerate(chunks):
            metadata = {
                "source_file": os.path.basename(file_path),
                "source_type": source_type,
                "chunk_index": i
            }
            if source_type == 'patient' and user_id:
                metadata["patient_id"] = user_id
            metadatas.append(metadata)
        
        ids = [str(uuid.uuid4()) for _ in chunks]
        self.collection.add(ids=ids, documents=chunks, metadatas=metadatas)
        print(f"-> Successfully ingested {len(chunks)} chunks from {os.path.basename(file_path)}.")

    def query(self, request: RAGQuery, distance_threshold: float = 1.6) -> RAGResponse:
        """
        Queries the vector database, applying a security filter and a distance
        threshold to ensure only relevant documents are returned.
        """
        where_filter = {}
        if request.source_type == 'patient':
            if not request.user_id:
                raise ValueError("user_id is required for patient data queries.")
            where_filter = {
                "$and": [
                    {"source_type": {"$eq": "patient"}},
                    {"patient_id": {"$eq": request.user_id}}
                ]
            }
        else:
            where_filter = {"source_type": {"$eq": "guideline"}}

        results = self.collection.query(
            query_texts=[request.query_text],
            n_results=request.top_k,
            where=where_filter
        )
        
        retrieved_chunks = []
        if results['ids'][0]:
            for i in range(len(results['ids'][0])):
                distance = results['distances'][0][i]
                
                # --- THE DEFINITIVE LOGIC ---
                # Always check for relevance. If the result is too "far" away
                # (i.e., the score is too high), discard it.
                if distance <= distance_threshold:
                    retrieved_chunks.append(DocumentChunk(
                        content=results['documents'][0][i],
                        metadata=results['metadatas'][0][i],
                        score=distance
                    ))
        
        return RAGResponse(retrieved_chunks=retrieved_chunks)

# --- 3. Standalone Ingestion Script ---
def run_ingestion(rag_service: RAGService, base_data_path: str):
    """Scans directories, clears the old index, and ingests all documents."""
    rag_service._clear_collection()
    
    patient_dir = os.path.join(base_data_path, "patient_records")
    guideline_dir = os.path.join(base_data_path, "medical_guidelines")

    # Ingest medical guidelines
    print(f"\n--- Scanning Guideline Directory: {guideline_dir} ---")
    for filename in os.listdir(guideline_dir):
        file_path = os.path.join(guideline_dir, filename)
        if os.path.isfile(file_path):
            rag_service._ingest_single_document(file_path, source_type='guideline')

    # Ingest patient records
    print(f"\n--- Scanning Patient Record Directory: {patient_dir} ---")
    for filename in os.listdir(patient_dir):
        file_path = os.path.join(patient_dir, filename)
        if os.path.isfile(file_path):
            try:
                # Convention: patient-<ID>_... (e.g., patient-123_notes.txt)
                user_id = filename.split('-')[1].split('_')[0]
                rag_service._ingest_single_document(file_path, source_type='patient', user_id=user_id)
            except IndexError:
                print(f"!! Warning: Skipping file with invalid name format: {filename}")

    print(f"\n--- Ingestion Complete. Total documents in collection: {rag_service.collection.count()} ---")

# --- 4. Standalone Test Block ---
if __name__ == '__main__':
    # --- Setup a temporary environment for testing ---
    DB_DIR = "./chroma_db_test"
    DATA_DIR = "./temp_data"
    
    # Clean up previous runs
    if os.path.exists(DB_DIR): shutil.rmtree(DB_DIR)
    if os.path.exists(DATA_DIR): shutil.rmtree(DATA_DIR)
        
    PATIENT_DIR = os.path.join(DATA_DIR, "patient_records")
    GUIDELINE_DIR = os.path.join(DATA_DIR, "medical_guidelines")
    os.makedirs(PATIENT_DIR, exist_ok=True)
    os.makedirs(GUIDELINE_DIR, exist_ok=True)

    # Create dummy data files with the correct naming convention
    with open(os.path.join(PATIENT_DIR, "patient-123_notes.txt"), "w") as f:
        f.write("Patient John Doe (ID: 123) reported persistent headaches. Prescribed standard analgesics.")
    with open(os.path.join(PATIENT_DIR, "patient-456_allergies.txt"), "w") as f:
        f.write("Patient Jane Smith (ID: 456) presented with symptoms of seasonal allergies.")
    with open(os.path.join(GUIDELINE_DIR, "hypertension_guidelines.txt"), "w") as f:
        f.write("Guidelines for managing hypertension recommend lifestyle changes as the first line of treatment.")

    # --- Run the full workflow ---
    rag_service = RAGService(db_path=DB_DIR)
    run_ingestion(rag_service, base_data_path=DATA_DIR)

    # --- Run Test Queries to Verify ---
    print("\n\n--- Running Verification Queries ---")
    
    # Test 1: Patient 123's data
    print("\n[Query 1] Asking about Patient 123's headaches (should succeed)...")
    response_123 = rag_service.query(RAGQuery(query_text="What was wrong with my head?", user_id='123', source_type='patient'))
    print(response_123.model_dump_json(indent=2))
    assert len(response_123.retrieved_chunks) > 0

    # Test 2: Security check - Patient 456 asking about headaches (should fail)
    print("\n[Query 2] Patient 456 asking about headaches (should find nothing)...")
    response_456 = rag_service.query(RAGQuery(query_text="What about headaches?", user_id='456', source_type='patient'))
    print(response_456.model_dump_json(indent=2))
    assert len(response_456.retrieved_chunks) == 0
    print("--> Correctly returned no results, as expected.")

    # Test 3: Guideline data
    print("\n[Query 3] Asking about hypertension treatment (should succeed)...")
    response_guideline = rag_service.query(RAGQuery(query_text="How should hypertension be treated?", source_type='guideline'))
    print(response_guideline.model_dump_json(indent=2))
    assert len(response_guideline.retrieved_chunks) > 0
    
    print("\n--- All tests passed successfully! ---")