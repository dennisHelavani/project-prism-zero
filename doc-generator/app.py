"""
FastAPI application for DOCX/PDF document generation.
"""

import os
import logging
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from generator import generate_docx, TemplateNotFoundError
from pdf_convert import convert_to_pdf, LibreOfficeError
from supabase_client import get_submission, update_submission_outputs

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Hard Hat AI Doc Generator",
    description="DOCX/PDF generation service for CPP and RAMS documents",
    version="1.0.0"
)

# Environment configuration
TEMPLATE_DIR = os.environ.get('TEMPLATE_DIR', os.path.join(os.path.dirname(__file__), 'templates'))
OUTPUT_DIR = os.environ.get('OUTPUT_DIR', os.path.join(os.path.dirname(__file__), 'output'))

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)


class GenerateRequest(BaseModel):
    product: str  # "CPP" or "RAMS"
    placeholders: dict
    images: Optional[dict] = {}
    output_basename: Optional[str] = None


class GenerateFromSubmissionRequest(BaseModel):
    submission_id: str


class GenerateResponse(BaseModel):
    docx_path: str
    pdf_path: Optional[str] = None


class GenerateFromSubmissionResponse(BaseModel):
    docx_path: str
    pdf_path: Optional[str] = None
    updated_submission_id: str


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "template_dir": TEMPLATE_DIR,
        "output_dir": OUTPUT_DIR,
        "templates_available": os.listdir(TEMPLATE_DIR) if os.path.exists(TEMPLATE_DIR) else []
    }


@app.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    """
    Generate DOCX and PDF from provided placeholders.
    
    Args:
        request: GenerateRequest with product, placeholders, optional images, optional output_basename
    
    Returns:
        GenerateResponse with paths to generated DOCX and PDF files
    """
    logger.info(f"Generate request: product={request.product}")
    
    # Validate product
    product = request.product.upper()
    if product not in ("CPP", "RAMS"):
        raise HTTPException(status_code=400, detail=f"Invalid product: {product}. Must be 'CPP' or 'RAMS'")
    
    # Determine template path
    template_map = {
        "CPP": "CPP_TEMPLATE_WORKING_v1.docx",
        "RAMS": "RAMS_TEMPLATE_WORKING_v1.docx"
    }
    template_path = os.path.join(TEMPLATE_DIR, template_map[product])
    
    # Generate output filename
    if request.output_basename:
        basename = request.output_basename
    else:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        basename = f"{product}_{timestamp}"
    
    docx_path = os.path.join(OUTPUT_DIR, f"{basename}.docx")
    
    try:
        # Generate DOCX
        logger.info(f"Generating DOCX: {docx_path}")
        generate_docx(
            template_path=template_path,
            output_path=docx_path,
            placeholders=request.placeholders,
            images=request.images or {}
        )
        logger.info(f"DOCX generated successfully: {docx_path}")
        
        # Convert to PDF
        logger.info(f"Converting to PDF...")
        pdf_path = convert_to_pdf(docx_path, OUTPUT_DIR)
        logger.info(f"PDF generated successfully: {pdf_path}")
        
        return GenerateResponse(docx_path=docx_path, pdf_path=pdf_path)
        
    except TemplateNotFoundError as e:
        logger.error(f"Template not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except LibreOfficeError as e:
        logger.warning(f"PDF conversion failed (continuing with DOCX only): {e}")
        return GenerateResponse(docx_path=docx_path, pdf_path=None)
    except Exception as e:
        logger.exception(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Document generation failed: {e}")


@app.post("/generate-from-submission", response_model=GenerateFromSubmissionResponse)
def generate_from_submission(request: GenerateFromSubmissionRequest):
    """
    Generate DOCX and PDF from a Supabase submission ID.
    
    Args:
        request: GenerateFromSubmissionRequest with submission_id
    
    Returns:
        GenerateFromSubmissionResponse with paths and updated submission ID
    """
    logger.info(f"Generate from submission: id={request.submission_id}")
    
    # Fetch submission from Supabase
    try:
        submission = get_submission(request.submission_id)
    except Exception as e:
        logger.error(f"Failed to fetch submission: {e}")
        raise HTTPException(status_code=404, detail=f"Submission not found: {e}")
    
    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission not found: {request.submission_id}")
    
    product = submission.get("product", "").upper()
    placeholders = submission.get("placeholders", {})
    uploads = submission.get("uploads", {})
    
    logger.info(f"Submission data: product={product}, placeholders_count={len(placeholders)}")
    
    # Validate product
    if product not in ("CPP", "RAMS"):
        raise HTTPException(status_code=400, detail=f"Invalid product in submission: {product}")
    
    # Determine template path
    template_map = {
        "CPP": "CPP_TEMPLATE_WORKING_v1.docx",
        "RAMS": "RAMS_TEMPLATE_WORKING_v1.docx"
    }
    template_path = os.path.join(TEMPLATE_DIR, template_map[product])
    
    # Generate output filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    basename = f"{product}_{request.submission_id[:8]}_{timestamp}"
    docx_path = os.path.join(OUTPUT_DIR, f"{basename}.docx")
    
    try:
        # Generate DOCX
        logger.info(f"Generating DOCX: {docx_path}")
        generate_docx(
            template_path=template_path,
            output_path=docx_path,
            placeholders=placeholders,
            images=uploads  # uploads may contain image paths
        )
        logger.info(f"DOCX generated successfully: {docx_path}")
        
        # Convert to PDF
        logger.info(f"Converting to PDF...")
        pdf_path = convert_to_pdf(docx_path, OUTPUT_DIR)
        logger.info(f"PDF generated successfully: {pdf_path}")
        
        # Update submission with outputs
        outputs = {
            "docx_path": docx_path,
            "pdf_path": pdf_path,
            "generated_at": datetime.now().isoformat()
        }
        
        logger.info(f"Updating submission outputs...")
        update_submission_outputs(request.submission_id, outputs)
        logger.info(f"Submission updated successfully")
        
        return GenerateFromSubmissionResponse(
            docx_path=docx_path,
            pdf_path=pdf_path,
            updated_submission_id=request.submission_id
        )
        
    except TemplateNotFoundError as e:
        logger.error(f"Template not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except LibreOfficeError as e:
        logger.warning(f"PDF conversion failed (continuing with DOCX only): {e}")
        
        # Update submission with DOCX only and error message
        outputs = {
            "docx_path": docx_path,
            "pdf_path": None,
            "pdf_error": str(e),
            "generated_at": datetime.now().isoformat()
        }
        
        try:
            logger.info(f"Updating submission outputs (DOCX only)...")
            update_submission_outputs(request.submission_id, outputs)
        except Exception as update_err:
            logger.error(f"Failed to update submission after PDF error: {update_err}")

        return GenerateFromSubmissionResponse(
            docx_path=docx_path,
            pdf_path=None,
            updated_submission_id=request.submission_id
        )
    except Exception as e:
        logger.exception(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Document generation failed: {e}")


@app.get("/download/{submission_id}")
def download_document(submission_id: str, format: str = "docx"):
    """
    Download the generated document for a submission.
    
    Args:
        submission_id: The submission ID to download the document for
        format: File format to download - 'pdf' or 'docx' (default: docx)
    
    Returns:
        FileResponse with the requested file
    """
    from fastapi.responses import FileResponse
    
    logger.info(f"Download request for submission: {submission_id}, format: {format}")
    
    if format not in ("pdf", "docx"):
        raise HTTPException(status_code=400, detail="Invalid format. Use 'pdf' or 'docx'")
    
    # Fetch submission from Supabase to get the file path
    try:
        submission = get_submission(submission_id)
    except Exception as e:
        logger.error(f"Failed to fetch submission: {e}")
        raise HTTPException(status_code=404, detail=f"Submission not found: {e}")
    
    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission not found: {submission_id}")
    
    outputs = submission.get("outputs", {})
    docx_path = outputs.get("docx_path")
    pdf_path = outputs.get("pdf_path")
    
    # Select file based on format
    if format == "pdf":
        file_path = pdf_path
        media_type = "application/pdf"
        extension = "pdf"
    else:
        file_path = docx_path
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        extension = "docx"
    
    if not file_path:
        raise HTTPException(status_code=404, detail=f"{format.upper()} not available")
    
    if not os.path.exists(file_path):
        logger.error(f"File not found on disk: {file_path}")
        raise HTTPException(status_code=404, detail="Document file not found")
    
    # Get product for filename
    product = submission.get("product", "Document")
    filename = f"{product}_{submission_id[:8]}.{extension}"
    
    logger.info(f"Serving file: {file_path} as {filename}")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
