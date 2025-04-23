# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from app.config import SESSION_SECRET_KEY
from app.dashboard.routes_admin import router as admin_router
from app.routers import appointments_router, faq_router, ui_local, whatsapp, conversation_router, statistics_router, logs_router

app = FastAPI(title="Chatbot AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
""" 
Deprecated --------------------------------------------------------------------------
# Includiamo il router di admin
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET_KEY)
app.include_router(admin_router)
app.mount("/static", StaticFiles(directory="app/dashboard/static"), name="static")
-------------------------------------------------------------------------------------
"""


# Includiamo i router della Dashboard
app.include_router(appointments_router.router, tags=["Appointments"])
app.include_router(faq_router.router, tags=["FAQ"])
app.include_router(whatsapp.router, prefix="/webhook", tags=["WhatsApp"])
app.include_router(ui_local.router, tags=["Test UI"])
app.include_router(conversation_router.router, tags=["Conversations"])
app.include_router(statistics_router.router, tags=["Statistics"])
app.include_router(logs_router.router, tags=["Logs"])


@app.get("/")
def root():
    return {"message": "Chatbot AI is up and running."}