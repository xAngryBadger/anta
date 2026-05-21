from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pypdf import PdfReader, PdfWriter
import io
import os
from pathlib import Path

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = Path("/tmp/pdf-compressor")
TEMP_DIR.mkdir(exist_ok=True)

@app.post("/api/compress")
async def compress_pdf(file: UploadFile = File(...)):
    try:
        content = await file.read()
        input_stream = io.BytesIO(content)
        
        reader = PdfReader(input_stream)
        writer = PdfWriter()
        
        for page in reader.pages:
            page.compress_content_streams()
            writer.add_page(page)
        
        output_stream = io.BytesIO()
        writer.write(output_stream)
        output_stream.seek(0)
        
        return StreamingResponse(
            output_stream,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="compressed_{file.filename}"'},
        )
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "PDF Compressor API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8002)))
