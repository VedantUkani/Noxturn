from fastapi import APIRouter, Query

from app.rag.retriever import retrieve

router = APIRouter(prefix="/rag", tags=["RAG"])


@router.get("/retrieve")
def retrieve_context(query: str = Query(..., min_length=3), top_k: int = 3):
    top_k = max(1, min(top_k, 10))
    return retrieve(query=query, top_k=top_k)
