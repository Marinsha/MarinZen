from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from app.questions import questions_map

app = FastAPI(
    title="MarinZen Quiz Service",
    description="Service for managing and providing Dosha quiz questions",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """Health check endpoint for the Quiz Service."""
    return {"message": "Quiz Service is running"}

@app.get("/questions")
def get_questions(x_language: str = Header(default="en")):
    """Returns the list of Dosha quiz questions."""
    lang_val = x_language.lower()
    questions = questions_map.get(lang_val, questions_map["en"])
    return {"questions": questions}
