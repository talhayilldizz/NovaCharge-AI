import uuid
from sqlalchemy import Column, String, Boolean, Float, Integer, Uuid, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from geoalchemy2 import Geometry

class Station(Base):
    __tablename__ = "stations"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    station_code = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    brand = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    location = Column(Geometry(geometry_type='POINT', srid=4326))
    province = Column(String)
    district = Column(String)
    is_fast_charge = Column(Boolean, default=False)
    total_sockets = Column(Integer, default=0)

    # Relationships
    sockets = relationship("StationSocket", back_populates="station", cascade="all, delete-orphan")
    reviews = relationship("StationReview", back_populates="station", cascade="all, delete-orphan")

    @property
    def average_rating(self) -> float:
        if not self.reviews:
            return 0.0
        return round(sum(r.rating for r in self.reviews) / len(self.reviews), 1)

    @property
    def total_reviews(self) -> int:
        return len(self.reviews) if self.reviews else 0

class StationSocket(Base):
    __tablename__ = "station_sockets"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    station_id = Column(Uuid(as_uuid=True), ForeignKey("stations.id", ondelete="CASCADE"))
    socket_code = Column(String)
    is_green_energy = Column(Boolean, default=False)
    service_type = Column(String)
    current_type = Column(String)
    connector_type = Column(String)
    power_kw = Column(Float)

    # Relationships
    station = relationship("Station", back_populates="sockets")
