from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "user_master"
    user_id = Column(Integer, primary_key=True)
    username = Column(String)
    password = Column(String)
