import pytest
from app.calendar.gcal import is_slot_available

def test_available_slot():
    assert isinstance(is_slot_available("2025-04-21T12:00:00", 30), bool)