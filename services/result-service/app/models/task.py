from sqlalchemy import Column, Integer, String, Boolean, Date, func
from app.database import Base


class TaskTracking(Base):
    __tablename__ = "task_tracking"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)  # diet / yoga / routine
    task_name = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    date = Column(Date, server_default=func.current_date(), nullable=False)
