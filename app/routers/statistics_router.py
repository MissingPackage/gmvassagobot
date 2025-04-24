from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.templates.models import Conversation, Message

router = APIRouter(prefix="/api/statistics", tags=["statistics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from sqlalchemy import func
from datetime import datetime, timedelta

@router.get("/")
def get_statistics(db: Session = Depends(get_db)):
    total_conversations = db.query(Conversation).count()
    total_messages = db.query(Message).count()
    user_messages = db.query(Message).filter(Message.sender == "user").count()
    bot_messages = db.query(Message).filter(Message.sender == "bot").count()
    avg_messages_per_conversation = (
        total_messages / total_conversations if total_conversations > 0 else 0
    )
    # Serie temporali ultimi 14 giorni
    today = datetime.utcnow().date()
    days = [today - timedelta(days=i) for i in range(13, -1, -1)]
    messages_per_day = []
    conversations_per_day = []
    for day in days:
        next_day = day + timedelta(days=1)
        msg_count = db.query(Message).filter(
            Message.timestamp >= datetime.combine(day, datetime.min.time()),
            Message.timestamp < datetime.combine(next_day, datetime.min.time())
        ).count()
        conv_count = db.query(Conversation).filter(
            Conversation.created_at >= datetime.combine(day, datetime.min.time()),
            Conversation.created_at < datetime.combine(next_day, datetime.min.time())
        ).count()
        messages_per_day.append({"date": day.isoformat(), "messages": msg_count})
        conversations_per_day.append({"date": day.isoformat(), "conversations": conv_count})
    # Ultima attività
    last_message = db.query(Message).order_by(Message.timestamp.desc()).first()
    last_activity = last_message.timestamp.isoformat() if last_message else None
    # Conversazione più lunga
    longest = db.query(Message.conversation_id, func.count(Message.id).label("msg_count"))\
        .group_by(Message.conversation_id)\
        .order_by(func.count(Message.id).desc())\
        .first()
    longest_conversation = {"id": longest.conversation_id, "messages": longest.msg_count} if longest else None
    # Percentuale user/bot
    user_pct = (user_messages / total_messages) * 100 if total_messages > 0 else 0
    bot_pct = (bot_messages / total_messages) * 100 if total_messages > 0 else 0
    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "user_messages": user_messages,
        "bot_messages": bot_messages,
        "avg_messages_per_conversation": avg_messages_per_conversation,
        "messages_per_day": messages_per_day,
        "conversations_per_day": conversations_per_day,
        "last_activity": last_activity,
        "longest_conversation": longest_conversation,
        "user_pct": user_pct,
        "bot_pct": bot_pct
    }
