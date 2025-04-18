# Chatbot Vassago

Chatbot Vassago è un assistente virtuale progettato per gestire FAQ, prenotazioni e interazioni personalizzate con gli utenti tramite diversi canali, come WhatsApp e interfacce web.

## Struttura del Progetto

```
.env
gitignore
Procfile
README.md
regenerate_embeddings.py
requirements.txt
app/
    config.py
    main.py
    data/
        .faq.hash
        credentials.json
        faq_embeddings.json
        faq.json
        token.json
    router/
        ui_test.py
        whatsapp.py
    services/
        booking_service.py
        calendar_service.py
        detect_intent.py
        embedding_utils.py
        faq_service.py
        openai_service.py
    templates/
```

### Componenti principali

- **app/main.py**: Entry point dell'applicazione.
- **app/config.py**: Configurazione centralizzata tramite variabili d'ambiente.
- **app/data/**: Contiene file di dati come FAQ e credenziali.
- **app/router/**: Gestisce le rotte per i canali di comunicazione.
- **app/services/**: Moduli per servizi come prenotazioni, gestione FAQ e integrazione con OpenAI.
- **templates/**: Template HTML per l'interfaccia utente.

## Requisiti

Assicurati di avere Python 3.11 o superiore installato. I pacchetti richiesti sono elencati in [requirements.txt](requirements.txt):

```bash
pip install -r requirements.txt
```

## Configurazione

1. Crea un file `.env` nella root del progetto con le seguenti variabili:
   ```
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

2. Assicurati che i file sensibili come `credentials.json` e `token.json` siano presenti in `app/data/`.

## Avvio del Progetto

Per avviare il server FastAPI, esegui:

```bash
uvicorn app.main:app --reload
```

Il server sarà disponibile su `http://127.0.0.1:8000`.

## Funzionalità

- **Gestione FAQ**: Risposte rapide basate su embedding semantici.
- **Prenotazioni**: Integrazione con Google Calendar per creare eventi e gestire disponibilità.
- **Canali di comunicazione**: Supporto per WhatsApp (via Twilio) e interfaccia web.
- **Personalizzazione**: Risposte adattate al tono aziendale e al canale.

## Contributi

Contribuzioni sono benvenute! Apri una pull request o segnala un problema nella sezione Issues.

## Licenza

Questo progetto è distribuito sotto licenza MIT. Consulta il file `LICENSE` per maggiori dettagli.