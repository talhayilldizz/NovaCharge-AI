import uuid
from sqlalchemy import Column, String, Integer, DateTime, Uuid, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.session import Base

class StationReview(Base):
    __tablename__="station_reviews"

    id = Column(Uuid(as_uuid=True), primary_key=True,default=uuid.uuid4, index=True)
    station_id = Column(Uuid(as_uuid=True), ForeignKey("stations.id", ondelete="CASCADE"), index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),index=True)

    rating = Column(Integer, nullable=False)
    comment = Column(String, nullable=True)
    is_anonymous = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    station = relationship("Station", back_populates="reviews")
    user = relationship("User")