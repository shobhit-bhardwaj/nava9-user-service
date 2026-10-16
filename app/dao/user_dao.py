from util.database import SessionLocal
from dao.user import User as User

def add_user(user: User):
    with SessionLocal() as session:
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

def get_users():
    with SessionLocal() as session:
        return session.query(User).all()

def get_user_by_id(id: int):
    with SessionLocal() as session:
        #return session.query(User).filter(User.user_id==id).first()
        return session.get(User, id)

def update_user(id: int, user: User):
    with SessionLocal() as session:
        entity = session.get(User, id)
        if(entity == None):
            return None

        entity.username = user.username
        entity.password = user.password
        session.commit()
        session.refresh(entity)
        return entity

def delete_user(id: int):
    with SessionLocal() as session:
        entity = session.get(User, id)
        if(entity == None):
            return None

        session.delete(entity)
        session.commit()
        return entity
