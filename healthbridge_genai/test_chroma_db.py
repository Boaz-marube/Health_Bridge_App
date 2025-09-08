# test_chroma_db.py
"""
Test script to verify ChromaDB contents and run a sample query.
"""

import os
from chromadb import PersistentClient  # ✅ Use PersistentClient, not Client
from chromadb.config import Settings

# ---------------------------
# Configuration
# ---------------------------
# Use the folder where your real medical knowledge was indexed
CHROMA_DIR = "real_medical_db"  # Relative to current working directory

# ---------------------------
# Initialize Chroma persistent client
# ---------------------------
print(f"📂 Loading ChromaDB from: {os.path.abspath(CHROMA_DIR)}")
client = PersistentClient(path=CHROMA_DIR)  # ✅ This loads from disk

# ---------------------------
# List collections
# ---------------------------
collections = client.list_collections()
if not collections:
    print("⚠️ No collections found in Chroma DB.")
    exit(1)

print(f"✅ Collections found: {[c.name for c in collections]}")

# Pick the first collection
collection_name = collections[0].name
collection = client.get_collection(name=collection_name)

# ---------------------------
# Show document count
# ---------------------------
doc_count = collection.count()
print(f"📄 Number of documents in collection '{collection_name}': {doc_count}")

if doc_count == 0:
    print("⚠️ No documents found in Chroma DB. You may need to re-run your ingestion.")
else:
    # ---------------------------
    # Run a test query
    # ---------------------------
    test_query = "What are the symptoms of hypertension?"
    results = collection.query(
        query_texts=[test_query],
        n_results=3
    )

    print("\n🔍 Sample query results:")
    for i, content in enumerate(results['documents'][0]):
        preview = content[:200] + "..." if len(content) > 200 else content
        print(f"{i+1}. {preview}")