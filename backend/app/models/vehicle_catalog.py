import uuid
from sqlalchemy import Column, String, Float, Integer, Uuid
from app.database.session import Base

class VehicleCatalog(Base):
    __tablename__ = "vehicle_catalog"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    brand = Column(String, index=True, nullable=False)
    model = Column(String, index=True, nullable=False)
    battery_capacity = Column(Float, nullable=False)
    range_km = Column(Integer, nullable=False)
    plug_type = Column(String, nullable=False)
