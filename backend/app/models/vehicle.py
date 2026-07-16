import uuid
from sqlalchemy import Column, String, Float, Integer, ForeignKey, Uuid
from app.database.session import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    brand = Column(String, index=True)      
    model = Column(String)                  
    battery_capacity = Column(Float)        
    range_km = Column(Integer)              
    plug_type = Column(String)              
