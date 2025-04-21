from datetime import datetime
from typing import List
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.calendar.gcal import get_calendar_service, get_upcoming_events

api_router = APIRouter( tags=["api"])

# --- MODELLI ---

class Appointment(BaseModel):
    id: str
    title: str
    start: datetime
    end: datetime
    customer: str | None = None
    status: str = "pending"
    source: str = "db"

class AppointmentIn(BaseModel):
    title: str
    start: datetime
    end: datetime
    customer: str | None = None
    status: str | None = "pending"

# --- MOCK DATABASE (sostituisci poi con vero DB) ---
DB: list[Appointment] = []

def gcal_to_appt(event) -> Appointment:
    start_raw = event.get("start", {})
    end_raw = event.get("end", {})

    start_str = start_raw.get("dateTime") or start_raw.get("date")
    end_str   = end_raw.get("dateTime") or end_raw.get("date")
    if not (start_str and end_str):
        raise ValueError("Evento senza start/end")

    return Appointment(
        id=event.get("id") or str(uuid4()),
        title=event.get("summary", "🗓️ Evento Google"),
        start=datetime.fromisoformat(start_str.replace("Z", "+00:00")),
        end=datetime.fromisoformat(end_str.replace("Z", "+00:00")),
        status="confirmed",
        source="gcal",
    )

# --- CRUD ---
@api_router.get("/appointments", response_model=list[Appointment])
def list_appointments(days: int = 7, include_gcal: bool = True):
    # 1) dati locali
    result = DB.copy()

    # 2) eventi Google Calendar
    if include_gcal:
        try:
            gcal_events = get_upcoming_events(days=days)
            mapped = [gcal_to_appt(e) for e in gcal_events]
            result.extend(mapped)
        except Exception as e:
            print("⚠️  Impossibile recuperare eventi Google:", e)

    # eventuale ordinamento
    result.sort(key=lambda a: a.start)
    return result

@api_router.post("/appointments", response_model=Appointment)
def create_appointment(appt: AppointmentIn):
    new = Appointment(id=str(uuid4()), **appt.dict())
    DB.append(new)
    return new

@api_router.put("/appointments/{appt_id}", response_model=Appointment)
def update_appointment(appt_id: str, payload: AppointmentIn):
    for i, a in enumerate(DB):
        if a.id == appt_id:
            updated = a.copy(update=payload.dict(exclude_unset=True))
            DB[i] = updated
            return updated
    raise HTTPException(404, "Appointment not found")

@api_router.delete("/appointments/{appt_id}")
def delete_appointment(appt_id: str):
    global DB
    DB = [a for a in DB if a.id != appt_id]
    return {"ok": True}