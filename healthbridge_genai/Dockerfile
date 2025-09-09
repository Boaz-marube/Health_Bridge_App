# Dockerfile for HealthBridge AI API
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PERSIST_DIRECTORY=/app/data/chromadb

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory for ChromaDB
RUN mkdir -p /app/data/chromadb

# Create non-root user
RUN useradd -m -u 1000 healthbridge && \
    chown -R healthbridge:healthbridge /app

# Switch to non-root user
USER healthbridge

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Start the application
CMD ["uvicorn", "src.healthbridge_genai.crew_api:app", "--host", "0.0.0.0", "--port", "8000"]
