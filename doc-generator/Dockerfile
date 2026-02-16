FROM python:3.11-slim

# LibreOffice + fonts (fonts matter for consistent PDF output)
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire doc-generator source tree
COPY app.py .
COPY generator.py .
COPY ai_generator.py .
COPY supabase_client.py .
COPY pdf_convert.py .
COPY templates/ templates/
COPY img/ img/

# Create output directory
RUN mkdir -p /app/output

ENV PORT=8080
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
