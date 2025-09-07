# In rag_system/data_models.py
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Literal

class RAGQuery(BaseModel):
    query_text: str
    user_id: str | None = None  # Required for patient data, optional for guidelines
    source_type: Literal['patient', 'guideline']
    top_k: int = 5

class DocumentChunk(BaseModel):
    content: str
    metadata: Dict[str, Any]
    score: float

class RAGResponse(BaseModel):
    retrieved_chunks: List[DocumentChunk]