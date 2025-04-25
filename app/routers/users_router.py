from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.templates.models import User

router = APIRouter(prefix="/api/users", tags=["users"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def list_users(q: str = "", db: Session = Depends(get_db)):
    query = db.query(User)
    if q:
        query = query.filter((User.email.ilike(f"%{q}%")) | (User.phone.ilike(f"%{q}%")))
    return query.all()

@router.post("/")
def create_user(user: dict, db: Session = Depends(get_db)):
    new_user = User(**user)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/{user_id}")
def update_user(user_id: int, user: dict, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in user.items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"ok": True}
