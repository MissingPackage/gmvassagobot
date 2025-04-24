# app/channels/facebook.py
from .base import ChatChannel

class FacebookChannel(ChatChannel):
    def extract_contact(self, payload):
        return payload['sender']['id']

    def extract_message(self, payload):
        return payload['message']['text']

    def send_message(self, contact_id, message):
        # Qui chiamata API Messenger per inviare messaggio
        pass