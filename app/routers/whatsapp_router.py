# app/router/whatsapp_router.py
from fastapi import APIRouter, Request, Response, Query
from app.channels.whatsapp import WhatsAppChannel
from app.config import VERIFY_TOKEN

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])
channel = WhatsAppChannel()


@router.post("/send_test_message")
async def send_test_message(
    to: str = Query(..., description="Numero WhatsApp destinatario in formato internazionale"),
    text: str = Query(None, description="Testo del messaggio"),
    template_name: str = Query(None, description="Nome del template da inviare (se presente)"),
    template_lang: str = Query("en_US", description="Codice lingua del template"),
    template_components: str = Query(None, description="Componenti JSON opzionali per il template (come stringa JSON)")
):
    components = None
    if template_components:
        import json
        try:
            components = json.loads(template_components)
        except Exception as e:
            return {"error": f"template_components non è un JSON valido: {e}"}
    result = channel.send_message(
        contact_id=to,
        message=text,
        template_name=template_name,
        template_lang=template_lang,
        template_components=components
    )
    return result

@router.get("/webhook/whatsapp")
async def verify_webhook(request: Request):
    params = dict(request.query_params)
    if (
        params.get("hub.mode") == "subscribe"
        and params.get("hub.verify_token") == VERIFY_TOKEN
    ):
        return Response(content=params.get("hub.challenge"), media_type="text/plain")
    return Response(status_code=403)

@router.post("/webhook/whatsapp")
async def receive_message(request: Request):
    payload = await request.json()
    try:
        value = payload["entry"][0]["changes"][0]["value"]
        contact_id = channel.extract_contact(value)
        message = channel.extract_message(value)
        print(f"Messaggio da {contact_id}: {message}")
        # Risposta automatica di saluto
        greeting = channel.greeting_message()
        send_result = channel.send_message(contact_id, greeting)
        print("Risposta inviata:", send_result)
    except Exception as e:
        print("Errore nella gestione del messaggio WhatsApp:", e)
    return {"status": "received"}
    return {"status": "received"}