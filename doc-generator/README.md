# Doc Generator - DOCX/PDF Generation Service

FastAPI service that generates DOCX and PDF documents from templates using placeholder substitution.

## Setup

```bash
cd doc-generator

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

## Verify LibreOffice Installation

```bash
# Check if LibreOffice is installed
soffice --version

# If not installed:
# Ubuntu/Debian:
sudo apt-get install libreoffice

# macOS:
brew install --cask libreoffice
```

## Run Server

```bash
# Development (with auto-reload)
uvicorn app:app --reload --port 8000

# Production
uvicorn app:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### POST /generate

Generate DOCX/PDF from provided placeholders.

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "product": "CPP",
    "placeholders": {
      "CPP_PROJECT_TITLE": "Test Project",
      "CPP_COMPANY_NAME": "Acme Ltd"
    },
    "images": {},
    "output_basename": "test_output"
  }'
```

### POST /generate-from-submission

Generate DOCX/PDF from a Supabase submission ID.

```bash
curl -X POST http://localhost:8000/generate-from-submission \
  -H "Content-Type: application/json" \
  -d '{"submission_id": "your-uuid-here"}'
```

### GET /health

Health check endpoint.

```bash
curl http://localhost:8000/health
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| SUPABASE_URL | (required) | Supabase project URL |
| SUPABASE_SERVICE_ROLE_KEY | (required) | Supabase service role key |
| TEMPLATE_DIR | doc-generator/templates | Path to template DOCX files |
| OUTPUT_DIR | doc-generator/output | Path for generated files |
| LIBREOFFICE_BIN | soffice | LibreOffice binary path |

## Troubleshooting

### "soffice: command not found"

LibreOffice is not installed or not in PATH. Install it and ensure the binary is accessible.

### "Template not found"

Ensure the template file exists in the templates directory and matches the product name:
- `CPP_TEMPLATE_WORKING_v1 copy.docx` for CPP
- `RAMS_TEMPLATE_WORKING_v1 copy.docx` for RAMS

### "PDF conversion failed"

Check LibreOffice installation and ensure it can run in headless mode:
```bash
soffice --headless --version
```

## File Structure

```
doc-generator/
├── app.py              # FastAPI application
├── generator.py        # DOCX generation logic
├── pdf_convert.py      # PDF conversion using LibreOffice
├── supabase_client.py  # Supabase client wrapper
├── requirements.txt    # Python dependencies
├── templates/          # DOCX templates
│   ├── CPP_TEMPLATE_WORKING_v1.docx
│   └── RAMS_TEMPLATE_WORKING_v1.docx
├── output/             # Generated files (gitignored)
└── sample_payloads/    # Sample request payloads
```
