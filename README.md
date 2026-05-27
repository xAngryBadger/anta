# Anta (Arquivado)

Este projeto foi incorporado ao [Capivara](https://github.com/xAngryBadger/capivara) como a ferramenta **Comprimir PDF**. O Capivara e uma suite completa com 15 ferramentas (comprimir, mesclar, dividir, converter, OCR e mais). A funcionalidade de compressao do Anta continua la, com melhorias e interface redesenhada.

Ferramenta ao vivo: [xangrybadger.github.io/capivara](https://xangrybadger.github.io/capivara/)

---

## O que era o Anta

Compressor de PDF com estimativa de reducao em tempo real e preview do resultado.

## Funcionalidades

- Upload de PDF com drag-and-drop
- Compressao via pypdf (`compress_content_streams()`)
- Estimativa de reducao em tempo real (tamanho original vs comprimido)
- Barra de progresso animada
- Cards de resultado: % de reducao, tamanho original, tamanho comprimido
- Download automatico do PDF comprimido
- Backend via Google Colab + tunnel Cloudflare (sem servidor proprio)

## Tecnologias

**Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Framer Motion, Lenis

**Backend:** Python 3.12, FastAPI, pypdf, Pillow, uvicorn, cloudflared

## Pre-requisitos

- Node.js 22+ (frontend)
- Python 3.12+ (backend)
- Conta Google (para Colab)

## Instalacao

**Frontend:**

```bash
cd frontend
npm install
```

**Backend (Colab -- metodo recomendado):**

1. Abra `colab-backend.ipynb` no Google Colab
2. Execute as celulas em sequencia
3. Copie a URL `trycloudflare.com` exibida na saida

**Backend (local):**

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8002
```

## Comandos

| Comando | Diretorio | Descricao |
|---------|-----------|-----------|
| `npm run dev` | `frontend/` | Servidor de desenvolvimento Vite |
| `npm run build` | `frontend/` | Build de producao |
| `npm run preview` | `frontend/` | Preview do build |
| `npm run lint` | `frontend/` | Lint com ESLint |

## Estrutura

```
anta/
├── main.py              Backend FastAPI (compressao de PDF)
├── colab-backend.ipynb  Notebook Colab com backend + tunnel
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/  ApiConfig, BetaBanner, Preloader
│   │   ├── hooks/       useLenis, useScrollReveal
│   │   └── lib/         api.ts
│   └── package.json
├── requirements.txt
├── render.yaml
└── .github/workflows/   Deploy do frontend no GitHub Pages
```

## Arquitetura

O Anta seguia a arquitetura desacoplada frontend/backend padrao dos projetos Badger:

- **Frontend (React + Vite):** Interface de upload com drag-and-drop e exibicao de resultados.
- **Backend (FastAPI + pypdf):** Recebe o PDF via POST em `/api/compress`, aplica `compress_content_streams()` e retorna o PDF comprimido como stream.
- **Tunnel Cloudflare:** O notebook Colab inicia o Uvicorn na porta 8002 e expoe via `cloudflared tunnel`.

Fluxo: `PDF (upload) -> POST /api/compress -> pypdf.compress_content_streams() -> Download automatico`.

## Configuracao

| Variavel | Onde | Descricao |
|----------|------|-----------|
| `badger-api-url` | localStorage (frontend) | URL base do backend |

## Testes

O projeto nao possui suite de testes automatizados.

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| "Configure a URL da API primeiro" | Clique no header e cole a URL do tunnel Cloudflare |
| PDF sem reducao | Alguns PDFs ja estao comprimidos ao maximo |
| Tunnel nao gera URL | Aguarde ate 30 segundos; reexecute a celula |

## Contribuindo

1. Fork o repositorio em [github.com/xAngryBadger/anta](https://github.com/xAngryBadger/anta)
2. Crie uma branch: `git checkout -b minha-feature`
3. Commit: `git commit -m "Adiciona minha-feature"`
4. Push: `git push origin minha-feature`
5. Abra um Pull Request

## Licenca

MIT
