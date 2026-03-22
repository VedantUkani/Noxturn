"""
Ingestion script — embeds all intervention cards and evidence chunks
into the evidence_embeddings Supabase table using sentence-transformers.

Model : all-MiniLM-L6-v2  (384-dim, ~80 MB, runs on CPU, no API key needed)
Run   : python -m app.rag.ingest_embeddings   (from backend/ directory)
"""

import json
import sys
from pathlib import Path
from typing import Dict, List

BASE_DIR = Path(__file__).resolve().parents[2]
INTERVENTIONS_PATH = BASE_DIR / "data" / "interventions" / "intervention_cards.json"
EVIDENCE_PATH = BASE_DIR / "data" / "evidence" / "evidence_chunks.json"
EMBED_MODEL = "all-MiniLM-L6-v2"
EMBED_DIM = 384


def _load_json(path: Path) -> List[Dict]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _load_model():
    from sentence_transformers import SentenceTransformer
    print(f"Loading model {EMBED_MODEL} …")
    return SentenceTransformer(EMBED_MODEL)


def _build_records() -> List[Dict]:
    records: List[Dict] = []

    for card in _load_json(INTERVENTIONS_PATH):
        content = (
            f"{card.get('name', '')}. "
            f"When applies: {card.get('when_it_applies', '')}. "
            f"When not: {card.get('when_not_to_use', '')}. "
            f"Evidence: {card.get('evidence_note', '')}."
        )
        records.append({
            "item_id":   card["id"],
            "item_type": "intervention",
            "title":     card.get("name", card["id"]),
            "content":   content,
            "metadata":  {"duration_min": card.get("duration_min"), "tone": card.get("tone")},
        })

    for ev in _load_json(EVIDENCE_PATH):
        records.append({
            "item_id":   ev["id"],
            "item_type": "evidence",
            "title":     ev.get("title", ev["id"]),
            "content":   ev.get("content", ""),
            "metadata":  {"source": ev.get("source")},
        })

    return records


def ingest_embeddings() -> Dict:
    from dotenv import load_dotenv
    load_dotenv()
    from app.services.db import get_supabase

    model = _load_model()
    db = get_supabase()
    records = _build_records()

    print(f"Embedding {len(records)} documents …")
    texts = [f"{r['title']}\n\n{r['content']}" for r in records]
    vectors = model.encode(texts, show_progress_bar=True, normalize_embeddings=True)

    inserted = 0
    for rec, vec in zip(records, vectors):
        row = {
            "item_id":   rec["item_id"],
            "item_type": rec["item_type"],
            "title":     rec["title"],
            "content":   rec["content"],
            "metadata":  rec["metadata"],
            "embedding": vec.tolist(),
        }
        db.table("evidence_embeddings").upsert(row, on_conflict="item_id").execute()
        inserted += 1
        print(f"  [{inserted:02d}/{len(records)}] {rec['item_type']:12} {rec['item_id']}")

    return {"count": inserted, "model": EMBED_MODEL, "dim": EMBED_DIM}


if __name__ == "__main__":
    result = ingest_embeddings()
    print()
    print(json.dumps(result, indent=2))
