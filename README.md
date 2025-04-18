# 🤖 Chatbot AI – GM Vassago Assistant

![Run Python Tests](https://github.com/MissingPackage/gmvassagobot/actions/workflows/ci.yml/badge.svg)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-%E2%9D%A4-red)](https://gmvassago.it)

Assistente virtuale AI professionale per la prenotazione di sessioni di gioco di ruolo, risposte automatiche alle FAQ e gestione appuntamenti su Google Calendar.  
Integrato con OpenAI, Google API e canali di messaggistica (WhatsApp, Messenger).

---

## 🧠 Funzionalità principali

- ✅ Riconoscimento intenzioni (`intent detection`)
- ✅ Risposte semantiche a FAQ (embedding + GPT fallback)
- ✅ Parsing naturale di data/ora con fallback AI
- ✅ Integrazione con Google Calendar per prenotazioni
- ✅ Gestione slot disponibili + alternative
- ✅ Interfaccia di test locale
- ✅ Logging intelligente per debugging
- ✅ Test automatizzati + CI GitHub Actions

---

## 📁 Struttura progetto

```
gmvassago_bot/
├── app/
│   ├── ai/
│   │   ├── prompts.py
│   │   └── openai_interface.py
│   ├── booking.py
│   ├── calendar/
│   │   ├── gcal.py
│   │   └── slot.py
│   ├── config.py
│   ├── embeddings/
│   │   ├── faq.py
│   │   └── utils.py
│   ├── main.py
│   └── nlp/
│       └── intent.py
├── tests/
│   ├── conftest.py
│   ├── test_booking.py
│   ├── test_calendar.py
│   ├── test_embeddings.py
│   ├── test_intent.py
│   └── test_parser.py
├── .github/
│   └── workflows/
│       └── ci.yml
├── .env
├── requirements.txt
└── README.md
```

---

## ⚙️ Setup rapido

```bash
# Clona il progetto
git clone https://github.com/MissingPackage/gmvassagobot.git
cd gmvassagobot

# Crea venv e attivalo
python -m venv venv
source venv/bin/activate  # oppure .\venv\Scripts\activate su Windows

# Installa dipendenze
pip install -r requirements.txt

# Configura il file .env
cp .env.example .env  # crea il tuo se necessario

# Avvia interfaccia test
python app/main.py
```

---

## 🧪 Esecuzione dei test

```bash
pytest tests/
```

Test automatizzati via GitHub Actions: ogni push o PR su `main` attiva i test CI.

---

## 🚀 Roadmap (sprint-based)

| Sprint | Focus                         | Stato |
|--------|-------------------------------|--------|
| 1      | NLP + Parser + Intent         | ✅ Completato |
| 2      | Embedding + Fallback + UI     | ✅ Completato |
| 3      | Google Calendar + Slot logic  | ✅ Completato |
| 4      | Docker + WhatsApp             | ⏳ In corso |
| 5      | Facebook + fallback avanzato  | ⬜ Da fare |
| 6      | UX, sicurezza, multilingua    | ⬜ Da fare |

---

## 📄 Licenza

MIT © GM Vassago Team
