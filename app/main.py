# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import SESSION_SECRET_KEY
from app.dashboard.routes_admin import router as admin_router
from app.routers import appointments_router, faq_router, ui_local, whatsapp_router, conversation_router, statistics_router, logs_router, users_router

# Configura il rate limiter: 5 richieste al minuto per IP
limiter = Limiter(key_func=get_remote_address, default_limits=["5/minute"])

app = FastAPI(title="Chatbot AI")

# Registra handler per rate limit exceeded
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
app.include_router(whatsapp_router.router, tags=["WhatsApp"])
app.include_router(ui_local.router, tags=["Test UI"])
app.include_router(users_router.router, tags=["Users"])
app.include_router(conversation_router.router, tags=["Conversations"])
app.include_router(statistics_router.router, tags=["Statistics"])
app.include_router(logs_router.router, tags=["Logs"])


@app.get("/")
@limiter.limit("8/minute")
def root(request: Request):
    return {"message": "Chatbot AI is up and running."}