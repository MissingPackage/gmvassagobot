# app/services/faq_service.py
import json
import numpy as np
from pathlib import Path
from app.embeddings.utils import get_embedding, cosine_similarity

from app.ai.regenerate_embeddings import regenerate_if_needed

regenerate_if_needed()

class FAQSemanticSearch:
    def __init__(self, faq_path: Path, cache_path: Path):
        self.faq_path = faq_path
        self.cache_path = cache_path
        self.entries = self.load_faq()
        self.load_or_generate_embeddings()

    def load_faq(self):
        with open(self.faq_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def load_or_generate_embeddings(self):
        if self.cache_path.exists():
            print("✅ Carico gli embedding da cache.")
            with open(self.cache_path, "r", encoding="utf-8") as f:
                cached_data = json.load(f)
            for i, entry in enumerate(self.entries):
                entry["embedding"] = cached_data[i]["embedding"]
        else:
            print("⚙️ Nessuna cache trovata. Genero e salvo gli embedding.")
            for entry in self.entries:
                entry["embedding"] = get_embedding(entry["question"]).tolist()
            with open(self.cache_path, "w", encoding="utf-8") as f:
                json.dump(self.entries, f, indent=2)

    def match(self, user_message: str, threshold: float = 0.82) -> str | None:
        user_vec = get_embedding(user_message)
        best_score = 0
        best_answer = None

        for entry in self.entries:
            faq_vec = entry["embedding"]
            sim = cosine_similarity(user_vec, faq_vec)
            if sim > best_score and sim >= threshold:
                best_score = sim
                best_answer = entry["answer"]

        return best_answer

# istanza globale riutilizzabile
faq_path = Path("app/data/faq.json")
cache_path = Path("app/data/faq_embeddings.json")
faq_semantic = FAQSemanticSearch(faq_path, cache_path)