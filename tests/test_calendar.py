import pytest
from unittest.mock import Mock, patch
from datetime import datetime, timezone
from app.calendar.gcal import check_availability, create_appointment

@patch("app.calendar.gcal.get_calendar_service")
def test_check_availability_slot_free(mock_get_calendar_service):
    # Crea il servizio fittizio
    mock_service = Mock()
    mock_get_calendar_service.return_value = mock_service

    # Mock timezone calendario
    mock_service.calendars().get().execute.return_value = {"timeZone": "Europe/Rome"}

    # Mock eventi (slot libero)
    mock_service.events().list().execute.return_value = {"items": []}

    # Definisci lo slot da controllare
    start_time = datetime(2025, 4, 21, 14, 0, tzinfo=timezone.utc)
    end_time = datetime(2025, 4, 21, 15, 0, tzinfo=timezone.utc)

    # Esegui la funzione
    result = check_availability(start_time, end_time)

    # ✅ Verifica il risultato
    assert result is True

    # ✅ Verifica che almeno una chiamata sia stata fatta
    assert mock_service.events().list.called

@patch("app.calendar.gcal.get_calendar_service")
def test_check_availability_slot_occupied(mock_get_calendar_service):
    # Mock the calendar service
    mock_service = Mock()
    mock_get_calendar_service.return_value = mock_service

    # Mock the calendar timezone
    mock_service.calendars().get().execute.return_value = {"timeZone": "Europe/Rome"}

    # Mock the events list response (overlapping events)
    mock_service.events().list().execute.return_value = {
        "items": [
            {
                "summary": "Meeting",
                "start": {"dateTime": "2025-04-21T14:00:00+02:00"},
                "end": {"dateTime": "2025-04-21T15:00:00+02:00"},
            }
        ]
    }

    start_time = datetime(2025, 4, 21, 14, 0, tzinfo=timezone.utc)
    end_time = datetime(2025, 4, 21, 15, 0, tzinfo=timezone.utc)

    # Call the function
    result = check_availability(start_time, end_time)

    # Assertions
    assert result is False
    mock_service.events().list.called

@patch("app.calendar.gcal.get_calendar_service")
def test_create_appointment(mock_get_calendar_service):
    # Mock the calendar service
    mock_service = Mock()
    mock_get_calendar_service.return_value = mock_service

    # Mock the calendar timezone
    mock_service.calendars().get().execute.return_value = {"timeZone": "Europe/Rome"}

    # Mock the event creation response
    mock_service.events().insert().execute.return_value = {"htmlLink": "http://example.com/event"}

    start_time = datetime(2025, 4, 21, 14, 0, tzinfo=timezone.utc)
    end_time = datetime(2025, 4, 21, 15, 0, tzinfo=timezone.utc)
    summary = "Test Event"
    description = "This is a test event."

    # Call the function
    result = create_appointment(start_time, end_time, summary, description)

    # Assertions
    assert result == "http://example.com/event"
    mock_service.events().insert.called