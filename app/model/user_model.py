from typing import Annotated
from pydantic import BaseModel, Field

class User(BaseModel):
    user_id: int
    username: str
    password: Annotated[str, Field(exclude=True)]
