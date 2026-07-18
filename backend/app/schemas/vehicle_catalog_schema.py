from pydantic import BaseModel
from uuid import UUID

class VehicleCatalogBase(BaseModel):
    brand: str
    model: str
    battery_capacity: float
    range_km: int
    plug_type: str

class VehicleCatalogResponse(VehicleCatalogBase):
    id: UUID

    class Config:
        from_attributes = True
