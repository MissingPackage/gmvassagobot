# app/services/booking_service.py
import dateparser
from datetime import datetime, time
from dateparser.conf import settings as dp_settings
from datetime import timedelta
from app.services.calendar_service import check_availability, create_appointment
from openai import OpenAI
from app.config import OPENAI_API_KEY, MODEL
from app.services.prompts import DATETIME_EXTRACTION_PROMPT, DURATION_EXTRACTION_PROMPT
import json
import re

client = OpenAI(api_key=OPENAI_API_KEY)

def è_slot_valido(start_time: datetime) -> bool:
    return time(12, 0) <= start_time.time() < time(23, 59)

def estrai_durata(messaggio: str) -> int | None:
    msg = messaggio.lower()

    # Espressioni numeriche comuni
    match = re.search(r"(\d{1,3})\s*(minuti|min|ore|h)", msg)
    if match:
        numero = int(match.group(1))
        unità = match.group(2)
        return numero * 60 if "or" in unità else numero

    # Frasi testuali comuni
    frasi_durata = {
        "mezz'ora": 30,
        "mezza ora": 30,
        "un quarto d’ora": 15,
        "un quarto d'ora": 15,
        "quindici minuti": 15,
        "venti minuti": 20,
        "mezzora": 30,
    }

    for chiave, durata in frasi_durata.items():
        if chiave in msg:
            return durata

    return None

def estrai_durata_con_gpt(messaggio: str) -> int | None:
    try:
        res = client.chat.completions.create(
            model="gpt-3.5-turbo",
            temperature=0,
            messages=[
                {"role": "system", "content": DURATION_EXTRACTION_PROMPT},
                {"role": "user", "content": messaggio}
            ]
        )
        content = res.choices[0].message.content.strip()
        print("📏 GPT ha estratto durata:", content)
        parsed = json.loads(content)
        return parsed.get("durata_minuti")
    except Exception as e:
        print("❌ Estrazione durata fallita:", e)
        return None

def estrai_con_gpt(messaggio: str):
    try:
        res = client.chat.completions.create(
            model=MODEL,
            temperature=0,
            messages=[
                {"role": "system", "content": DATETIME_EXTRACTION_PROMPT},
                {"role": "user", "content": messaggio}
            ]
        )
        risposta = res.choices[0].message.content.strip()
        print("🤖 GPT dice:", risposta)

        data = json.loads(risposta)
        if not data or "data" not in data or "ora" not in data:
            return None

        dt = datetime.strptime(f"{data['data']} {data['ora']}", "%Y-%m-%d %H:%M")

        # ✅ controlla che sia nel futuro
        if dt <= datetime.now():
            print("❌ Data nel passato, scartata.")
            return None

        return dt

    except Exception as e:
        print("❌ GPT fallback failed:", e)
        return None

def estrai_data_ora(messaggio: str):
    parsed = dateparser.parse(
        messaggio,
        languages=['it'],
        settings={
            "PREFER_DATES_FROM": "future",               # forza date future
            "RETURN_AS_TIMEZONE_AWARE": False,            # evita problemi con timezone
            "RELATIVE_BASE": datetime.now()
        }
    )

    if parsed:
        print("✅ Parsing con dateparser:", parsed)
        return parsed

    print("🔄 dateparser fallito, provo con GPT...")
    return estrai_con_gpt(messaggio)


def gestisci_prenotazione(user_message: str) -> str:
    start_time = estrai_data_ora(user_message)

    if not start_time:
        return "Non ho capito la data e l'ora. Potresti riformulare il messaggio?"

    if not è_slot_valido(start_time):
        return "Mi dispiace, posso fissare appuntamenti solo dopo le 12:00. Hai un altro orario?"
    
    durata = estrai_durata(user_message) or estrai_durata_con_gpt(user_message) or 30
    end_time = start_time + timedelta(minutes=durata)

    if check_availability(start_time, end_time):
        link = create_appointment(
            start_time,
            end_time,
            summary="Sessione introduttiva con GM Vassago",
            description="Primo incontro gratuito con il giocatore"
        )
        return (
            f"✅ Appuntamento fissato per {start_time.strftime('%A %d %B alle %H:%M')} "
            f"(durata: {durata} minuti).\n📅 {link}"
        )
    else:
        alternative = suggerisci_slot_alternativi(start_time, durata)
        if not alternative:
            return "Mi dispiace, non ci sono slot liberi nei minuti successivi. Vuoi provare con un altro giorno o orario?"

        proposte = "\n".join([
            f"- {alt.strftime('%A %d %B alle %H:%M')}" for alt in alternative
        ])
        return (
            f"Purtroppo lo slot richiesto non è disponibile.\n"
            f"📅 Posso proporti questi orari:\n{proposte}\n"
            f"Scrivimi quello che preferisci!"
        )

def suggerisci_slot_alternativi(start_time, durata_minuti, calendario="primary", finestre=3) -> list[datetime]:
    from datetime import timedelta

    alternative = []
    tentativi = 0
    max_tentativi = 20  # massimo tentativi per non entrare in loop

    offset = timedelta(minutes=durata_minuti + 10)  # 10 min di margine

    while len(alternative) < finestre and tentativi < max_tentativi:
        start_time = start_time + offset
        end_time = start_time + timedelta(minutes=durata_minuti)

        if è_slot_valido(start_time) and check_availability(start_time, end_time, calendario):
            alternative.append(start_time)

        tentativi += 1

    return alternative
