from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime


class TaskBase(BaseModel):
    task_name: str
    category: str
    completed: bool
    date: date


class TaskRead(TaskBase):
    id: int

    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    completed: bool


class TaskGenerateRequest(BaseModel):
    vata: float
    pitta: float
    kapha: float


class DailyTaskBase(BaseModel):
    dosha: str
    state: str
    task_type: str
    text_en: str
    text_ta: str


class DailyTaskRead(DailyTaskBase):
    id: int

    class Config:
        from_attributes = True


class UserTaskHistoryBase(BaseModel):
    user_id: int
    dosha: Optional[str] = None
    state: Optional[str] = None
    task_type: Optional[str] = None
    text_en: str
    text_ta: str
    status: str
    task_date: date


class UserTaskHistoryRead(UserTaskHistoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


