import datetime
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, UniqueConstraint
from app.database import Base

class UserTaskHistory(Base):
    __tablename__ = "user_task_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    dosha = Column(String(50), nullable=True)
    state = Column(String(50), nullable=True)
    task_type = Column(String(30), nullable=True)
    text_en = Column(Text, nullable=False)
    text_ta = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending | completed | skipped
    task_date = Column(Date, default=datetime.date.today, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Prevent duplicate assignment of the exact same task text to a user on a given date
    __table_args__ = (
        UniqueConstraint('user_id', 'task_date', 'text_en', name='_user_date_task_uc'),
    )
