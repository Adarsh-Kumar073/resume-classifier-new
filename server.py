from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import pickle
import re
import io
import logging
import numpy as np
from typing import List

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Resume Classifier API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

__model = None
__tfidf = None
__encoder = None


def load_model():
    global __model, __tfidf, __encoder
    with open("./model.pkl", "rb") as f:
        __model = pickle.load(f)
    with open("./tfidf.pkl", "rb") as f:
        __tfidf = pickle.load(f)
    with open("./encoder.pkl", "rb") as f:
        __encoder = pickle.load(f)
    logger.info("Models loaded successfully — %d categories", len(__encoder.classes_))


load_model()


class Prediction(BaseModel):
    domain: str
    confidence: float


class FileResult(BaseModel):
    filename: str
    status: str
    domain: str | None = None
    confidence: float | None = None
    top_predictions: list[Prediction] | None = None
    error: str | None = None


class ClassifyResponse(BaseModel):
    results: list[FileResult]


def clean_text(txt: str) -> str:
    txt = re.sub(r"http\S+\s?", "", txt)
    txt = re.sub(r"\bRT\b|\bcc\b", " ", txt)
    txt = re.sub(r"#\S+", " ", txt)
    txt = re.sub(r"@\S+", " ", txt)
    txt = re.sub(r'[!"#$%&\'()*+,\-./:;<=>?@\[\\\]^_`{|}~]', " ", txt)
    txt = re.sub(r"[^\x00-\x7f]", " ", txt)
    txt = re.sub(r"\s+", " ", txt)
    return txt.strip()


def _softmax(arr: np.ndarray) -> np.ndarray:
    arr = arr - arr.max()
    e = np.exp(arr)
    return e / e.sum()


def _get_probs(text: str) -> tuple[np.ndarray, np.ndarray]:
    cleaned = clean_text(text)
    if not cleaned.strip():
        raise ValueError("No readable text could be extracted from this PDF")
    vectorized = __tfidf.transform([cleaned]).toarray()
    try:
        probs = __model.predict_proba(vectorized)[0]
    except AttributeError:
        scores = __model.decision_function(vectorized)[0]
        probs = _softmax(scores)
    return probs, __encoder.classes_


def classify_text(text: str) -> tuple[str, float, list[Prediction]]:
    probs, classes = _get_probs(text)
    top_indices = np.argsort(probs)[::-1][:3]
    top_predictions = [
        Prediction(domain=str(classes[i]), confidence=round(float(probs[i]) * 100, 2))
        for i in top_indices
    ]
    return top_predictions[0].domain, top_predictions[0].confidence, top_predictions


def confidence_for_domain(text: str, target_domain: str) -> float:
    probs, classes = _get_probs(text)
    class_list = list(classes)
    if target_domain not in class_list:
        raise ValueError(f"Domain '{target_domain}' is not recognized")
    idx = class_list.index(target_domain)
    return round(float(probs[idx]) * 100, 2)


def extract_text_from_bytes(content: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


@app.get("/")
def home():
    return {"message": "Resume Classifier API v2.0 is running!"}


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": __model is not None,
        "categories_count": int(len(__encoder.classes_)) if __encoder is not None else 0,
    }


@app.get("/categories")
def categories():
    return {"categories": sorted(__encoder.classes_.tolist())}


class RankResult(BaseModel):
    rank: int
    filename: str
    status: str
    confidence: float | None = None
    error: str | None = None


class RankResponse(BaseModel):
    domain: str
    results: list[RankResult]


@app.post("/rank/", response_model=RankResponse)
async def rank_resumes(files: List[UploadFile] = File(...), domain: str = Form(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    if domain not in __encoder.classes_:
        raise HTTPException(status_code=400, detail=f"Unknown domain: {domain}")

    scored: list[tuple[str, float]] = []
    errors: list[RankResult] = []

    for file in files:
        filename = file.filename or "unknown.pdf"
        logger.info("Ranking: %s for domain %s", filename, domain)

        if not filename.lower().endswith(".pdf"):
            errors.append(RankResult(rank=0, filename=filename, status="error", error="Only PDF files are supported"))
            continue

        try:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                errors.append(RankResult(rank=0, filename=filename, status="error", error=f"File too large (max {MAX_FILE_SIZE // (1024 * 1024)} MB)"))
                continue
            if len(content) == 0:
                errors.append(RankResult(rank=0, filename=filename, status="error", error="File is empty"))
                continue

            text = extract_text_from_bytes(content)
            conf = confidence_for_domain(text, domain)
            scored.append((filename, conf))
        except Exception as e:
            logger.error("Error ranking %s: %s", filename, e)
            errors.append(RankResult(rank=0, filename=filename, status="error", error=str(e)))

    scored.sort(key=lambda x: x[1], reverse=True)
    ranked = [
        RankResult(rank=i + 1, filename=name, status="success", confidence=conf)
        for i, (name, conf) in enumerate(scored)
    ]

    return RankResponse(domain=domain, results=ranked + errors)


@app.post("/classify/", response_model=ClassifyResponse)
async def classify_resumes(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    results: list[FileResult] = []

    for file in files:
        filename = file.filename or "unknown.pdf"
        logger.info("Processing: %s", filename)

        if not filename.lower().endswith(".pdf"):
            results.append(FileResult(
                filename=filename,
                status="error",
                error="Only PDF files are supported",
            ))
            continue

        try:
            content = await file.read()

            if len(content) > MAX_FILE_SIZE:
                results.append(FileResult(
                    filename=filename,
                    status="error",
                    error=f"File too large (max {MAX_FILE_SIZE // (1024 * 1024)} MB)",
                ))
                continue

            if len(content) == 0:
                results.append(FileResult(
                    filename=filename,
                    status="error",
                    error="File is empty",
                ))
                continue

            text = extract_text_from_bytes(content)
            domain, confidence, top_predictions = classify_text(text)

            logger.info("%s → %s (%.1f%%)", filename, domain, confidence)
            results.append(FileResult(
                filename=filename,
                status="success",
                domain=domain,
                confidence=confidence,
                top_predictions=top_predictions,
            ))

        except Exception as e:
            logger.error("Error processing %s: %s", filename, e)
            results.append(FileResult(
                filename=filename,
                status="error",
                error=str(e),
            ))

    return ClassifyResponse(results=results)
