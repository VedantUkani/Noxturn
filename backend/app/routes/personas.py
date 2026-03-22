import json
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/personas", tags=["Personas"])

_PERSONAS_DIR = Path(__file__).resolve().parents[2] / "data" / "personas"
_cache: Optional[Dict[str, dict]] = None


def _load_all() -> Dict[str, dict]:
    global _cache
    if _cache is not None:
        return _cache
    _cache = {}
    for path in sorted(_PERSONAS_DIR.glob("*.json")):
        try:
            persona = json.loads(path.read_text(encoding="utf-8"))
            _cache[persona["id"]] = persona
        except Exception:
            pass
    return _cache


def get_persona(persona_id: str) -> Optional[dict]:
    return _load_all().get(persona_id)


@router.get("/list")
def list_personas() -> List[dict]:
    """Return all available persona profiles."""
    return list(_load_all().values())


@router.get("/{persona_id}")
def get_persona_by_id(persona_id: str) -> dict:
    """Return a single persona by id."""
    persona = get_persona(persona_id)
    if not persona:
        raise HTTPException(
            status_code=404,
            detail=f"Persona '{persona_id}' not found. Available: {list(_load_all().keys())}",
        )
    return persona
