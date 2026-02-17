"""
PDF conversion — LOCAL ONLY via LibreOffice headless.
No remote service dependency.
"""

import os
import subprocess
import logging
import tempfile
import shutil
from pathlib import Path

logger = logging.getLogger(__name__)

# LibreOffice binary path (can be overridden via environment variable)
LIBREOFFICE_BIN = os.environ.get("LIBREOFFICE_BIN", "soffice")


class LibreOfficeError(Exception):
    """Raised when PDF conversion fails."""
    pass


def convert_to_pdf(docx_path: str, output_dir: str) -> str:
    """
    Convert a DOCX file to PDF using local LibreOffice.

    Args:
        docx_path: Path to input DOCX file.
        output_dir: Directory for the output PDF.

    Returns:
        Absolute path to the generated PDF.

    Raises:
        LibreOfficeError on any failure.
    """
    if not os.path.exists(docx_path):
        raise LibreOfficeError(f"DOCX file not found: {docx_path}")

    os.makedirs(output_dir, exist_ok=True)

    # Create a unique temporary profile directory per invocation
    # to avoid LibreOffice lock contention on concurrent requests.
    # Use /tmp so it works in containers where HOME may not be writable.
    user_install_dir = tempfile.mkdtemp(prefix="lo_profile_", dir="/tmp")

    cmd = [
        LIBREOFFICE_BIN,
        "--headless",
        "--invisible",
        "--nodefault",
        "--nologo",
        "--nofirststartwizard",
        f"-env:UserInstallation=file://{user_install_dir}",
        "--convert-to", "pdf",
        "--outdir", output_dir,
        docx_path,
    ]

    # Build a clean environment that prevents any X11/display probing.
    # Even with --headless, some LO builds still probe DISPLAY unless
    # SAL_USE_VCLPLUGIN is set and DISPLAY is unset.
    env = os.environ.copy()
    env["SAL_USE_VCLPLUGIN"] = "gen"
    env["HOME"] = "/tmp"
    env["TMPDIR"] = "/tmp"
    env["XDG_CACHE_HOME"] = "/tmp"
    env["XDG_CONFIG_HOME"] = "/tmp"
    env.pop("DISPLAY", None)  # Remove DISPLAY to prevent X11 probing

    logger.info(
        f"LO env: SAL_USE_VCLPLUGIN={env.get('SAL_USE_VCLPLUGIN')} "
        f"HOME={env.get('HOME')} DISPLAY={env.get('DISPLAY')}"
    )
    logger.info(f"Running LibreOffice conversion: {' '.join(cmd)}")

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=180,  # 3 minutes for large documents
            env=env,
        )

        if result.returncode != 0:
            error_msg = result.stderr or result.stdout or "Unknown error"
            logger.error(f"LibreOffice conversion failed (exit {result.returncode}): {error_msg}")
            raise LibreOfficeError(f"LibreOffice conversion failed: {error_msg}")

        logger.info(f"LibreOffice stdout: {result.stdout.strip()}")
        if result.stderr.strip():
            logger.warning(f"LibreOffice stderr: {result.stderr.strip()}")

    except FileNotFoundError:
        raise LibreOfficeError(
            f"LibreOffice not found at '{LIBREOFFICE_BIN}'. "
            "Install LibreOffice or set LIBREOFFICE_BIN env var."
        )
    except subprocess.TimeoutExpired:
        raise LibreOfficeError("LibreOffice conversion timed out after 180 seconds")
    finally:
        # Always clean up the temporary profile directory
        try:
            shutil.rmtree(user_install_dir, ignore_errors=True)
        except Exception:
            pass

    # Locate the generated PDF
    pdf_path = _expected_pdf_path(docx_path, output_dir)
    if not os.path.exists(pdf_path):
        # LibreOffice sometimes outputs a slightly different name; find newest PDF
        candidates = list(Path(output_dir).glob("*.pdf"))
        if not candidates:
            raise LibreOfficeError(f"PDF file was not created. Expected: {pdf_path}")
        pdf_path = str(max(candidates, key=lambda p: p.stat().st_mtime))

    file_size = os.path.getsize(pdf_path)
    logger.info(f"PDF created successfully: {pdf_path} ({file_size:,} bytes)")
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
            timeout=10,
        )
        if result.returncode == 0:
            logger.info(f"LibreOffice found: {result.stdout.strip()}")
            return True
        return False
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("PDF conversion mode: LOCAL LibreOffice only (no remote service)")

    if check_libreoffice_installed():
        print(f"✓ Local LibreOffice is installed and accessible ({LIBREOFFICE_BIN})")
    else:
        print(f"✗ Local LibreOffice is NOT installed or not accessible")
        print(f"  Tried: {LIBREOFFICE_BIN}")
