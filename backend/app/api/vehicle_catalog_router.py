from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.vehicle_catalog import VehicleCatalog
from typing import Dict, List, Any

router = APIRouter(prefix="/vehicles/catalog", tags=["vehicle_catalog"])

@router.get("", response_model=Dict[str, List[Dict[str, Any]]])
def get_vehicle_catalog(db: Session = Depends(get_db)):
    catalog = db.query(VehicleCatalog).all()
    grouped_data = {}
    for vehicle in catalog:
        if vehicle.brand not in grouped_data:
            grouped_data[vehicle.brand] = []
        
        grouped_data[vehicle.brand].append({
            "model": vehicle.model,
            "batteryCapacity": str(vehicle.battery_capacity),
            "rangeKm": str(vehicle.range_km),
            "plugType": vehicle.plug_type
        })
    return grouped_data
