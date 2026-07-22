from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class RouteCreate(BaseModel):
    vehicle_id: UUID
    start_lat: float = Field(..., example=41.0082)
    start_lon: float = Field(..., example=28.9784)
    end_lat: float = Field(..., example=39.9208)
    end_lon: float = Field(..., example=32.8541) 

    total_distance_km: Optional[float] = None
    total_duration_mins: Optional[float] = None
    ai_plan: Optional[dict] = None

class RouteResponse(BaseModel):
    id: UUID
    user_id: UUID
    vehicle_id: Optional[UUID]
    start_lat: Optional[float] = None
    start_lon: Optional[float] = None
    end_lat: Optional[float] = None
    end_lon: Optional[float] = None
    total_distance_km: Optional[float]
    total_duration_mins: Optional[float]
    ai_plan: Optional[dict] = None
    created_at: datetime
    model_config = {"from_attributes": True}