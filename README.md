# Resume Classifier

An AI-powered web app that classifies resumes into job domains and ranks candidates for a specific domain — built with FastAPI and Next.js.

## Features

- **Classify** — Upload one or more PDF resumes and identify their job domain with confidence scores
- **Rank by Domain** — Upload multiple resumes, select a target domain, and get candidates ranked by relevance
- Export results to CSV
- Supports 25 job domains

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, scikit-learn, pdfplumber |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| ML Model | TF-IDF + classification model (pre-trained, `.pkl` files) |

## Project Structure

```
Resume Classifier/
├── server.py              # FastAPI backend
├── model.pkl              # Trained classifier
├── tfidf.pkl              # TF-IDF vectorizer
├── encoder.pkl            # Label encoder
├── requirements.txt
└── frontend/
    ├── app/
    │   └── page.tsx       # Main UI with Classify & Rank tabs
    ├── components/
    │   ├── DropZone.tsx
    │   ├── ResultCard.tsx
    │   └── RankCard.tsx
    └── lib/
        ├── api.ts         # API client functions
        └── colors.ts      # Domain color mapping
```

## Local Setup

### Backend

```bash
pip install -r requirements.txt
uvicorn server:app --reload
```

API runs at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI runs at `http://localhost:3000`

### Environment Variable

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/health` | Model status |
| GET | `/categories` | List all supported domains |
| POST | `/classify/` | Classify one or more PDF resumes |
| POST | `/rank/` | Rank resumes for a specific domain |

### POST `/classify/`

**Form data:** `files` — one or more PDF files

```json
{
  "results": [
    {
      "filename": "resume.pdf",
      "status": "success",
      "domain": "Data Science",
      "confidence": 87.4,
      "top_predictions": [
        { "domain": "Data Science", "confidence": 87.4 },
        { "domain": "Python Developer", "confidence": 7.2 },
        { "domain": "Database", "confidence": 3.1 }
      ]
    }
  ]
}
```

### POST `/rank/`

**Form data:** `files` — one or more PDF files, `domain` — target domain string

```json
{
  "domain": "Data Science",
  "results": [
    { "rank": 1, "filename": "alice.pdf", "status": "success", "confidence": 87.4 },
    { "rank": 2, "filename": "bob.pdf",   "status": "success", "confidence": 61.2 }
  ]
}
```

## Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Set **Build Command:** `pip install -r requirements.txt`
3. Set **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Frontend → Vercel

1. Import the `frontend/` folder (or root repo) on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-render-app.onrender.com` |

4. Redeploy after adding the env var — Next.js bakes `NEXT_PUBLIC_*` vars at build time.

## Supported Domains

Advocate · Arts · Automation Testing · Blockchain · Business Analyst · Civil Engineer · Data Science · Database · DevOps Engineer · DotNet Developer · ETL Developer · Electrical Engineering · HR · Hadoop · Health & Fitness · Java Developer · Mechanical Engineer · Network Security Engineer · Operations Manager · PMO · Python Developer · SAP Developer · Sales · Testing · Web Designing
