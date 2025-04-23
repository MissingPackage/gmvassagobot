from pydantic import BaseModel
from datetime import datetime
from typing import List, Literal

class AdminLogRead(BaseModel):
    id: int
    timestamp: datetime
    event_type: str
    details: str

    class Config:
        orm_mode = True


class MessageCreate(BaseModel):
    sender: str
    text: str

class MessageRead(BaseModel):
    id: int
    sender: str
    text: str
    timestamp: datetime

    class Config:
        orm_mode = True

class ConversationRead(BaseModel):
    id: int
    created_at: datetime
    messages: list[MessageRead]

    class Config:
        orm_mode = True

class Appointment(BaseModel):
    id: str
    title: str
    start: datetime
    end: datetime
    customer: str | None = None
    status: str = "confirmed"

class AppointmentIn(BaseModel):
    title: str
    start: datetime
    end: datetime
    customer: str | None = None

class Message(BaseModel):
    id: int
    sender: Literal["user", "bot"]
    text: str
    timestamp: datetime

class MessageIn(BaseModel):
    sender: Literal["user", "bot"]
    text: str

class Conversation(BaseModel):
    id: int
    created_at: datetime
    messages: List[Message] = []

class FAQ(BaseModel):
    id: str
    question: str
    answer: str

class FAQIn(BaseModel):
    question: str
    answer: str