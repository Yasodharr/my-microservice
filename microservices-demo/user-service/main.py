from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import re

app = FastAPI(title="User Service", version="1.0.0")

# Sample in-memory data. Data resets whenever this service restarts.
users = {
    1: {"id": 1, "name": "Alice", "email": "alice@example.com"},
    2: {"id": 2, "name": "Bob", "email": "bob@example.com"},
}


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=254)

    @classmethod
    def validate_email_format(cls, value: str) -> str:
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value):
            raise ValueError("A valid email address is required")
        return value

    # Pydantic v2 field validation
    from pydantic import field_validator

    @field_validator("email")
    @classmethod
    def email_must_be_valid(cls, value: str) -> str:
        return cls.validate_email_format(value.strip())


@app.get("/health")
def health():
    return {"status": "healthy", "service": "user-service"}


@app.get("/users")
def get_users():
    return list(users.values())


@app.get("/users/{user_id}")
def get_user(user_id: int):
    user = users.get(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate):
    new_id = max(users.keys(), default=0) + 1
    new_user = {"id": new_id, **user.model_dump()}
    users[new_id] = new_user
    return new_user
