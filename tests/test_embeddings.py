import pytest
from unittest.mock import Mock, patch
from app.embeddings.faq import FAQSemanticSearch
from pathlib import Path
import numpy as np
import json

@pytest.fixture
def mock_faq_data():
    return [
        {"question": "What is your name?", "answer": "My name is Chatbot."},
        {"question": "What is the capital of France?", "answer": "The capital of France is Paris."},
    ]

@pytest.fixture
def mock_faq_path(tmp_path, mock_faq_data):
    faq_path = tmp_path / "faq.json"
    with open(faq_path, "w", encoding="utf-8") as f:
        json.dump(mock_faq_data, f)
    return faq_path

@pytest.fixture
def mock_cache_path(tmp_path):
    return tmp_path / "faq_embeddings.json"

@patch("app.embeddings.faq.get_embedding")
def test_load_or_generate_embeddings_no_cache(mock_get_embedding, mock_faq_path, mock_cache_path, mock_faq_data):
    mock_get_embedding.side_effect = lambda text: np.array([1.0, 2.0, 3.0])  # Mock embedding

    faq_search = FAQSemanticSearch(mock_faq_path, mock_cache_path)
    assert mock_cache_path.exists()  # Cache file should be created
    assert len(faq_search.entries) == len(mock_faq_data)
    for entry in faq_search.entries:
        assert "embedding" in entry

@patch("app.embeddings.faq.get_embedding")
def test_load_or_generate_embeddings_with_cache(mock_get_embedding, mock_faq_path, mock_cache_path, mock_faq_data):
    # Create a mock cache file
    cached_data = [{"embedding": [1.0, 2.0, 3.0]} for _ in mock_faq_data]
    with open(mock_cache_path, "w", encoding="utf-8") as f:
        json.dump(cached_data, f)

    faq_search = FAQSemanticSearch(mock_faq_path, mock_cache_path)
    assert len(faq_search.entries) == len(mock_faq_data)
    for entry in faq_search.entries:
        assert "embedding" in entry
        assert entry["embedding"] == [1.0, 2.0, 3.0]

@patch("app.embeddings.faq.get_embedding")
@patch("app.embeddings.faq.cosine_similarity")
def test_match(mock_cosine_similarity, mock_get_embedding, mock_faq_path, mock_cache_path, mock_faq_data):
    mock_get_embedding.return_value = np.array([1.0, 2.0, 3.0])  # Mock user embedding
    mock_cosine_similarity.side_effect = [0.5, 0.9]  # Mock similarity scores

    faq_search = FAQSemanticSearch(mock_faq_path, mock_cache_path)
    result = faq_search.match("What is the capital of France?", threshold=0.8)

    assert result == "The capital of France is Paris."
    mock_cosine_similarity.assert_called()

@patch("app.embeddings.faq.get_embedding")
@patch("app.embeddings.faq.cosine_similarity")
def test_match_no_result(mock_cosine_similarity, mock_get_embedding, mock_faq_path, mock_cache_path, mock_faq_data):
    mock_get_embedding.return_value = np.array([1.0, 2.0, 3.0])  # Mock user embedding
    mock_cosine_similarity.side_effect = [0.5, 0.6]  # Mock similarity scores below threshold

    faq_search = FAQSemanticSearch(mock_faq_path, mock_cache_path)
    result = faq_search.match("What is the capital of France?", threshold=0.8)

    assert result is None
    mock_cosine_similarity.assert_called()