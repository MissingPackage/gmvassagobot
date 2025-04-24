# app/init_db.py
from app.db import Base, engine
import app.templates.models  # Importa i modelli!

Base.metadata.create_all(bind=engine)
print("Tabelle create (se non esistevano già)")