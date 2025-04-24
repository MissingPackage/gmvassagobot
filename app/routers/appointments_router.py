from datetime import datetime, timezone

from fastapi import APIRouter

from app.templates.schemas import Appointment, AppointmentIn
from app.routers import faq_router, conversation_router

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])

router.include_router(faq_router.router)
router.include_router(conversation_router.router)

from app.calendar.gcal import (delete_event, get_calendar_service,
                               get_upcoming_events, update_event)


def gcal_to_appt(event) -> Appointment:
    start_raw = event.get("start", {})
    end_raw = event.get("end", {})

    start_str = start_raw.get("dateTime") or start_raw.get("date")
    end_str = end_raw.get("dateTime") or end_raw.get("date")
    if not (start_str and end_str):
        raise ValueError("Evento senza start/end")

    # Get the Google Calendar event ID
    gcal_id = event.get("id")
    if not gcal_id:
        raise ValueError("Evento Google Calendar senza ID")

    return Appointment(
        id=gcal_id,
        title=event.get("summary", "🗓️ Evento Google"),
        start=datetime.fromisoformat(start_str.replace("Z", "+00:00")),
        end=datetime.fromisoformat(end_str.replace("Z", "+00:00")),
        customer=event.get("description", None),  # Usiamo il campo description per il cliente
        status="confirmed"
    )

# --- CRUD ---
@router.get("/", response_model=list[Appointment])
def list_appointments(days: int = 7):
    try:
        gcal_events = get_upcoming_events(days=days)
        appointments = [gcal_to_appt(e) for e in gcal_events]
        
        # Convert all datetimes to UTC for comparison
        def to_utc(dt: datetime) -> datetime:
            if dt.tzinfo is None:
                return dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        
        # Sort using UTC timestamps
        appointments.sort(key=lambda a: to_utc(a.start))
        return appointments
    except Exception as e:
        print("⚠️ Errore nel recupero eventi da Google Calendar:", e)
        raise HTTPException(500, "Errore nel recupero degli eventi")

@router.post("/", response_model=Appointment)
def create_appointment(appt: AppointmentIn):
    try:
        from app.calendar.gcal import create_event
        event_id = create_event(
            start=appt.start,
            end=appt.end,
            summary=appt.title,
            description=appt.customer or ""
        )
        if not event_id:
            raise HTTPException(500, "Errore nella creazione dell'evento")
        
        # Recupera l'evento appena creato per avere tutti i dettagli
        service = get_calendar_service()
        event = service.events().get(calendarId='primary', eventId=event_id).execute()
        from app.utils.logging import log_event
        log_event("Appuntamento creato", f"Titolo: {appt.title}, Inizio: {appt.start}, Fine: {appt.end}")
        return gcal_to_appt(event)
    except Exception as e:
        print("⚠️ Errore nella creazione dell'evento:", e)
        raise HTTPException(500, f"Errore nella creazione dell'evento: {str(e)}")

@router.put("/{appt_id}", response_model=Appointment)
def update_appointment(appt_id: str, payload: AppointmentIn):
    try:
        success = update_event(
            event_id=appt_id,
            start_time=payload.start,
            end_time=payload.end,
            summary=payload.title,
            description=payload.customer or ""
        )
        if not success:
            raise HTTPException(500, "Errore nell'aggiornamento dell'evento")
        
        # Recupera l'evento aggiornato per avere tutti i dettagli
        service = get_calendar_service()
        event = service.events().get(calendarId='primary', eventId=appt_id).execute()
        from app.utils.logging import log_event
        log_event("Appuntamento aggiornato", f"ID: {appt_id}, Nuovo inizio: {payload.start}, Nuova fine: {payload.end}")
        return gcal_to_appt(event)
    except Exception as e:
        print("⚠️ Errore nell'aggiornamento dell'evento:", e)
        raise HTTPException(500, f"Errore nell'aggiornamento dell'evento: {str(e)}")

@router.delete("/{appt_id}")
def delete_appointment(appt_id: str):
    try:
        success = delete_event(appt_id)
        if not success:
            raise HTTPException(500, "Errore nell'eliminazione dell'evento")
        from app.utils.logging import log_event
        log_event("Appuntamento eliminato", f"ID: {appt_id}")
        return {"ok": True}
    except Exception as e:
        print("⚠️ Errore nell'eliminazione dell'evento:", e)
        raise HTTPException(500, f"Errore nell'eliminazione dell'evento: {str(e)}")