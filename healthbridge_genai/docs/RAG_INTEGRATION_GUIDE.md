# RAG Service Integration with CrewAI

This document explains how the RAG (Retrieval-Augmented Generation) service has been integrated as CrewAI tools for the HealthBridge AI system.

## Overview

The RAG service provides semantic search capabilities over medical documents, including patient records and medical guidelines. It has been wrapped as CrewAI tools that can be used by AI agents to retrieve relevant information to answer medical queries.

## Components

### 1. RAG Tools (`src/healthbridge_genai/tools/rag_tool.py`)

Three specialized tools have been created:

#### `RAGTool` (Base Tool)
- **Purpose**: General-purpose RAG tool that can search both patient records and medical guidelines
- **Input Parameters**:
  - `query_text`: The medical question to search for
  - `source_type`: Either 'patient' or 'guideline'
  - `user_id`: Patient ID (required for patient queries)
  - `top_k`: Number of results to return (default: 3)
  - `distance_threshold`: Relevance threshold (default: 1.6)

#### `PatientRAGTool` (Specialized)
- **Purpose**: Specialized tool for searching patient medical records
- **Security**: Automatically filters results by patient ID to ensure data privacy
- **Use Cases**: Medical history retrieval, symptom analysis, medication review

#### `GuidelineRAGTool` (Specialized)
- **Purpose**: Specialized tool for searching medical guidelines and protocols
- **Use Cases**: Treatment recommendations, diagnostic guidelines, clinical protocols

### 2. Agent Integration (`src/healthbridge_genai/crew.py`)

The crew setup has been modified to automatically assign appropriate RAG tools to agents:

```python
# Agent-Tool Mapping:
- medical_history_agent: PatientRAGTool
- treatment_guideline_agent: GuidelineRAGTool  
- symptom_checker_agent: Both PatientRAGTool and GuidelineRAGTool
```

### 3. Database Setup

The RAG system uses ChromaDB for vector storage:
- **Default location**: `healthbridge_genai/chroma_db/`
- **Collections**: Single collection storing both patient and guideline documents
- **Metadata**: Source type, patient ID, file names, chunk indices

## Usage Examples

### 1. Direct Tool Usage

```python
from healthbridge_genai.tools import create_rag_tool

# Create patient records tool
patient_tool = create_rag_tool("patient", db_path="./chroma_db")

# Query patient records
result = patient_tool._run(
    query_text="What medications is the patient taking?",
    user_id="123",
    source_type="patient"
)

# Create guidelines tool
guideline_tool = create_rag_tool("guideline", db_path="./chroma_db")

# Query medical guidelines
result = guideline_tool._run(
    query_text="What are the treatment options for hypertension?",
    source_type="guideline"
)
```

### 2. CrewAI Integration

```python
from pathlib import Path
from healthbridge_genai.crew import create_healthbridge_crew

# Create crew with RAG tools
config_dir = Path("src/healthbridge_genai/config")
crew, agents, tasks = create_healthbridge_crew(config_dir, db_path="./chroma_db")

# Agents automatically have access to appropriate RAG tools
# The tools will be called automatically based on task descriptions
```

### 3. Agent Task Examples

When you create tasks for agents, they can automatically use RAG tools:

```yaml
# In tasks.yaml
medical_history_task:
  description: >
    Retrieve the medical history for patient ID 123, focusing on 
    their current medications and recent symptoms.
  expected_output: >
    A summary of the patient's medical history including current 
    medications, recent visits, and relevant symptoms.
  agent: medical_history_agent
```

The `medical_history_agent` will automatically use its `PatientRAGTool` to search for relevant patient information.

## Data Organization

### Patient Records
- **Naming Convention**: `patient-{ID}_{description}.{ext}`
- **Example**: `patient-123_notes.txt`, `patient-456_allergies.pdf`
- **Security**: Records are filtered by patient ID to ensure privacy

### Medical Guidelines
- **Naming Convention**: `{topic}_guidelines.{ext}`
- **Example**: `hypertension_guidelines.txt`, `diabetes_management.pdf`
- **Access**: Available to all agents for clinical decision support

## Setup Instructions

### 1. Install Dependencies

```bash
cd healthbridge_genai
pip install chromadb langchain_community pydantic crewai
```

### 2. Prepare Your Data

Organize your medical documents:
```
data/
├── patient_records/
│   ├── patient-123_notes.txt
│   ├── patient-123_lab_results.pdf
│   └── patient-456_allergies.txt
└── medical_guidelines/
    ├── hypertension_guidelines.txt
    ├── diabetes_management.pdf
    └── emergency_protocols.txt
```

### 3. Initialize the RAG Database

```python
from rag_service import RAGService, run_ingestion

# Initialize RAG service
rag_service = RAGService(db_path="./chroma_db")

# Ingest all documents
run_ingestion(rag_service, base_data_path="./data")
```

### 4. Create and Use CrewAI Agents

```python
from healthbridge_genai.crew import create_healthbridge_crew

# Create crew with RAG capabilities
crew, agents, tasks = create_healthbridge_crew(
    config_dir="src/healthbridge_genai/config",
    db_path="./chroma_db"
)

# Run tasks - agents will use RAG tools automatically
result = crew.kickoff()
```

## Demo Script

Run the integration demo to see everything in action:

```bash
cd healthbridge_genai
python rag_integration_demo.py
```

This will:
1. Create sample patient and guideline data
2. Initialize the RAG database
3. Create CrewAI agents with RAG tools
4. Demonstrate tool usage with example queries

## Security Features

### Patient Data Privacy
- Patient records are filtered by patient ID
- Agents can only access records for the specified patient
- Cross-patient data leakage is prevented

### Access Control
- Different agents have access to different tool types
- Medical history agents only access patient tools
- Guideline agents only access guideline tools

## Advanced Configuration

### Custom Distance Thresholds
Adjust relevance filtering by modifying the distance threshold:

```python
# More strict relevance filtering
result = tool._run(
    query_text="symptoms",
    user_id="123",
    source_type="patient",
    distance_threshold=1.0  # Lower = more strict
)
```

### Multiple Results
Get more comprehensive results:

```python
result = tool._run(
    query_text="treatment options",
    source_type="guideline",
    top_k=5  # Return top 5 results
)
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure the rag-system directory is in your Python path
2. **Database Not Found**: Check that the ChromaDB path exists and is accessible
3. **No Results**: Try adjusting the distance threshold or rephrasing the query
4. **Patient Access Errors**: Ensure you provide a valid user_id for patient queries

### Debug Mode

Enable verbose logging to see what's happening:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# RAG tool calls will now show detailed information
```

## Next Steps

1. **Add More Document Types**: Extend support for additional medical document formats
2. **Enhanced Metadata**: Add more metadata fields for better filtering
3. **Real-time Updates**: Implement automatic document ingestion for new files
4. **Performance Optimization**: Add caching and query optimization
5. **Integration with Backend**: Connect RAG tools to the NestJS backend API

## API Integration

To integrate with your NestJS backend, you can expose the RAG functionality through FastAPI endpoints and call them from your CrewAI tools. See `src/healthbridge_genai/fastapi_rag_app.py` for the API implementation.
