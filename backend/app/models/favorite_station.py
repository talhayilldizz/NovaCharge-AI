import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Uuid
from sqlalchemy.sql import func
from app.database.session import Base

class FavoriteStation(Base):
    __tablename__ = "favorite_stations"
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    external_station_id = Column(String, nullable=False, index=True)
    custom_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
