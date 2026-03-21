import hashlib
import json
import os
from pathlib import Path
from typing import Dict, List

from app.services.db import get_supabase

try:
    from openai import OpenAI
except Exception:  # pragma: no cover
    OpenAI = None


BASE_DIR = Path(__file__).resolve().parents[2]
INTERVENTIONS_PATH = BASE_DIR / "data" / "interventions" / "intervention_cards.json"
EVIDENCE_PATH = BASE_DIR / "data" / "evidence" / "evidence_chunks.json"
EMBED_DIM = 1536


def _load_json(path: Path) -> List[Dict]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _deterministic_embedding(text: str, dim: int = EMBED_DIM) -> List[float]:
    # Fallback embedding for local/offline development.
    seed = hashlib.sha256(text.encode("utf-8")).digest()
    out: List[float] = []
    cursor = seed
    while len(out) < dim:
        cursor = hashlib.sha256(cursor).digest()
        for b in cursor:
            out.append((b / 255.0) * 2.0 - 1.0)  # [-1, 1]
            if len(out) >= dim:
                break
    return out


def _openai_embedding(text: str, model: str = "text-embedding-3-small") -> List[float]:
    if OpenAI is None:
        raise RuntimeError("openai package is not installed")
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not found")
    client = OpenAI(api_key=api_key)
    res = client.embeddings.create(model=model, input=text)
    return res.data[0].embedding


def _to_pgvector_literal(vec: List[float]) -> str:
    return "[" + ",".join(f"{v:.8f}" for v in vec) + "]"


def _build_records() -> List[Dict]:
    records: List[Dict] = []

    for card in _load_json(INTERVENTIONS_PATH):
        content = (
            f"{card.get('name', '')}. "
            f"When applies: {card.get('when_it_applies', '')}. "
            f"When not: {card.get('when_not_to_use', '')}. "
            f"Evidence: {card.get('evidence_note', '')}."
        )
        records.append(
            {
                "item_id": card["id"],
                "item_type": "intervention",
                "title": card.get("name", card["id"]),
                "content": content,
                "metadata": {
                    "duration_min": card.get("duration_min"),
                    "tone": card.get("tone"),
                },
            }
        )

    for ev in _load_json(EVIDENCE_PATH):
        content = ev.get("content", "")
        records.append(
            {
                "item_id": ev["id"],
                "item_type": "evidence",
                "title": ev.get("title", ev["id"]),
                "content": content,
                "metadata": {"source": ev.get("source")},
            }
        )

    return records


def ingest_embeddings() -> Dict:
    db = get_supabase()
    records = _build_records()
    use_openai = bool(os.getenv("OPENAI_API_KEY"))
    inserted = 0

    for rec in records:
        text = f"{rec['title']}\n\n{rec['content']}"
        if use_openai:
            vec = _openai_embedding(text)
        else:
            vec = _deterministic_embedding(text)
        row = {
            "item_id": rec["item_id"],
            "item_type": rec["item_type"],
            "title": rec["title"],
            "content": rec["content"],
            "metadata": rec["metadata"],
            "embedding": _to_pgvector_literal(vec),
        }
        db.table("evidence_embeddings").upsert(row, on_conflict="item_id").execute()
        inserted += 1

    return {
        "count": inserted,
        "mode": "openai" if use_openai else "deterministic_fallback",
        "dim": EMBED_DIM,
    }


if __name__ == "__main__":
    result = ingest_embeddings()
    print(json.dumps(result, indent=2))
