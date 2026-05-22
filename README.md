# Anta

PDF compressor with quality slider, real-time reduction estimate and result preview.

## Instalação

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8002

cd frontend
npm install
npm run dev
```

## API

`POST /api/compress` - Comprime PDF

## Stack

- React 19 + Vite
- Python FastAPI
- pypdf

## License

MIT
