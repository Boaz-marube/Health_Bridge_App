# HealthBridge AI - Medical RAG System with CrewAI

A comprehensive medical AI system that combines Retrieval-Augmented Generation (RAG) with CrewAI agents, powered by Gemini LLM, for intelligent medical assistance and clinical decision support.

## 🏗️ Project Structure

```
healthbridge_genai/
├── src/                          # Core application code
│   └── healthbridge_genai/
│       ├── config/               # Agent and task configurations
│       │   ├── agents.yaml       # CrewAI agent definitions
│       │   └── tasks.yaml        # CrewAI task definitions
│       ├── tools/                # Custom CrewAI tools
│       │   ├── rag_tool.py       # RAG integration tools
│       │   └── custom_tool.py    # Template for custom tools
│       └── crew.py               # Main CrewAI crew setup
├── rag-system/                   # RAG implementation
│   ├── rag_service.py            # Core RAG service
│   └── knowledge/                # Source knowledge files
│       ├── Medical_book.pdf      # Medical reference
│       └── Village_Healthcare_Handbook.pdf
├── tests/                        # Test scripts
│   ├── test_gemini_integration.py
│   └── test_real_medical_knowledge.py
├── scripts/                      # Utility scripts
│   ├── rag_integration_demo.py   # Demo with sample data
│   └── index_real_knowledge.py   # Index real medical documents
├── docs/                         # Documentation
│   ├── RAG_INTEGRATION_GUIDE.md  # Comprehensive integration guide
│   └── gemini_requirements.txt   # Gemini-specific dependencies
├── real_data/                    # Organized medical data
│   ├── medical_guidelines/       # Medical knowledge PDFs
│   └── patient_records/          # Patient-specific files
├── real_medical_db/              # ChromaDB with real medical knowledge
├── demo_chroma_db/               # ChromaDB with demo data
└── demo_data/                    # Demo data for testing
```

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install dependencies
pip install -r pyproject.toml

# Install Gemini support
pip install langchain-google-genai litellm
```

### 2. Environment Setup

Create a `.env` file:
```
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Index Medical Knowledge

```bash
# Copy your medical PDFs to real_data/medical_guidelines/
# Then run:
python scripts/index_real_knowledge.py
```

### 4. Test the System

```bash
# Test Gemini integration
python tests/test_gemini_integration.py

# Test with real medical knowledge
python tests/test_real_medical_knowledge.py
```

## 🤖 CrewAI Agents

### Medical Agents
- **`medical_history_agent`**: Retrieves and summarizes patient medical records
- **`symptom_checker_agent`**: Analyzes symptoms and provides preliminary assessments
- **`treatment_guideline_agent`**: Provides evidence-based treatment recommendations

### Operational Agents
- **`appointment_scheduler_agent`**: Handles appointment booking and management
- **`queue_monitoring_agent`**: Monitors patient flow and queues
- **`analytics_agent`**: Generates reports and analytics

## 🔧 RAG Tools

### PatientRAGTool
- **Purpose**: Searches patient-specific medical records
- **Security**: Patient ID filtering for data privacy
- **Usage**: Medical history retrieval, medication reviews

### GuidelineRAGTool
- **Purpose**: Searches medical guidelines and protocols
- **Usage**: Treatment recommendations, clinical protocols

### RAGTool (General)
- **Purpose**: Flexible tool for both patient and guideline queries
- **Usage**: Versatile medical information retrieval

## 📊 Key Features

### 🔒 Security & Privacy
- Patient data isolation by ID
- Secure RAG tool access control
- Medical disclaimer integration

### 🧠 AI-Powered
- **Gemini 1.5 Flash** for fast, accurate responses
- **ChromaDB** for efficient vector storage
- **LangChain** for document processing

### 🏥 Medical Focus
- Real medical literature integration
- Clinical decision support
- Emergency procedure protocols

## Installation

Ensure you have Python >=3.10 <3.14 installed on your system. This project uses [UV](https://docs.astral.sh/uv/) for dependency management and package handling, offering a seamless setup and execution experience.

First, if you haven't already, install uv:

```bash
pip install uv
```

Next, navigate to your project directory and install the dependencies:

(Optional) Lock the dependencies and install them by using the CLI command:
```bash
crewai install
```
### Customizing

**Add your `OPENAI_API_KEY` into the `.env` file**

- Modify `src/healthbridge_genai/config/agents.yaml` to define your agents
- Modify `src/healthbridge_genai/config/tasks.yaml` to define your tasks
- Modify `src/healthbridge_genai/crew.py` to add your own logic, tools and specific args
- Modify `src/healthbridge_genai/main.py` to add custom inputs for your agents and tasks

## Running the Project

To kickstart your crew of AI agents and begin task execution, run this from the root folder of your project:

```bash
$ crewai run
```

This command initializes the healthbridge_genai Crew, assembling the agents and assigning them tasks as defined in your configuration.

This example, unmodified, will run the create a `report.md` file with the output of a research on LLMs in the root folder.

## Understanding Your Crew

The healthbridge_genai Crew is composed of multiple AI agents, each with unique roles, goals, and tools. These agents collaborate on a series of tasks, defined in `config/tasks.yaml`, leveraging their collective skills to achieve complex objectives. The `config/agents.yaml` file outlines the capabilities and configurations of each agent in your crew.

## Support

For support, questions, or feedback regarding the HealthbridgeGenai Crew or crewAI.
- Visit our [documentation](https://docs.crewai.com)
- Reach out to us through our [GitHub repository](https://github.com/joaomdmoura/crewai)
- [Join our Discord](https://discord.com/invite/X4JWnZnxPb)
- [Chat with our docs](https://chatg.pt/DWjSBZn)

Let's create wonders together with the power and simplicity of crewAI.
