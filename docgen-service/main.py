import os
from typing import Optional
import subprocess
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.responses import Response

app = FastAPI()
DOCGEN_KEY = os.getenv("DOCGEN_KEY", "")

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/convert/docx-to-pdf")
async def docx_to_pdf(
    file: UploadFile = File(...),
    x_docgen_key: Optional[str] = Header(default=None),
):
    if DOCGEN_KEY and x_docgen_key != DOCGEN_KEY:
        raise HTTPException(401, "Unauthorized")

    if not file.filename.lower().endswith(".docx"):
        raise HTTPException(400, "Only .docx supported")

    with tempfile.TemporaryDirectory() as td:
        docx_path = os.path.join(td, "input.docx")
        content = await file.read()
        with open(docx_path, "wb") as f:
            f.write(content)

        cmd = [
            "soffice",
            "--headless",
            "--nologo",
            "--nofirststartwizard",
            "--convert-to", "pdf",
            "--outdir", td,
            docx_path,
        ]

        try:
            p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=60)
        except subprocess.TimeoutExpired:
            raise HTTPException(504, "LibreOffice timeout")

        if p.returncode != 0:
            raise HTTPException(500, f"LibreOffice failed: {p.stderr[:500]}")

        pdfs = [f for f in os.listdir(td) if f.lower().endswith(".pdf")]
        if not pdfs:
            raise HTTPException(500, "PDF not produced")

        pdf_path = os.path.join(td, pdfs[0])
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

    # return bytes AFTER temp dir is gone (safe)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="output.pdf"'},
    )
