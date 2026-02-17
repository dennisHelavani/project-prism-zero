FROM python:3.11-slim

# System deps: LibreOffice + font system + common fonts + curl (for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    fontconfig \
    fonts-dejavu \
    fonts-liberation \
    fonts-noto-core \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# build context is doc-generator/, so copy everything from there
COPY . .

RUN mkdir -p /app/output /tmp/lo

ENV PORT=8080
ENV PYTHONPATH=/app

# Make LibreOffice behave in containers (writable cache/config)
ENV HOME=/tmp
ENV TMPDIR=/tmp
ENV XDG_CACHE_HOME=/tmp
ENV XDG_CONFIG_HOME=/tmp
ENV SAL_USE_VCLPLUGIN=gen
ENV LIBREOFFICE_BIN=soffice

# CRITICAL: Do NOT set DOCGEN_URL here.
# pdf_convert.py uses local soffice only.
# DOCGEN_URL is only for the Next.js component to reach this container.

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
