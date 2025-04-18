# regenerate_embeddings.py
import json
import hashlib
from pathlib import Path
from app.services.embedding_utils import get_embedding

# Percorsi dei file
FAQ_PATH = Path("app/data/faq.json")
CACHE_PATH = Path("app/data/faq_embeddings.json")
HASH_PATH = Path("app/data/.faq.hash")

def get_file_hash(path: Path) -> str:
    """Calcola hash SHA256 del contenuto del file."""
    content = path.read_bytes()
    return hashlib.sha256(content).hexdigest()

def regenerate():
    """Genera e salva gli embedding delle FAQ."""
    with open(FAQ_PATH, "r", encoding="utf-8") as f:
        entries = json.load(f)

    print(f"\n🔄 Genero gli embedding per {len(entries)} FAQ...\n")
    for entry in entries:
        question = entry["question"]
        embedding = get_embedding(question)
        entry["embedding"] = embedding.tolist()
        print(f"✅ Fatto: {question}")

    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2)

    print(f"\n💾 Embedding salvati su: {CACHE_PATH.resolve()}\n")

def regenerate_if_needed():
    """Controlla se faq.json è cambiato e rigenera solo se serve."""
    current_hash = get_file_hash(FAQ_PATH)
    previous_hash = HASH_PATH.read_text().strip() if HASH_PATH.exists() else ""

    if current_hash == previous_hash:
        print("✅ Le FAQ non sono cambiate. Nessuna rigenerazione necessaria.")
        return

    regenerate()
    HASH_PATH.write_text(current_hash)

if __name__ == "__main__":
    regenerate_if_needed()
