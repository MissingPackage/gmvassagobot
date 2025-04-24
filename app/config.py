# app/config.py
import os
from dotenv import load_dotenv
from pathlib import Path

# Carica .env dalla root, ovunque tu lanci l'app
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("MODEL", "gpt-4o-mini")
EMBEDDING_MODEL=os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY")
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
VERIFY_TOKEN = os.getenv("VERIFY_TOKEN")

if not OPENAI_API_KEY:
    raise RuntimeError("❌ OPENAI_API_KEY non trovata! Controlla il file .env o le variabili d'ambiente.")
