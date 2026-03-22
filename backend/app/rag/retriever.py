"""
RAG retriever — semantic search via pgvector cosine similarity.

Primary  : pgvector cosine similarity using sentence-transformers embeddings
Fallback : token-overlap keyword search (used if embeddings table is empty)
"""

import json
from pathlib import Path
from typing import Dict, List, Tuple

BASE_DIR = Path(__file__).resolve().parents[2]
INTERVENTIONS_PATH = BASE_DIR / "data" / "interventions" / "intervention_cards.json"
EVIDENCE_PATH = BASE_DIR / "data" / "evidence" / "evidence_chunks.json"

EMBED_MODEL = "all-MiniLM-L6-v2"
_model = None  # lazy-loaded — only when first needed


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(EMBED_MODEL)
    return _model


def _load_json(path: Path) -> List[Dict]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


# ── Vector search ─────────────────────────────────────────────────────────────

def _vector_retrieve(query: str, top_k: int) -> Dict[str, List[Dict]]:
    from app.services.db import get_supabase

    model = _get_model()
    vec = model.encode(query, normalize_embeddings=True).tolist()
    db = get_supabase()

    cards_res = db.rpc(
        "match_embeddings",
        {"query_embedding": vec, "match_count": top_k, "filter_type": "intervention"},
    ).execute()

    evidence_res = db.rpc(
        "match_embeddings",
        {"query_embedding": vec, "match_count": top_k, "filter_type": "evidence"},
    ).execute()

    cards = [
        {**row, "score": round(float(row.pop("similarity")), 3)}
        for row in (cards_res.data or [])
    ]
    evidence = [
        {**row, "score": round(float(row.pop("similarity")), 3)}
        for row in (evidence_res.data or [])
    ]

    return {"cards": cards, "evidence": evidence, "mode": "vector"}


# ── Keyword fallback ──────────────────────────────────────────────────────────

def _tokenize(text: str) -> set:
    return {t.strip(".,:;!?()[]{}\"'").lower() for t in text.split() if t.strip()}


def _keyword_score(query_tokens: set, text: str) -> float:
    doc_tokens = _tokenize(text)
    if not doc_tokens:
        return 0.0
    return len(query_tokens & doc_tokens) / max(1, len(query_tokens))


def _keyword_retrieve(query: str, top_k: int) -> Dict[str, List[Dict]]:
    interventions = _load_json(INTERVENTIONS_PATH)
    evidence = _load_json(EVIDENCE_PATH)
    q = _tokenize(query)

    scored_cards: List[Tuple[float, Dict]] = []
    for card in interventions:
        text = f"{card.get('name', '')} {card.get('when_it_applies', '')} {card.get('evidence_note', '')}"
        scored_cards.append((_keyword_score(q, text), card))

    scored_evidence: List[Tuple[float, Dict]] = []
    for chunk in evidence:
        text = f"{chunk.get('title', '')} {chunk.get('content', '')}"
        scored_evidence.append((_keyword_score(q, text), chunk))

    cards = [
        {**item, "score": round(score, 3)}
        for score, item in sorted(scored_cards, key=lambda x: x[0], reverse=True)[:top_k]
    ]
    ev = [
        {**item, "score": round(score, 3)}
        for score, item in sorted(scored_evidence, key=lambda x: x[0], reverse=True)[:top_k]
    ]

    return {"cards": cards, "evidence": ev, "mode": "keyword_fallback"}


# ── Public entry point ────────────────────────────────────────────────────────

def retrieve(query: str, top_k: int = 3) -> Dict[str, List[Dict]]:
    """
    Returns top_k intervention cards and evidence chunks for the query.
    Uses vector search if embeddings table is populated, keyword search otherwise.
    """
    try:
        from app.services.db import get_supabase
        db = get_supabase()
        count = db.table("evidence_embeddings").select("item_id", count="exact").execute()
        has_embeddings = (count.count or 0) > 0
    except Exception:
        has_embeddings = False

    if has_embeddings:
        try:
            return _vector_retrieve(query, top_k)
        except Exception:
            pass  # fall through to keyword

    return _keyword_retrieve(query, top_k)
