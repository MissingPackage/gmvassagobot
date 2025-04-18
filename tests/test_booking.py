import pytest
from app.booking import check_and_book_slot

def test_booking_flow():
    result = check_and_book_slot("2025-04-21", "16:00", 30)
    assert isinstance(result, dict)