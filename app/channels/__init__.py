# app/channels/__init__.py
from .facebook import FacebookChannel
from .whatsapp import WhatsAppChannel

def get_channel(channel_name):
    if channel_name == "facebook":
        return FacebookChannel()
    elif channel_name == "whatsapp":
        return WhatsAppChannel()
    else:
        raise ValueError("Unknown channel")