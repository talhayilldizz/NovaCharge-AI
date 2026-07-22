from pydantic import BaseModel
from typing import List, Optional

class AIRouteAnalysisRequest(BaseModel):
    start_point: str
    end_point: str
    total_distance_km: float
    total_duration_mins: float
    vehicle_model: Optional[str] = None
    battery_capacity_kwh: Optional[float] = None
    range_km: Optional[int] = None
    current_battery_percentage: Optional[int] = None
    route_coordinates: List[List[float]] # [lat, lon] formatındaki rota çizgisi

class ChargingStop(BaseModel):
    station_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    charging_time_mins: int
    estimated_cost_try: float
    reason: Optional[str] = None

class AIRouteAnalysisResponse(BaseModel):
    total_cost: float
    total_time_lost: int
    charging_stops: List[ChargingStop]
    general_recommendations: List[str]