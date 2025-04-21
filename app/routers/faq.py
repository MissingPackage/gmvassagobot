# app/routers/faq.py
import json
from pathlib import Path
from typing import List
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter( tags=["faq"])

FAQ_FILE = Path(__file__).resolve().parent.parent.parent / "app" / "data" / "faq.json"
print(f"FAQ_FILE: {FAQ_FILE}")

class FAQ(BaseModel):
    id: str
    question: str
    answer: str

class FAQIn(BaseModel):
    question: str
    answer: str

# ── utilità load/save ──────────────────────────────────────────────────
def load_faq() -> list[FAQ]:
    if not FAQ_FILE.exists():
        return []
    with FAQ_FILE.open("r", encoding="utf‑8") as f:
        data = json.load(f)
        # assegna id se manca
        for item in data:
            item.setdefault("id", str(uuid4()))
        return [FAQ(**item) for item in data]

def save_faq(db: list[FAQ]):
    with FAQ_FILE.open("w", encoding="utf‑8") as f:
        json.dump([faq.dict() for faq in db], f, ensure_ascii=False, indent=2)

DB: list[FAQ] = load_faq()

# ── endpoints CRUD ────────────────────────────────────────────────────
@router.get("/faq", response_model=List[FAQ])
def list_faq():
    return DB

@router.post("/faq", response_model=FAQ)
def create_faq(payload: FAQIn):
    new = FAQ(id=str(uuid4()), **payload.dict())
    DB.append(new)
    save_faq(DB)
    return new

@router.put("/faq/{faq_id}", response_model=FAQ)
def update_faq(faq_id: str, payload: FAQIn):
    for idx, faq in enumerate(DB):
        if faq.id == faq_id:
            updated = faq.copy(update=payload.dict())
            DB[idx] = updated
            save_faq(DB)
            return updated
    raise HTTPException(404, "FAQ not found")

@router.delete("/faq/{faq_id}")
def delete_faq(faq_id: str):
    global DB
    DB = [f for f in DB if f.id != faq_id]
    save_faq(DB)
    return {"ok": True}