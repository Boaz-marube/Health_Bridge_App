"""
RAG Tool for CrewAI - HealthBridge AI

This tool integrates the RAG service as a CrewAI tool that can be used by agents
to retrieve relevant medical information from patient records and medical guidelines.
"""

from crewai.tools import BaseTool
from typing import Type, Optional, Literal
from pydantic import BaseModel, Field
import os
import sys
from pathlib import Path

# Add the rag-system directory to the path to import RAGService
rag_system_path = Path(__file__).parent.parent.parent.parent / "rag-system"
sys.path.append(str(rag_system_path))

try:
    from rag_service import RAGService, RAGQuery, RAGResponse
except ImportError as e:
    raise ImportError(
        f"Could not import RAGService. Make sure the rag-system directory is accessible.\n"
        f"Error: {e}"
    )


class RAGToolInput(BaseModel):
    """Input schema for RAG Tool."""
    query_text: str = Field(
        ..., 
        description="The medical question or query to search for in the knowledge base"
    )
    user_id: Optional[str] = Field(
        None, 
        description="Patient ID for accessing patient-specific records (required for patient queries)"
    )
    source_type: Literal['patient', 'guideline'] = Field(
        ..., 
        description="Type of source to search: 'patient' for patient records, 'guideline' for medical guidelines"
    )
    top_k: int = Field(
        default=3, 
        description="Number of most relevant results to return (default: 3)"
    )
    distance_threshold: float = Field(
        default=1.6, 
        description="Maximum distance threshold for relevance filtering (default: 1.6)"
    )


class RAGTool(BaseTool):
    name: str = "Medical Knowledge Retrieval Tool"
    description: str = (
        "Retrieves relevant medical information from the HealthBridge knowledge base. "
        "Can search patient records (requires patient_id) or medical guidelines. "
        "Use this tool to find relevant medical history, symptoms, treatments, or guidelines "
        "that can help answer medical questions or support clinical decisions."
    )
    args_schema: Type[BaseModel] = RAGToolInput

    def __init__(self, db_path: str = None, **kwargs):
        # Set default database path if not provided
        if db_path is None:
            # Default to a chroma_db directory in the healthbridge_genai folder
            default_db_path = Path(__file__).parent.parent.parent.parent / "chroma_db"
            db_path = str(default_db_path)
        
        # Store db_path as instance variable before calling super().__init__
        self._db_path = db_path
        super().__init__(**kwargs)
        
        # Initialize RAG service after super().__init__
        self._rag_service = RAGService(db_path=db_path)

    def _run(
        self, 
        query_text: str, 
        source_type: Literal['patient', 'guideline'],
        user_id: Optional[str] = None, 
        top_k: int = 3,
        distance_threshold: float = 1.6
    ) -> str:
        """
        Execute the RAG query and return formatted results.
        """
        try:
            # Create RAG query
            rag_query = RAGQuery(
                query_text=query_text,
                user_id=user_id,
                source_type=source_type,
                top_k=top_k
            )
            
            # Execute query
            response: RAGResponse = self._rag_service.query(rag_query, distance_threshold)
            
            # Format response
            if not response.retrieved_chunks:
                return (
                    f"No relevant information found for query: '{query_text}'\n"
                    f"Source type: {source_type}\n"
                    f"This might indicate the information is not in the knowledge base "
                    f"or the query needs to be more specific."
                )
            
            # Format the retrieved chunks into a readable response
            formatted_response = f"Found {len(response.retrieved_chunks)} relevant results for: '{query_text}'\n\n"
            
            for i, chunk in enumerate(response.retrieved_chunks, 1):
                formatted_response += f"Result {i} (Relevance Score: {chunk.score:.3f}):\n"
                formatted_response += f"Content: {chunk.content}\n"
                
                # Add metadata information
                metadata = chunk.metadata
                if metadata.get('source_file'):
                    formatted_response += f"Source: {metadata['source_file']}\n"
                if metadata.get('patient_id'):
                    formatted_response += f"Patient ID: {metadata['patient_id']}\n"
                if metadata.get('chunk_index') is not None:
                    formatted_response += f"Section: {metadata['chunk_index']}\n"
                
                formatted_response += "\n" + "-" * 50 + "\n\n"
            
            return formatted_response.strip()
            
        except ValueError as e:
            return f"Error: {str(e)}"
        except Exception as e:
            return f"Unexpected error occurred while querying knowledge base: {str(e)}"


class PatientRAGTool(RAGTool):
    """Specialized RAG tool for patient record queries."""
    
    name: str = "Patient Records Retrieval Tool"
    description: str = (
        "Retrieves relevant information from patient medical records. "
        "This tool searches through patient-specific medical history, notes, "
        "symptoms, treatments, and other patient data. Requires a valid patient_id."
    )

    def _run(
        self, 
        query_text: str, 
        user_id: str,
        top_k: int = 3,
        distance_threshold: float = 1.6,
        source_type: Literal['patient'] = 'patient'  # Fixed to patient
    ) -> str:
        """Execute patient-specific RAG query."""
        return super()._run(
            query_text=query_text,
            source_type='patient',
            user_id=user_id,
            top_k=top_k,
            distance_threshold=distance_threshold
        )


class GuidelineRAGTool(RAGTool):
    """Specialized RAG tool for medical guideline queries."""
    
    name: str = "Medical Guidelines Retrieval Tool"
    description: str = (
        "Retrieves relevant medical guidelines, protocols, and clinical recommendations. "
        "This tool searches through medical literature, treatment protocols, "
        "diagnostic guidelines, and evidence-based medical practices."
    )

    def _run(
        self, 
        query_text: str, 
        top_k: int = 3,
        distance_threshold: float = 1.6,
        source_type: Literal['guideline'] = 'guideline',  # Fixed to guideline
        user_id: Optional[str] = None  # Not needed for guidelines
    ) -> str:
        """Execute guideline-specific RAG query."""
        return super()._run(
            query_text=query_text,
            source_type='guideline',
            user_id=None,  # Not needed for guidelines
            top_k=top_k,
            distance_threshold=distance_threshold
        )


# Convenience function to create the appropriate tool based on usage
def create_rag_tool(tool_type: str = "general", db_path: str = None) -> RAGTool:
    """
    Factory function to create RAG tools.
    
    Args:
        tool_type: Type of tool to create ('general', 'patient', 'guideline')
        db_path: Path to the Chroma database
    
    Returns:
        Appropriate RAG tool instance
    """
    if tool_type == "patient":
        return PatientRAGTool(db_path=db_path)
    elif tool_type == "guideline":
        return GuidelineRAGTool(db_path=db_path)
    else:
        return RAGTool(db_path=db_path)