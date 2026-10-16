import logging
from fastapi import APIRouter, HTTPException, status
from model.user_model import User
from service import user_service

app_logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_user(user: User):
    user = user_service.add_user(user)
    app_logger.info(f"User Added: userId - {user.user_id}, userName - {user.username}")
    return {"user": user}

@router.get("/")
def get_users():
    return {"users": user_service.get_users()}

@router.get("/{id}")
def get_user_by_id(id: int):
    user = user_service.get_user_by_id(id)
    if(user == None):
        app_logger.error(f"User {id} not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found")

    app_logger.info(f"User Details: userId - {user.user_id}, userName - {user.username}")
    return {"user": user}

@router.put("/{id}")
def update_user(id: int, user: User):
    user = user_service.update_user(id, user)
    if(user == None):
        app_logger.error(f"User {id} not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found")

    app_logger.info(f"User Updated: userId - {user.user_id}, userName - {user.username}")
    return {"user": user}

@router.delete("/{id}")
def delete_user(id: int):
    user = user_service.delete_user(id)
    if(user == None):
        app_logger.error(f"User {id} not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User {id} not found")

    app_logger.info(f"User Deleted: userId - {user.user_id}, userName - {user.username}")
    return {"user": user}
