FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# build context is doc-generator/, so copy everything from there
COPY . .

RUN mkdir -p /app/output

ENV PORT=8080

ENV PYTHONPATH=/app

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]



