from pydantic import BaseModel
from typing import List, Optional

class StationInfo(BaseModel):
    name: str
    is_fast_charge: bool
    
class AIRouteAnalysisRequest(BaseModel):
    start_point: str
    end_point: str
    total_distance_km: float
    total_duration_mins: float
    vehicle_model: Optional[str] = None
    battery_capacity_kwh: Optional[float] = None
    range_km: Optional[int] = None
    current_battery_percentage: Optional[int] = None
    route_coordinates: List[List[float]] # [[lat, lon], [lat, lon], ...]
    
class ChargingStop(BaseModel):
    station_name: str
    charging_time_mins: int
    estimated_cost_try: float

class AIRouteAnalysisResponse(BaseModel):
    total_cost: float
    total_time_lost: int
    charging_stops: List[ChargingStop]
    general_recommendations: List[str]