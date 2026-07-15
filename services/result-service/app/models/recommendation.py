from sqlalchemy import Column, Integer, Text, String, UniqueConstraint
from app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    dosha = Column(Text, nullable=False, index=True)
    language = Column(String(5), default="en", nullable=False, index=True)
    diet = Column(Text, nullable=True)
    yoga = Column(Text, nullable=True)
    ayurvedic_guidance = Column(Text, nullable=True)
    routine = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("dosha", "language", name="uix_dosha_language"),
    )
