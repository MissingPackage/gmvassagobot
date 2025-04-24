from app.templates.models import AdminLog
from app.db import SessionLocal

def log_event(event_type: str, details: str, db=None):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    try:
        log = AdminLog(event_type=event_type, details=details)
        db.add(log)
        db.commit()
    finally:
        if close_db:
            db.close()
