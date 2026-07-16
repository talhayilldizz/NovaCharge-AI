import uuid
from sqlalchemy import Column, String, Boolean, Float, Integer, Uuid
from app.database.session import Base
from geoalchemy2 import Geometry

class Station(Base):
    __tablename__ = "stations"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    location = Column(Geometry(geometry_type='POINT', srid=4326))
    is_fast_charge = Column(Boolean, default=False)
    available_sockets = Column(Integer, default=0)
