from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from util import logger
import logging
from common.config import settings
from api.user_router import router as user_router

app_logger = logging.getLogger(__name__)

app = FastAPI(title=settings.APP_NAME, version=settings.VERSION)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])
app.include_router(user_router, prefix="/users", tags=["User APIs"])

@app.get("/", tags=["Root APIs"])
def info_api(request: Request):
    app_logger.info('--- info_api API invoked ---')
    ip_address = request.client.host
    return {"message": "This is Nava9 User Application", "ip_address": ip_address, "Environment": settings.APP_ENVIRONMENT}
