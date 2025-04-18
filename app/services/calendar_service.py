# app/services/calendar_service.py
from __future__ import print_function
from datetime import timezone
from pathlib import Path

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

CREDENTIALS_PATH = Path("app/data/credentials.json")
TOKEN_PATH = Path("app/data/token.json")
SCOPES = ["https://www.googleapis.com/auth/calendar"]

def get_calendar_service():
    creds = None
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    else:
        flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_PATH), SCOPES)
        creds = flow.run_local_server(port=0)
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
