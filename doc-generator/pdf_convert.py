"""
PDF conversion.
- Primary (local dev): LibreOffice headless mode via 'soffice'
- Production fallback: Remote DocGen service (FastAPI + LibreOffice in Docker)
"""

import os
import subprocess
import logging
import requests
from pathlib import Path

logger = logging.getLogger(__name__)

# LibreOffice binary path (can be overridden via environment variable)
LIBREOFFICE_BIN = os.environ.get("LIBREOFFICE_BIN", "soffice")

# Remote DocGen service (DigitalOcean)
DOCGEN_URL = os.environ.get("DOCGEN_URL", "").rstrip("/")
DOCGEN_KEY = os.environ.get("DOCGEN_KEY", "")


class LibreOfficeError(Exception):
    """Raised when PDF conversion fails."""
    pass


def convert_to_pdf(docx_path: str, output_dir: str) -> str:
    """
    Convert a DOCX file to PDF.

    Behavior:
    - If DOCGEN_URL is set -> use remote DocGen conversion (recommended for production).
    - Else -> use local LibreOffice conversion via soffice (good for local dev).
    """
    if not os.path.exists(docx_path):
        raise LibreOfficeError(f"DOCX file not found: {docx_path}")

    os.makedirs(output_dir, exist_ok=True)

    # Prefer remote DocGen when configured
    if DOCGEN_URL:
        logger.info("Using remote DocGen for PDF conversion")
        return _convert_to_pdf_via_docgen(docx_path, output_dir)

    # Otherwise try local LibreOffice
    logger.info("Using local LibreOffice for PDF conversion")
    return _convert_to_pdf_via_libreoffice(docx_path, output_dir)


def _convert_to_pdf_via_libreoffice(docx_path: str, output_dir: str) -> str:
    """Convert using local LibreOffice."""
    cmd = [
        LIBREOFFICE_BIN,
        "--headless",
        "--nologo",
        "--nofirststartwizard",
        "--convert-to", "pdf",
        "--outdir", output_dir,
        docx_path,
    ]

    logger.info(f"Running LibreOffice conversion: {' '.join(cmd)}")

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120
        )

        if result.returncode != 0:
            error_msg = result.stderr or result.stdout or "Unknown error"
            logger.error(f"LibreOffice conversion failed: {error_msg}")
            raise LibreOfficeError(f"LibreOffice conversion failed: {error_msg}")

        logger.info(f"LibreOffice output: {result.stdout.strip()}")

    except FileNotFoundError:
        raise LibreOfficeError(
            f"LibreOffice not found at '{LIBREOFFICE_BIN}'. "
            "Install LibreOffice or set LIBREOFFICE_BIN."
        )
    except subprocess.TimeoutExpired:
        raise LibreOfficeError("LibreOffice conversion timed out after 120 seconds")

    pdf_path = _expected_pdf_path(docx_path, output_dir)
    if not os.path.exists(pdf_path):
        # LibreOffice sometimes outputs slightly differently; try to find any PDF in output_dir
        candidates = list(Path(output_dir).glob("*.pdf"))
        if not candidates:
            raise LibreOfficeError(f"PDF file was not created: {pdf_path}")
        pdf_path = str(max(candidates, key=lambda p: p.stat().st_mtime))

    logger.info(f"PDF created successfully: {pdf_path}")
    return pdf_path


def _convert_to_pdf_via_docgen(docx_path: str, output_dir: str) -> str:
    """Convert by uploading DOCX to remote DocGen and saving returned PDF."""
    if not DOCGEN_URL:
        raise LibreOfficeError("DOCGEN_URL is not set")
    if not DOCGEN_KEY:
        raise LibreOfficeError("DOCGEN_KEY is not set (required for remote conversion)")

    endpoint = f"{DOCGEN_URL}/convert/docx-to-pdf"
    logger.info(f"Calling DocGen endpoint: {endpoint}")

    try:
        with open(docx_path, "rb") as f:
            files = {"file": (os.path.basename(docx_path), f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
            headers = {"X-DOCGEN-KEY": DOCGEN_KEY}
            resp = requests.post(endpoint, files=files, headers=headers, timeout=180)
    except requests.RequestException as e:
        raise LibreOfficeError(f"DocGen request failed: {e}")

    if resp.status_code != 200:
        raise LibreOfficeError(f"DocGen failed ({resp.status_code}): {resp.text[:500]}")

    pdf_path = _expected_pdf_path(docx_path, output_dir)
    # Ensure .pdf extension
    pdf_path = os.path.splitext(pdf_path)[0] + ".pdf"

    with open(pdf_path, "wb") as out:
        out.write(resp.content)

    if not os.path.exists(pdf_path) or os.path.getsize(pdf_path) == 0:
        raise LibreOfficeError(f"DocGen returned empty PDF: {pdf_path}")

    logger.info(f"PDF created via DocGen: {pdf_path}")
    return pdf_path


def _expected_pdf_path(docx_path: str, output_dir: str) -> str:
    docx_basename = os.path.basename(docx_path)
    pdf_basename = os.path.splitext(docx_basename)[0] + ".pdf"
    return os.path.join(output_dir, pdf_basename)


def check_libreoffice_installed() -> bool:
    """Check if LibreOffice is installed and accessible locally."""
    try:
        result = subprocess.run(
            [LIBREOFFICE_BIN, "--version"],
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
    logging.basicConfig(level=logging.INFO)

    if DOCGEN_URL:
        print(f"✓ DOCGEN_URL set -> remote conversion mode enabled: {DOCGEN_URL}")
    else:
        print("• DOCGEN_URL not set -> will use local LibreOffice if available")

    if check_libreoffice_installed():
        print("✓ Local LibreOffice is installed and accessible")
    else:
        print("✗ Local LibreOffice is NOT installed or not accessible")
        print(f"  Tried: {LIBREOFFICE_BIN}")
