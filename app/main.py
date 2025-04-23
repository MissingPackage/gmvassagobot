# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from app.config import SESSION_SECRET_KEY
from app.dashboard.routes_admin import router as admin_router
from app.routers import api, faq_router, ui_local, whatsapp

app = FastAPI(title="Chatbot AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
# Includiamo il router di admin
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET_KEY)
app.include_router(admin_router)
app.mount("/static", StaticFiles(directory="app/dashboard/static"), name="static")

# Includiamo i router della Dashboard
app.include_router(api.api_router, tags=["api"])
app.include_router(faq_router.router, tags=["FAQ"])
app.include_router(whatsapp.router, prefix="/webhook", tags=["WhatsApp"])
app.include_router(ui_local.router, tags=["Test UI"])

@app.get("/")
def root():
    return {"message": "Chatbot AI is up and running."}