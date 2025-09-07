"""
Index Real Medical Knowledge Script

This script indexes your actual medical documents (PDFs) into ChromaDB
for use with your CrewAI agents.
"""

import os
import shutil
from pathlib import Path
import sys

# Add the rag-system to path
rag_system_path = Path(__file__).parent.parent / "rag-system"
sys.path.append(str(rag_system_path))

from rag_service import RAGService, run_ingestion


def index_real_medical_knowledge():
    """Index your real medical documents into ChromaDB."""
    print("="*60)
    print("INDEXING REAL MEDICAL KNOWLEDGE")
    print("="*60)
    
    # Paths
    real_data_dir = Path(__file__).parent.parent / "real_data"
    real_db_dir = Path(__file__).parent.parent / "real_medical_db"
    
    # Check if real data exists
    medical_guidelines_dir = real_data_dir / "medical_guidelines"
    if not medical_guidelines_dir.exists():
        print(f"❌ Error: Directory not found: {medical_guidelines_dir}")
        print("Please create the directory structure and copy your medical files.")
        return False
    
    # Check for medical files
    pdf_files = list(medical_guidelines_dir.glob("*.pdf"))
    if not pdf_files:
        print(f"❌ Error: No PDF files found in {medical_guidelines_dir}")
        print("Please copy your medical PDFs to this directory:")
        print(f"  - Copy Medical_book.pdf")
        print(f"  - Copy Village_Healthcare_Handbook.pdf")
        return False
    
    print(f"📁 Found {len(pdf_files)} medical PDF files:")
    for pdf_file in pdf_files:
        print(f"  ✅ {pdf_file.name}")
    
    # Clean up previous real database
    if real_db_dir.exists():
        print(f"🧹 Cleaning previous database: {real_db_dir}")
        shutil.rmtree(real_db_dir)
    
    # Initialize RAG service for real data
    print(f"🚀 Initializing RAG service with database: {real_db_dir}")
    rag_service = RAGService(db_path=str(real_db_dir))
    
    # Ingest real medical documents
    print(f"📚 Starting ingestion of medical documents...")
    run_ingestion(rag_service, base_data_path=str(real_data_dir))
    
    # Verify ingestion
    total_docs = rag_service.collection.count()
    print(f"✅ Ingestion complete! Total document chunks: {total_docs}")
    
    # Test the indexed knowledge
    print("\n" + "-"*50)
    print("TESTING INDEXED KNOWLEDGE")
    print("-"*50)
    
    from rag_service import RAGQuery
    
    # Test queries on your real medical knowledge
    test_queries = [
        "What are the symptoms of hypertension?",
        "How to treat common fever?",
        "What are emergency medical procedures?",
        "Pain management techniques",
        "Basic first aid procedures"
    ]
    
    for query in test_queries:
        print(f"\n🔍 Testing query: '{query}'")
        try:
            rag_query = RAGQuery(
                query_text=query,
                source_type='guideline',
                top_k=2
            )
            response = rag_service.query(rag_query)
            
            if response.retrieved_chunks:
                print(f"  ✅ Found {len(response.retrieved_chunks)} relevant chunks")
                # Show first chunk preview
                first_chunk = response.retrieved_chunks[0]
                preview = first_chunk.content[:200] + "..." if len(first_chunk.content) > 200 else first_chunk.content
                print(f"  📖 Preview: {preview}")
            else:
                print("  ⚠️  No relevant chunks found")
                
        except Exception as e:
            print(f"  ❌ Query failed: {e}")
    
    print(f"\n" + "="*60)
    print("REAL MEDICAL KNOWLEDGE INDEXING COMPLETE!")
    print("="*60)
    print(f"📊 Database location: {real_db_dir}")
    print(f"📚 Total indexed chunks: {total_docs}")
    print(f"🎯 Your agents can now query real medical knowledge!")
    
    return str(real_db_dir)


def verify_file_structure():
    """Verify that the required file structure exists."""
    print("📋 CHECKING FILE STRUCTURE...")
    
    base_dir = Path(__file__).parent.parent
    real_data_dir = base_dir / "real_data"
    guidelines_dir = real_data_dir / "medical_guidelines"
    patients_dir = real_data_dir / "patient_records"
    
    print(f"✅ Base directory: {base_dir}")
    
    if real_data_dir.exists():
        print(f"✅ Real data directory exists: {real_data_dir}")
    else:
        print(f"❌ Missing: {real_data_dir}")
        return False
    
    if guidelines_dir.exists():
        print(f"✅ Guidelines directory exists: {guidelines_dir}")
        pdf_files = list(guidelines_dir.glob("*.pdf"))
        print(f"📄 Found {len(pdf_files)} PDF files:")
        for pdf in pdf_files:
            print(f"    - {pdf.name}")
    else:
        print(f"❌ Missing: {guidelines_dir}")
        return False
    
    if patients_dir.exists():
        print(f"✅ Patient records directory exists: {patients_dir}")
    else:
        print(f"❌ Missing: {patients_dir}")
        return False
    
    return True


if __name__ == "__main__":
    print("🔍 Starting real medical knowledge indexing process...\n")
    
    # Step 1: Verify file structure
    if not verify_file_structure():
        print("\n❌ File structure verification failed!")
        print("\n📋 TO FIX THIS:")
        print("1. Make sure real_data/medical_guidelines/ directory exists")
        print("2. Copy your PDF files to real_data/medical_guidelines/:")
        print("   - Medical_book.pdf")
        print("   - Village_Healthcare_Handbook.pdf")
        print("3. Run this script again")
        sys.exit(1)
    
    # Step 2: Index the knowledge
    try:
        db_path = index_real_medical_knowledge()
        
        if db_path:
            print(f"\n🎉 SUCCESS! Your real medical knowledge is now indexed.")
            print(f"\n📋 NEXT STEPS:")
            print(f"1. Update your test scripts to use: {db_path}")
            print(f"2. Your CrewAI agents can now access real medical knowledge")
            print(f"3. Test with: python test_real_medical_knowledge.py")
            
    except Exception as e:
        print(f"\n❌ Indexing failed: {e}")
        import traceback
        traceback.print_exc()
