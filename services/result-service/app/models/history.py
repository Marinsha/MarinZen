from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base


class UserHistory(Base):
    __tablename__ = "user_recommendation_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    dosha = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
