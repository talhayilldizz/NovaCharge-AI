import uuid
from sqlalchemy import Column, String, Float, Uuid
from app.database.session import Base

class OperatorTariff(Base):
    __tablename__ = "operator_tariffs"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    operator_name = Column(String, index=True, nullable=False, unique=True)
    ac_price_per_kwh = Column(Float, nullable=False)
    dc_price_per_kwh = Column(Float, nullable=False)
