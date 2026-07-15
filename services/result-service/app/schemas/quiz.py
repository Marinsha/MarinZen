from pydantic import BaseModel
from typing import List, Literal, Optional


class Answer(BaseModel):
    dosha: Literal["Vata", "Pitta", "Kapha"]


class QuizSubmission(BaseModel):
    answers: List[Answer]


class QuizResultResponse(BaseModel):
    counts: dict
    percentages: dict
    dominant_dosha: Optional[str]
