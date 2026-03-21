import json
from pathlib import Path
from typing import Dict, List, Tuple


BASE_DIR = Path(__file__).resolve().parents[2]
INTERVENTIONS_PATH = BASE_DIR / "data" / "interventions" / "intervention_cards.json"
EVIDENCE_PATH = BASE_DIR / "data" / "evidence" / "evidence_chunks.json"


def _load_json(path: Path) -> List[Dict]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _tokenize(text: str) -> set:
    return {t.strip(".,:;!?()[]{}\"'").lower() for t in text.split() if t.strip()}


def _score(query_tokens: set, text: str) -> float:
    doc_tokens = _tokenize(text)
    if not doc_tokens:
        return 0.0
    overlap = len(query_tokens.intersection(doc_tokens))
    return overlap / max(1, len(query_tokens))


def retrieve(query: str, top_k: int = 3) -> Dict[str, List[Dict]]:
    interventions = _load_json(INTERVENTIONS_PATH)
    evidence = _load_json(EVIDENCE_PATH)
    q = _tokenize(query)

    scored_cards: List[Tuple[float, Dict]] = []
    for card in interventions:
        text = f"{card.get('name', '')} {card.get('when_it_applies', '')} {card.get('evidence_note', '')}"
        scored_cards.append((_score(q, text), card))

    scored_evidence: List[Tuple[float, Dict]] = []
    for chunk in evidence:
        text = f"{chunk.get('title', '')} {chunk.get('content', '')}"
        scored_evidence.append((_score(q, text), chunk))

    top_cards = [
        {**item, "score": round(score, 3)}
        for score, item in sorted(scored_cards, key=lambda x: x[0], reverse=True)[:top_k]
    ]
    top_evidence = [
        {**item, "score": round(score, 3)}
        for score, item in sorted(scored_evidence, key=lambda x: x[0], reverse=True)[:top_k]
    ]

    return {"cards": top_cards, "evidence": top_evidence}
