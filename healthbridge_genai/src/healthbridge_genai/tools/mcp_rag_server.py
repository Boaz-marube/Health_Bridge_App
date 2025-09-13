#!/usr/bin/env python3
"""
MCP RAG Server
Bridges MCP <-> ChromaDB
"""

import asyncio
import json
from pathlib import Path
from chromadb import PersistentClient
from mcp.server import Server
from mcp.server.models import Tool, ToolResponse

BASE_DIR = Path(__file__).parent.parent.resolve()
PERSIST_DIRECTORY = BASE_DIR / "real_medical_db"

chroma_client = PersistentClient(path=str(PERSIST_DIRECTORY))
server = Server("rag_mcp")

@server.tool(name="rag_query", description="Query ChromaDB for relevant documents")
async def rag_query(query: str):
    """Perform similarity search in ChromaDB."""
    collections = chroma_client.list_collections()
    if not collections:
        return ToolResponse(content="⚠️ No collections found in ChromaDB")
    
    collection = chroma_client.get_collection(collections[0].name)
    results = collection.query(query_texts=[query], n_results=3)

    docs = []
    for i, doc in enumerate(results.get("documents", [[]])[0]):
        docs.append(f"{i+1}. {doc}")
    
    return ToolResponse(content="\n".join(docs))

async def main():
    await server.serve_stdio()

if __name__ == "__main__":
    asyncio.run(main())
