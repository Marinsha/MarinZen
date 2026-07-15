from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.database import engine
from app.models import Base
from app.routers import quiz, recommendations, tasks

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MarinZen Result Service",
    description=(
        "Service for tracking behavior, calculating Dosha results, "
        "and providing recommendations"
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router)
app.include_router(recommendations.router)
app.include_router(tasks.router)

@app.get("/")
def read_root():
    return {
        "message": "Result Service v2.0 is running with Task Tracking support"
    }
