import os
import subprocess
import tempfile
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.responses import FileResponse

app = FastAPI()

DOCGEN_KEY = os.getenv("DOCGEN_KEY", "")  # optional security

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/convert/docx-to-pdf")
async def docx_to_pdf(
    file: UploadFile = File(...),
    x_docgen_key: Optional[str] = Header(default=None),
):
    # Optional security
    if DOCGEN_KEY:
        if not x_docgen_key or x_docgen_key != DOCGEN_KEY:
            raise HTTPException(401, "Unauthorized")

    if not file.filename.lower().endswith(".docx"):
        raise HTTPException(400, "Only .docx supported")

    with tempfile.TemporaryDirectory() as td:
        docx_path = os.path.join(td, "input.docx")
        pdf_path = os.path.join(td, "input.pdf")

        content = await file.read()
        with open(docx_path, "wb") as f:
            f.write(content)

        cmd = [
            "soffice",
            "--headless",
            "--nologo",
            "--nofirststartwizard",
            "--convert-to",
            "pdf",
            "--outdir",
            td,
            docx_path,
        ]
        p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        if p.returncode != 0:
            raise HTTPException(500, f"LibreOffice failed: {p.stderr[:500]}")

        if not os.path.exists(pdf_path):
            # LibreOffice sometimes names output based on docx filename
            candidates = [f for f in os.listdir(td) if f.lower().endswith(".pdf")]
            if not candidates:
                raise HTTPException(500, "PDF not produced")
            pdf_path = os.path.join(td, candidates[0])

        return FileResponse(pdf_path, media_type="application/pdf", filename="output.pdf")
