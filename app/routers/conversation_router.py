from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.templates.schemas import Message as MessageSchema, MessageIn, Conversation as ConversationSchema
from app.templates.models import Conversation, Message
from app.db import SessionLocal
from app.ai.openai_interface import handle_message

router = APIRouter(prefix="/api/conversations", tags=["conversations"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ConversationSchema)
def create_conversation(db: Session = Depends(get_db)):
    conv = Conversation(created_at=datetime.utcnow())
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return ConversationSchema.model_validate(conv, from_attributes=True)

@router.post("/{conv_id}/messages", response_model=List[MessageSchema])
def add_message(conv_id: int, msg: MessageIn, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Salva il messaggio utente
    user_message = Message(
        conversation_id=conv_id,
        sender=msg.sender,
        text=msg.text,
        timestamp=datetime.utcnow()
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    from app.utils.logging import log_event
    log_event("Nuovo messaggio utente", msg.text[:100], db=db)

    # Genera la risposta del bot
    bot_response = handle_message(msg.text)
    bot_message = Message(
        conversation_id=conv_id,
        sender="bot",
        text=bot_response,
        timestamp=datetime.utcnow()
    )
    db.add(bot_message)
    db.commit()
    db.refresh(bot_message)
    log_event("Risposta bot", bot_response[:100], db=db)

    return [
        MessageSchema.model_validate(user_message, from_attributes=True),
        MessageSchema.model_validate(bot_message, from_attributes=True)
    ]

@router.get("/", response_model=List[ConversationSchema])
def list_conversations(db: Session = Depends(get_db)):
    conversations = db.query(Conversation).all()
    return [
        ConversationSchema.model_validate(c, from_attributes=True)
        for c in conversations
    ]

@router.get("/{conv_id}/messages", response_model=List[MessageSchema])
def get_messages(conv_id: int, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return [
        MessageSchema.model_validate(m, from_attributes=True)
        for m in conv.messages
    ]

