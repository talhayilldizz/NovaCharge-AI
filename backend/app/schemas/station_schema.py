from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class StationCreate(BaseModel):
    name: str = Field(...,example="ZES Zorlu Center")
    latitude: float = Field(..., example=41.0664)
    longitude: float = Field(..., example = 29.0163)
    is_fast_charge: Optional[bool] = Field(default=False)
    available_sockets: Optional[int] = Field(default=0)

class StationUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_fast_charge: Optional[bool] = None
    available_sockets: Optional[int] = None

class StationResponse(BaseModel):
    id: UUID
    name: str
    latitude: float
    longitude: float
    is_fast_charge: bool
    available_sockets: int
    model_config = {"from_attributes": True}