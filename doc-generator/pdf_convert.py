"""
PDF conversion using LibreOffice headless mode.
"""

import os
import subprocess
import logging

logger = logging.getLogger(__name__)

# LibreOffice binary path (can be overridden via environment variable)
LIBREOFFICE_BIN = os.environ.get('LIBREOFFICE_BIN', 'soffice')


class LibreOfficeError(Exception):
    """Raised when LibreOffice conversion fails."""
    pass


def convert_to_pdf(docx_path: str, output_dir: str) -> str:
    """
    Convert a DOCX file to PDF using LibreOffice headless mode.
    
    Args:
        docx_path: Path to the input DOCX file
        output_dir: Directory where the PDF will be saved
    
    Returns:
        Path to the generated PDF file
    
    Raises:
        LibreOfficeError: If conversion fails
    """
    if not os.path.exists(docx_path):
        raise LibreOfficeError(f"DOCX file not found: {docx_path}")
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Build command
    cmd = [
        LIBREOFFICE_BIN,
        '--headless',
        '--convert-to', 'pdf',
        '--outdir', output_dir,
        docx_path
    ]
    
    logger.info(f"Running LibreOffice conversion: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120  # 2 minute timeout
        )
        
        if result.returncode != 0:
            error_msg = result.stderr or result.stdout or "Unknown error"
            logger.error(f"LibreOffice conversion failed: {error_msg}")
            raise LibreOfficeError(f"LibreOffice conversion failed: {error_msg}")
        
        logger.info(f"LibreOffice output: {result.stdout}")
        
    except FileNotFoundError:
        raise LibreOfficeError(
            f"LibreOffice not found at '{LIBREOFFICE_BIN}'. "
            "Please install LibreOffice and ensure 'soffice' is in PATH, "
            "or set LIBREOFFICE_BIN environment variable to the correct path."
        )
    except subprocess.TimeoutExpired:
        raise LibreOfficeError("LibreOffice conversion timed out after 120 seconds")
    
    # Determine expected PDF path
    docx_basename = os.path.basename(docx_path)
    pdf_basename = os.path.splitext(docx_basename)[0] + '.pdf'
    pdf_path = os.path.join(output_dir, pdf_basename)
    
    # Verify PDF was created
    if not os.path.exists(pdf_path):
        raise LibreOfficeError(f"PDF file was not created: {pdf_path}")
    
    logger.info(f"PDF created successfully: {pdf_path}")
    return pdf_path


def check_libreoffice_installed() -> bool:
    """
    Check if LibreOffice is installed and accessible.
    
    Returns:
        True if LibreOffice is available, False otherwise
    """
    try:
        result = subprocess.run(
            [LIBREOFFICE_BIN, '--version'],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            logger.info(f"LibreOffice found: {result.stdout.strip()}")
            return True
        return False
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


if __name__ == "__main__":
    # Test LibreOffice installation
    logging.basicConfig(level=logging.INFO)
    if check_libreoffice_installed():
        print("✓ LibreOffice is installed and accessible")
    else:
        print("✗ LibreOffice is NOT installed or not accessible")
        print(f"  Tried: {LIBREOFFICE_BIN}")
        print("  Install with: sudo apt-get install libreoffice (Ubuntu)")
        print("  Or: brew install --cask libreoffice (macOS)")
