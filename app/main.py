# app/main.py
from fastapi import FastAPI
from app.router import whatsapp, ui_test

app = FastAPI(title="Chatbot AI")

# Includiamo il router di WhatsApp
app.include_router(whatsapp.router, prefix="/webhook", tags=["WhatsApp"])
app.include_router(ui_test.router, tags=["Test UI"])

@app.get("/")
def root():
    return {"message": "Chatbot AI is up and running."}