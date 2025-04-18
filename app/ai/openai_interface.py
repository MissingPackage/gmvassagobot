# app/services/openai_service.py
import os
from openai import OpenAI
from app.config import OPENAI_API_KEY, MODEL
from app.ai.prompts import DEFAULT_SYSTEM_PROMPT
from app.nlp.intent import detect_intent
from app.embeddings.faq import faq_semantic
from app.booking import gestisci_prenotazione

client = OpenAI(api_key=OPENAI_API_KEY)

def handle_message(user_message: str) -> str:
    intent = detect_intent(user_message)
    print(f"Intent rilevato: {intent}")

    if intent == "faq":
        answer = faq_semantic.match(user_message)
        if answer:
            return answer
        return ask_gpt(user_message)
    
    elif intent == "appuntamento":
        return gestisci_prenotazione(user_message)
    
    elif intent == "altro":
        if faq_semantic.match(user_message):
            intent = "faq"
        else:
            return "Non sono sicuro di cosa intendi. Potresti riformulare?"

def ask_gpt(message: str) -> str:

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": DEFAULT_SYSTEM_PROMPT},
                {"role": "user", "content": message}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Errore durante la chiamata a OpenAI: {str(e)}"