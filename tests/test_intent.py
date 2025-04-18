import pytest
from app.nlp.intent import detect_intent
from unittest.mock import patch, Mock

def test_detect_booking_intent():
    assert detect_intent("Vorrei prenotare una sessione") == "appuntamento"

def test_detect_unknown_intent():
    assert detect_intent("Ciao, come va?") in ["faq", "appuntamento", "altro"]

@patch("app.nlp.intent.client.chat.completions.create")
def test_detect_intent_faq(mock_create):
    mock_create.return_value = Mock(choices=[Mock(message=Mock(content="faq"))])
    assert detect_intent("Qual è il tuo nome?") == "faq"

@patch("app.nlp.intent.client.chat.completions.create")
def test_detect_intent_appointment(mock_create):
    mock_create.return_value = Mock(choices=[Mock(message=Mock(content="appuntamento"))])
    assert detect_intent("Vorrei fissare un appuntamento") == "appuntamento"

@patch("app.nlp.intent.client.chat.completions.create")
def test_detect_intent_other(mock_create):
    mock_create.return_value = Mock(choices=[Mock(message=Mock(content="altro"))])
    assert detect_intent("Ciao, come stai?") == "altro"

@patch("app.nlp.intent.client.chat.completions.create")
def test_detect_intent_unrecognized(mock_create):
    mock_create.return_value = Mock(choices=[Mock(message=Mock(content="unknown"))])
    assert detect_intent("Messaggio non chiaro") == "altro"

@patch("app.nlp.intent.client.chat.completions.create")
def test_detect_intent_api_error(mock_create):
    mock_create.side_effect = Exception("API Error")
    assert detect_intent("Qual è il tuo nome?") == "altro"