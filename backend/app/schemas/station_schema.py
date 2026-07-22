from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID

class StationSocketBase(BaseModel):
    socket_code: Optional[str] = None
    is_green_energy: Optional[bool] = False
    service_type: Optional[str] = None
    current_type: Optional[str] = None
    connector_type: Optional[str] = None
    power_kw: Optional[float] = None

class StationSocketResponse(StationSocketBase):
    id: UUID
    station_id: UUID
    model_config = {"from_attributes": True}

class StationCreate(BaseModel):
    station_code: str
    name: str = Field(...,example="ZES Zorlu Center")
    brand: Optional[str] = None
    latitude: float = Field(..., example=41.0664)
    longitude: float = Field(..., example=29.0163)
    province: Optional[str] = None
    district: Optional[str] = None
    is_fast_charge: Optional[bool] = Field(default=False)
    total_sockets: Optional[int] = Field(default=0)

class StationUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_fast_charge: Optional[bool] = None
    total_sockets: Optional[int] = None

class StationResponse(BaseModel):
    id: UUID
    station_code: str
    name: str
    brand: Optional[str] = None
    latitude: float
    longitude: float
    province: Optional[str] = None
    district: Optional[str] = None
    is_fast_charge: bool
    total_sockets: int
    sockets: List[StationSocketResponse] = []
    
    model_config = {"from_attributes": True}

# A very lightweight response just for rendering map markers
class LightweightStationResponse(BaseModel):
    id: UUID
    name: str
    brand: str
    latitude: float
    longitude: float
    is_fast_charge: bool
    total_sockets: int
    
    model_config = {"from_attributes": True}