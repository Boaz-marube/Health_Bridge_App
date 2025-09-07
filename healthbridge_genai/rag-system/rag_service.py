# --- Installation ---
# pip install chromadb sentence-transformers pydantic "langchain_community[docloaders]"
import sys
print(f"--- Script is being run by: {sys.executable} ---")

import os
import uuid
from typing import List, Dict, Any, Literal

from pydantic import BaseModel, Field
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import chromadb

# --- 1. Define the "Contract" with Pydantic Models ---
# This ensures the inputs and outputs of your service are well-defined.

class RAGQuery(BaseModel):
    query_text: str
    user_id: str | None = None
    source_type: Literal['patient', 'guideline']
    top_k: int = 3

class DocumentChunk(BaseModel):
    content: str
    metadata: Dict[str, Any]
    score: float # ChromaDB calls this 'distance', we'll map it

class RAGResponse(BaseModel):
    retrieved_chunks: List[DocumentChunk]



# --- 3. The RAG Service Class ---
# This class encapsulates all the logic for ingestion and querying.

class RAGService:
    def __init__(self, db_path: str, collection_name: str = "healthbridge_ai"):
        self.db_path = db_path
        self.collection_name = collection_name
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(path=self.db_path)
        # Get or create the collection (use Chroma's built-in embedding model)
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name
        )
        # Initialize a text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=150
        )
        print(f"RAGService initialized. Collection '{self.collection_name}' loaded/created with {self.collection.count()} documents.")

    def _load_and_chunk_document(self, file_path: str) -> List[str]:
        """Loads and chunks a document based on its file type."""
        if file_path.lower().endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        elif file_path.lower().endswith(".txt"):
            loader = TextLoader(file_path, encoding='utf-8')
        else:
            raise ValueError(f"Unsupported file type: {file_path}")
        
        documents = loader.load()
        chunks = self.text_splitter.split_documents(documents)
        return [chunk.page_content for chunk in chunks]

    def ingest_document(self, file_path: str, source_type: Literal['patient', 'guideline'], user_id: str | None = None):
        """Ingests a single document, chunks it, and stores it in ChromaDB."""
        if source_type == 'patient' and not user_id:
            raise ValueError("user_id is required when ingesting a 'patient' document.")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        chunks = self._load_and_chunk_document(file_path)
        
        metadatas = []
        for i, chunk in enumerate(chunks):
            metadata = {
                "source_file": os.path.basename(file_path),
                "source_type": source_type,
                "chunk_index": i
            }
            if source_type == 'patient':
                metadata["patient_id"] = user_id
            metadatas.append(metadata)
        
        # Generate unique IDs for each chunk
        ids = [str(uuid.uuid4()) for _ in chunks]
        
        # Add to the collection
        self.collection.add(
            ids=ids,
            documents=chunks,
            metadatas=metadatas
        )
        print(f"Successfully ingested {len(chunks)} chunks from {file_path}.")

    def query(self, request: RAGQuery) -> RAGResponse:
        """Queries the vector database based on the request."""
        
        where_filter = {"source_type": request.source_type}
        if request.source_type == 'patient':
            if not request.user_id:
                raise ValueError("user_id is required for patient data queries.")
            # This filter is the core of your security model!
            where_filter["patient_id"] = request.user_id
        
        results = self.collection.query(
            query_texts=[request.query_text],
            n_results=request.top_k,
            where=where_filter
        )
        
        retrieved_chunks = []
        # The result structure from Chroma is a list of lists, one for each query. We only have one query.
        if results['ids'][0]:
            for i in range(len(results['ids'][0])):
                chunk = DocumentChunk(
                    content=results['documents'][0][i],
                    metadata=results['metadatas'][0][i],
                    score=results['distances'][0][i] # score is the distance metric
                )
                retrieved_chunks.append(chunk)

        return RAGResponse(retrieved_chunks=retrieved_chunks)

# --- 4. Standalone Test Block ---
# This allows you to run `python rag_service.py` to test everything.

if __name__ == '__main__':
    # --- Setup a temporary environment for testing ---
    print("--- Setting up test environment ---")
    DB_DIR = "./chroma_db_test"
    DATA_DIR = "./temp_data"
    PATIENT_DIR = os.path.join(DATA_DIR, "patient_records")
    GUIDELINE_DIR = os.path.join(DATA_DIR, "medical_guidelines")

    # Clean up previous runs
    if os.path.exists(DB_DIR):
        import shutil
        shutil.rmtree(DB_DIR)
    if os.path.exists(DATA_DIR):
        import shutil
        shutil.rmtree(DATA_DIR)
        
    os.makedirs(PATIENT_DIR, exist_ok=True)
    os.makedirs(GUIDELINE_DIR, exist_ok=True)

    # Create dummy data files
    with open(os.path.join(PATIENT_DIR, "patient_123_notes.txt"), "w") as f:
        f.write("Patient John Doe (ID: 123) reported persistent headaches. Prescribed standard analgesics. Follow-up in two weeks. Lab results for blood sugar are normal.")
    
    with open(os.path.join(PATIENT_DIR, "patient_456_notes.txt"), "w") as f:
        f.write("Patient Jane Smith (ID: 456) presented with symptoms of seasonal allergies. Recommended over-the-counter antihistamines.")
        
    with open(os.path.join(GUIDELINE_DIR, "hypertension_guidelines.txt"), "w") as f:
        f.write("The 2024 guidelines for managing hypertension recommend lifestyle changes as the first line of treatment. This includes diet, exercise, and stress reduction.")

    print("\n--- Initializing RAGService ---")
    rag_service = RAGService(db_path=DB_DIR)

    print("\n--- Ingesting Documents ---")
    rag_service.ingest_document(os.path.join(PATIENT_DIR, "patient_123_notes.txt"), source_type='patient', user_id='123')
    rag_service.ingest_document(os.path.join(PATIENT_DIR, "patient_456_notes.txt"), source_type='patient', user_id='456')
    rag_service.ingest_document(os.path.join(GUIDELINE_DIR, "hypertension_guidelines.txt"), source_type='guideline')

    print(f"\nTotal documents in collection: {rag_service.collection.count()}")

    print("\n\n--- Running Test Queries ---")
    
    # 1. Test Patient 123's data
    print("\n[Query 1] Asking about Patient 123's headaches...")
    patient_query_123 = RAGQuery(query_text="What was wrong with my head?", user_id='123', source_type='patient')
    response_123 = rag_service.query(patient_query_123)
    print(response_123.model_dump_json(indent=2))

    # 2. Test security: Patient 456 tries to access Patient 123's data
    print("\n[Query 2] Patient 456 asking about headaches (should find nothing)...")
    patient_query_456 = RAGQuery(query_text="What about headaches?", user_id='456', source_type='patient')
    response_456 = rag_service.query(patient_query_456)
    print(response_456.model_dump_json(indent=2)) # Should be empty
    assert len(response_456.retrieved_chunks) == 0
    print("--> Correctly returned no results, as expected.")

    # 3. Test Guideline data
    print("\n[Query 3] Asking about hypertension treatment...")
    guideline_query = RAGQuery(query_text="How should hypertension be treated?", source_type='guideline')
    response_guideline = rag_service.query(guideline_query)
    print(response_guideline.model_dump_json(indent=2))