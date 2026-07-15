from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class DailyTask(Base):
    __tablename__ = "daily_tasks"

    id = Column(Integer, primary_key=True, index=True)
    dosha = Column(String(50), nullable=False)
    state = Column(String(50), nullable=False)
    task_type = Column(String(30), nullable=False)  # diet | yoga | routine | avoid
    text_en = Column(Text, nullable=False)
    text_ta = Column(Text, nullable=False)
