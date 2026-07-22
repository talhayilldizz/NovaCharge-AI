from sqlalchemy.dialects.postgresql import JSONB
import uuid
from sqlalchemy import Column, Float, ForeignKey, DateTime, Uuid
from sqlalchemy.sql import func
from app.database.session import Base
from geoalchemy2 import Geometry
from geoalchemy2.shape import to_shape


class Route(Base):
    __tablename__ = "routes"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    vehicle_id = Column(Uuid(as_uuid=True), ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True)
    
    start_location = Column(Geometry(geometry_type='POINT', srid=4326), nullable=False)
    end_location = Column(Geometry(geometry_type='POINT', srid=4326), nullable=False)
    
    total_distance_km = Column(Float)
    total_duration_mins = Column(Float)

    estimated_total_cost = Column(Float, nullable=True)
    ai_plan = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @property
    def start_lat(self) -> float:
        if self.start_location is not None:
            return to_shape(self.start_location).y
        return 0.0

    @property
    def start_lon(self) -> float:
        if self.start_location is not None:
            return to_shape(self.start_location).x
        return 0.0
        
    @property
    def end_lat(self) -> float:
        if self.end_location is not None:
            return to_shape(self.end_location).y
        return 0.0

    @property
    def end_lon(self) -> float:
        if self.end_location is not None:
            return to_shape(self.end_location).x
        return 0.0