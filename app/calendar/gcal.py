# app/services/calendar_service.py
from __future__ import print_function

from datetime import datetime, timedelta, timezone
from pathlib import Path

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

CREDENTIALS_PATH = Path("app/data/credentials.json")
TOKEN_PATH = Path("app/data/token.json")
SCOPES = ["https://www.googleapis.com/auth/calendar"]

from google.auth.transport.requests import Request

def get_calendar_service():
    creds = None
    # Carica il token se esiste
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    # Se non ci sono credenziali o sono invalide/scadute
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Forza il prompt del consenso per ottenere il refresh_token
            flow = InstalledAppFlow.from_client_secrets_file(
                str(CREDENTIALS_PATH), SCOPES
            )
            creds = flow.run_local_server(port=0, prompt='consent', access_type='offline')
        # Salva sempre il nuovo token (sia dopo refresh che nuova autenticazione)
        with open(TOKEN_PATH, "w") as token:
            token.write(creds.to_json())
    return build("calendar", "v3", credentials=creds)

def check_availability(start_time, end_time, calendar_id="primary") -> bool:
    service = get_calendar_service()

    # ✅ Recupera il timezone corretto dal calendario
    calendar = service.calendars().get(calendarId=calendar_id).execute()
    timezone_str = calendar.get("timeZone", "Europe/Rome")

    # ✅ Converti gli orari nel fuso corretto
    import pytz
    tz = pytz.timezone(timezone_str)
    start_time = start_time.astimezone(tz)
    end_time = end_time.astimezone(tz)

    print(f"🔍 Controllo disponibilità tra {start_time} e {end_time} nel fuso {timezone_str}")

    events_result = service.events().list(
        calendarId=calendar_id,
        timeMin=start_time.isoformat(),
        timeMax=end_time.isoformat(),
        singleEvents=True,
        orderBy="startTime"
    ).execute()

    events = events_result.get("items", [])

    if events:
        for e in events:
            print(f"❌ Evento sovrapposto: {e['summary']} dalle {e['start'].get('dateTime')} alle {e['end'].get('dateTime')}")
    else:
        print("✅ Slot effettivamente libero.")

    return len(events) == 0

def create_appointment(start_time, end_time, summary, description, calendar_id="primary") -> str:
    service = get_calendar_service()

    calendar = service.calendars().get(calendarId=calendar_id).execute()
    timezone_str = calendar.get("timeZone", "Europe/Rome")

    event = {
        "summary": summary,
        "description": description,
        "start": {
            "dateTime": start_time.isoformat(),
            "timeZone": timezone_str
        },
        "end": {
            "dateTime": end_time.isoformat(),
            "timeZone": timezone_str
        }
    }

    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
    if end_time.tzinfo is None:
        end_time = end_time.replace(tzinfo=timezone.utc)
        
    created_event = service.events().insert(calendarId=calendar_id, body=event).execute()
    return created_event.get("htmlLink")


def get_upcoming_events(days: int = 7, calendar_id="primary"):
    service = get_calendar_service()

    # Calcola il range temporale
    now = datetime.now(timezone.utc)
    time_min = now.isoformat()
    time_max = (now + timedelta(days=days)).isoformat()

    # Recupera gli eventi dal calendario
    events_result = (
        service.events()
        .list(
            calendarId=calendar_id,
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    print(events_result.get("items", []))
    return events_result.get("items", [])

def delete_event(event_id: str, calendar_id: str = "primary") -> bool:
    try:
        print(f"🔍 Attempting to delete event {event_id} from Google Calendar")
        service = get_calendar_service()
        
        # First verify the event exists
        try:
            event = service.events().get(calendarId=calendar_id, eventId=event_id).execute()
            print(f"✅ Found event to delete: {event.get('summary', 'Untitled')}")
        except Exception as e:
            print(f"❌ Event not found in Google Calendar: {str(e)}")
            return False
            
        # Delete the event
        service.events().delete(calendarId=calendar_id, eventId=event_id).execute()
        print(f"✅ Successfully deleted event {event_id}")
        return True
    except Exception as e:
        print(f"❌ Error during event deletion: {str(e)}")
        return False

def update_event(event_id: str, start_time, end_time, summary: str, description: str = "") -> bool:
    """Aggiorna un evento esistente nel calendario."""
    try:
        service = get_calendar_service()
        
        # Recupera l'evento esistente
        event = service.events().get(calendarId='primary', eventId=event_id).execute()
        
        # Aggiorna i campi
        event['summary'] = summary
        event['description'] = description
        event['start'] = {'dateTime': start_time.isoformat(), 'timeZone': 'Europe/Rome'}
        event['end'] = {'dateTime': end_time.isoformat(), 'timeZone': 'Europe/Rome'}
        
        # Invia l'aggiornamento
        updated_event = service.events().update(
            calendarId='primary',
            eventId=event_id,
            body=event
        ).execute()
        
        print(f"✅ Evento aggiornato con successo: {updated_event.get('id')}")
        return True
        
    except Exception as e:
        print(f"❌ Errore nell'aggiornamento dell'evento: {str(e)}")
        return False
