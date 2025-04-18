# app/services/detect_intent.py
from openai import OpenAI
from app.config import OPENAI_API_KEY, MODEL
from app.services.prompts import INTENT_CLASSIFIER_PROMPT

client = OpenAI(api_key=OPENAI_API_KEY)

def detect_intent(message: str) -> str:
    """Restituisce 'faq', 'appuntamento' o 'altro'."""

    try:
        res = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": INTENT_CLASSIFIER_PROMPT},
                {"role": "user", "content": message}
            ],
            temperature=0
        )
        intent = res.choices[0].message.content.strip().lower()

        if intent not in {"faq", "appuntamento", "altro"}:
            print(f"[WARN] Intent non riconosciuto: '{intent}', fallback su 'altro'")
            return "altro"

        print(f"[INTENT DETECTED] '{message}' -> {intent}")
        return intent
    
    except Exception as e:
        return "altro"