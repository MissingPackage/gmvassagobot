import pytest
from app.embeddings.faq import get_faq_answer

def test_known_question():
    assert get_faq_answer("Come funziona la sessione gratuita?") is not None

def test_unknown_question():
    assert get_faq_answer("Qual è il tuo colore preferito?") is None