from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.templates.models import AdminLog

router = APIRouter(prefix="/api/logs", tags=["logs"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from app.templates.schemas import AdminLogRead

@router.get("/", response_model=list[AdminLogRead])
def get_logs(limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(AdminLog).order_by(AdminLog.timestamp.desc()).limit(limit).all()
    return logs
