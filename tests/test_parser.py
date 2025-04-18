import pytest
from app.embeddings.utils import parse_datetime

def test_parse_valid():
    result = parse_datetime("domani alle 16")
    assert result is not None

def test_parse_invalid():
    result = parse_datetime("quando vuoi tu")
    assert result is None