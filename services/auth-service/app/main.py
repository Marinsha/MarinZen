from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models.user import User
from app.models.history import UserHistory  # Registers table with Base metadata
from app.routes.auth import router as auth_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MarinZen Auth Service",
    description="Service for user authentication and profile management",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development, can be restricted later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth_router, prefix="/auth", tags=["Auth"])

@app.get("/")
def read_root():
    """Health check endpoint for the Auth Service."""
    return {"message": "Auth Service is running"}