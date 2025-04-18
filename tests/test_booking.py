import pytest
from app.booking import (
    è_slot_valido,
    estrai_durata,
    estrai_data_ora,
    gestisci_prenotazione,
    suggerisci_slot_alternativi,
)
from datetime import datetime

def test_è_slot_valido():
    assert è_slot_valido(datetime(2025, 4, 21, 12, 0)) is True
    assert è_slot_valido(datetime(2025, 4, 21, 23, 59)) is False
    assert è_slot_valido(datetime(2025, 4, 21, 11, 59)) is False
    assert è_slot_valido(datetime(2025, 4, 21, 15, 0)) is True

def test_estrai_durata():
    assert estrai_durata("30 minuti") == 30
    assert estrai_durata("1 ora") == 60
    assert estrai_durata("2 ore") == 120
    assert estrai_durata("mezz'ora") == 30
    assert estrai_durata("un quarto d'ora") == 15
    assert estrai_durata("venti minuti") == 20
    assert estrai_durata("testo senza durata") is None

def test_estrai_data_ora():
    assert estrai_data_ora("21 aprile 2025 alle 16:00") == datetime(2025, 4, 21, 16, 0)
    assert estrai_data_ora("domani alle 14:00") is not None
    assert estrai_data_ora("testo senza data") is None

def test_gestisci_prenotazione(mocker):
    mocker.patch("app.booking.estrai_data_ora", return_value=datetime(2025, 4, 21, 16, 0))
    mocker.patch("app.booking.estrai_durata", return_value=30)
    mocker.patch("app.booking.check_availability", return_value=True)
    mocker.patch("app.booking.create_appointment", return_value="http://example.com/appointment")

    result = gestisci_prenotazione("Prenota per il 21 aprile 2025 alle 16:00 per 30 minuti")
    assert "✅ Appuntamento fissato" in result
    assert "http://example.com/appointment" in result

def test_gestisci_prenotazione_slot_non_valido(mocker):
    mocker.patch("app.booking.estrai_data_ora", return_value=datetime(2025, 4, 21, 11, 0))
    result = gestisci_prenotazione("Prenota per il 21 aprile 2025 alle 11:00")
    assert "Mi dispiace, posso fissare appuntamenti solo dopo le 12:00" in result

def test_gestisci_prenotazione_data_non_valida(mocker):
    mocker.patch("app.booking.estrai_data_ora", return_value=None)
    result = gestisci_prenotazione("Prenota per una data non valida")
    assert "Non ho capito la data e l'ora" in result

def test_suggerisci_slot_alternativi(mocker):
    # definisce una funzione che restituisce False per il primo slot, True per i successivi
    def mock_availability(*args, **kwargs):
        mock_availability.counter += 1
        return mock_availability.counter > 1
    mock_availability.counter = 0

    mocker.patch("app.booking.check_availability", side_effect=mock_availability)

    start_time = datetime(2025, 4, 21, 16, 0)
    alternatives = suggerisci_slot_alternativi(start_time, 30)

    assert len(alternatives) == 3
    assert alternatives[0] > start_time
    assert alternatives[1] > alternatives[0]
