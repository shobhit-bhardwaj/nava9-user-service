from model.user_model import User as UserModel
from dao import user_dao
from dao.user import User as UserEntity
from util import enc_dec

def add_user(user: UserModel):
    userEntity = UserEntity(**user.model_dump())
    userEntity.password = enc_dec.get_password_hash(user.password)
    userEntity = user_dao.add_user(userEntity)
    return toModel(userEntity)

def get_users():
    userEntities: list[UserEntity] = user_dao.get_users()
    userModels: list[UserModel] = [ toModel(entity) for entity in userEntities]
    return userModels

def get_user_by_id(id: int):
    userEntity = user_dao.get_user_by_id(id)
    return toModel(userEntity)

def update_user(id: int, user: UserModel):
    user.password = enc_dec.get_password_hash(user.password)
    userEntity = user_dao.update_user(id, user)
    return toModel(userEntity)

def delete_user(id: int):
    userEntity = user_dao.delete_user(id)
    return toModel(userEntity)

def toModel(entity: UserEntity):
    if(entity == None):
        return None
    return UserModel(user_id=entity.user_id, username=entity.username, password=entity.password)
