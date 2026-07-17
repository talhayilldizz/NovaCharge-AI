from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class FavoriteStationCreate(BaseModel):
    external_station_id: str
    custom_name: Optional[str] = None

class FavoriteStationUpdate(BaseModel):
    custom_name: Optional[str] = None

class FavoriteStationResponse(BaseModel):
    id: UUID
    user_id: UUID
    external_station_id: str
    custom_name: Optional[str]
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
