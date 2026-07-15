from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class SignupResponse(BaseModel):
    message: str
    user_id: int
    name: str
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: EmailStr
    dosha: str | None = None
    scores: dict[str, int] | None = None
    avatar: str | None = None


class UpdateDoshaRequest(BaseModel):
    dosha: str
    scores: dict[str, int] | None = None


class AvatarUpdateRequest(BaseModel):
    avatar: str