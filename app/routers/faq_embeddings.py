from fastapi import APIRouter, HTTPException

from .faq import DB, save_faq
from app.ai.regenerate_embeddings import generate_faq_embeddings

router = APIRouter(prefix="/api/faq", tags=["faq_embeddings"])

@router.post("/embeddings/regenerate")
def regenerate_faq_embeddings():
    try:
        generate_faq_embeddings(DB)
        save_faq(DB)
        return {"ok": True, "message": "Embeddings rigenerati"}
    except Exception as e:
        raise HTTPException(500, f"Errore nella rigenerazione degli embeddings: {str(e)}")
