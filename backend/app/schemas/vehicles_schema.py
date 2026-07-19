from pydantic import Field
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class VehicleCreate(BaseModel):
    brand: str = Field(..., example="Tesla")
    model: str = Field(..., example="Model Y")
    battery_capacity: float = Field(..., example=75.0)
    range_km: int = Field(..., example=533)
    plug_type: Optional[str] = Field(default="CCS2")
    is_primary: Optional[bool] = Field(default=False)

class VehicleUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    battery_capacity: Optional[float] = None
    range_km: Optional[int] = None
    plug_type: Optional[str] = None
    is_primary: Optional[bool] = None

class VehicleResponse(BaseModel):
    id: UUID
    user_id: UUID
    brand: str
    model: str
    battery_capacity: float
    range_km: int
    plug_type: Optional[str]
    is_primary: bool
    model_config = {"from_attributes": True}
