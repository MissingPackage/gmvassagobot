# app/channels/base.py
from abc import ABC, abstractmethod

class ChatChannel(ABC):
    @abstractmethod
    def extract_contact(self, payload):
        pass

    @abstractmethod
    def extract_message(self, payload):
        pass

    @abstractmethod
    def send_message(self, contact_id, message):
        pass