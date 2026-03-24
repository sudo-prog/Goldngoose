# RAG_GOD Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY apps/backend/requirements.txt apps/backend/requirements.txt
COPY apps/rag_god/requirements.txt apps/rag_god/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r apps/backend/requirements.txt

# Copy application code
COPY apps/backend/ apps/backend/
COPY apps/rag_god/ apps/rag_god/

# Create data directory for logs
RUN mkdir -p apps/rag_god/data/logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["python", "apps/backend/main.py"]
