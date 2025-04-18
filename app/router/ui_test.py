# app/router/ui_test.py
from fastapi import APIRouter, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from app.services.openai_service import handle_message

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@router.get("/test", response_class=HTMLResponse)
def test_page(request: Request):
    return templates.TemplateResponse("test_ui.html", {"request": request, "response": None})

@router.post("/test", response_class=HTMLResponse)
async def test_post(request: Request, message: str = Form(...)):
    reply = handle_message(message)
    return templates.TemplateResponse("test_ui.html", {
        "request": request,
        "user_message": message,
        "response": reply
    })