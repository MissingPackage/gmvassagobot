# app/router/whatsapp.py
from fastapi import APIRouter, Request
from app.services.openai_service import ask_gpt

router = APIRouter()

@router.post("/whatsapp")
async def whatsapp_webhook(req: Request):
    data = await req.json()

    try:
        user_message = data["Body"]
        sender = data["From"]
    except KeyError:
        return {"status": "invalid request"}

    reply = ask_gpt(user_message)

    # Qui puoi aggiungere invio di risposta via Twilio (es. con requests.post)
    print(f"Risposta per {sender}: {reply}")

    return {"status": "ok"}