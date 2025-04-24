# app/channels/whatsapp.py
from .base import ChatChannel
import os
import requests
from app.config import WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID

class WhatsAppChannel(ChatChannel):
    def extract_contact(self, payload):
        return payload['contacts'][0]['wa_id']

    def extract_message(self, payload):
        return payload['messages'][0]['text']['body']

    def send_message(self, contact_id, message=None, template_name=None, template_lang="en_US", template_components=None):
        phone_number_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID")
        access_token = os.environ.get("WHATSAPP_ACCESS_TOKEN")
        if not phone_number_id or not access_token:
            raise ValueError("Configura le variabili d'ambiente WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_ACCESS_TOKEN")
        url = f"https://graph.facebook.com/v22.0/{phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        if template_name:
            data = {
                "messaging_product": "whatsapp",
                "to": contact_id,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": template_lang}
                }
            }
            if template_components:
                data["template"]["components"] = template_components
        else:
            data = {
                "messaging_product": "whatsapp",
                "to": contact_id,
                "type": "text",
                "text": {"body": message or ""}
            }
        response = requests.post(url, headers=headers, json=data)
        print("WhatsApp API response:", response.status_code, response.text)
        return response.json()

    def greeting_message(self):
        return "Ciao! Sono il tuo assistente virtuale. Come posso aiutarti oggi?"