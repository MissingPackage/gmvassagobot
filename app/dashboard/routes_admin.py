import json
import os
from datetime import datetime, timedelta, timezone

import pytz
from fastapi import APIRouter, Depends, FastAPI, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware

from app.calendar.gcal import get_calendar_service, get_upcoming_events

router = APIRouter()
templates = Jinja2Templates(directory="app/dashboard/templates")

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")

def is_authenticated(request: Request):
    return request.session.get("admin") is True

def require_admin(request: Request):
    if not is_authenticated(request):
        return RedirectResponse(url="/admin/login", status_code=302)

@router.get("/admin/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@router.post("/admin/login")
def login(request: Request, username: str = Form(...), password: str = Form(...)):
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        request.session["admin"] = True
        return RedirectResponse(url="/admin", status_code=302)
    return templates.TemplateResponse("admin/login.html", {"request": request, "error": "Credenziali non valide"})

@router.get("/admin/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/admin/login", status_code=302)

@router.get("/admin", response_class=HTMLResponse)
def dashboard(request: Request):
    if not is_authenticated(request):
        return RedirectResponse(url="/admin/login", status_code=302)
    return templates.TemplateResponse("admin/dashboard.html", {"request": request})
"""
@router.get("/admin/appuntamenti", response_class=HTMLResponse)
def admin_calendar(request: Request):
    mock_events = [
        {
            "title": "Evento fittizio",
            "start": "2025-04-20T14:00:00+00:00",
            "end": "2025-04-20T15:00:00+00:00"
        }
    ]

    print("🧪 mock_events =", json.dumps(mock_events, indent=2))  # per verifica

    return templates.TemplateResponse("sections/calendar.html", {
        "request": request,
        "calendar_json": mock_events
    })
"""
@router.get("/admin/calendar", response_class=HTMLResponse)
def admin_calendar(request: Request):
    if not is_authenticated(request):
        return RedirectResponse(url="/admin/login", status_code=302)

    service = get_calendar_service()
    now = datetime.now(timezone.utc)
    max_date = now + timedelta(days=7)

    events_result = service.events().list(
        calendarId="primary",
        timeMin=now.isoformat(),
        timeMax=max_date.isoformat(),
        singleEvents=True,
        orderBy="startTime"
    ).execute()

    events = events_result.get("items", [])
    tz = service.calendars().get(calendarId="primary").execute().get("timeZone", "Europe/Rome")
    local_tz = pytz.timezone(tz)

    calendar_json = []

    for event in events:
        start_raw = event.get("start", {})
        end_raw = event.get("end", {})

        start = start_raw.get("dateTime") or start_raw.get("date")
        end = end_raw.get("dateTime") or end_raw.get("date")

        if not start or not end:
            continue

        start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(end.replace("Z", "+00:00"))

        # 🕑 Orari localizzati per vista tabellare
        event["local_start"] = start_dt.astimezone(local_tz)
        event["local_end"] = end_dt.astimezone(local_tz)

        # 📆 Dati per FullCalendar
        calendar_json.append({
            "title": event.get("summary", "🗓️ Appuntamento"),
            "start": start_dt.isoformat(),
            "end": end_dt.isoformat()
        })

    return templates.TemplateResponse("sections/calendar.html", {
        "request": request,
        "events": events,
        "calendar_json": calendar_json,
        "timezone": tz
    })

@router.get("/admin/faq", response_class=HTMLResponse)
def admin_faq(request: Request):
    if not is_authenticated(request):
        return RedirectResponse(url="/admin/login", status_code=302)
    return templates.TemplateResponse("sections/faq.html", {"request": request})

@router.get("/admin/logs", response_class=HTMLResponse)
def admin_logs(request: Request):
    if not is_authenticated(request):
        return RedirectResponse(url="/admin/login", status_code=302)
    return templates.TemplateResponse("sections/logs.html", {"request": request})