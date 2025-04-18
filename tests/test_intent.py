import pytest
from app.nlp.intent import detect_intent

def test_detect_booking_intent():
    assert detect_intent("Vorrei prenotare una sessione") == "booking"

def test_detect_unknown_intent():
    assert detect_intent("Ciao, come va?") in ["faq", "other", "greeting"]