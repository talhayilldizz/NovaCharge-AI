from fastapi import status
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.session import get_db
from app.schemas.station_schema import StationUpdate, StationCreate, StationResponse
from app.services import station_service
from typing import List

router = APIRouter(
    prefix="/stations",
    tags=["İstasyon İşlemleri"]
)

@router.get("/{station_id}", response_model=StationResponse)
def get_station(
    station_id : UUID,
    db: Session = Depends(get_db)
):
    db_station = station_service.get_station_by_id(
        db=db,
        station_id=station_id
    )

    if not db_station:
        raise HTTPException(
            status_code = 404,
            detail = "İstasyon Bulunamadı!"
        )
    
    return db_station

@router.get("/nearby", response_model=List[StationResponse])
def get_nearby_stations(
    lat: float,
    lon: float,
    radius_km: float = 10.0,
    db: Session = Depends(get_db)
):
    stations = station_service.get_nearby_stations(db=db, lat=lat, lon=lon, radius_km=radius_km)
    
    if not stations:
        raise HTTPException(
            status_code=404, 
            detail=f"Belirtilen konumun {radius_km} km çevresinde hiçbir istasyon bulunamadı."
        )
        
    return stations


@router.get("/",response_model = List[StationResponse])
def get_stations(
    db: Session = Depends(get_db),
    limit: int = 50
):
    db_stations = station_service.get_all_stations(
        db=db,
        limit=limit
    )

    if len(db_stations) == 0:
        raise HTTPException(
            status_code=404,
            detail="İstasyon Yok"
        )
    
    return db_stations


@router.post("/", response_model = StationResponse)
def create_station(
    station: StationCreate,
    db: Session = Depends(get_db)
):
    return station_service.create_station(
        db=db,
        station=station
    )


@router.put("/{station_id}", response_model=StationResponse)
def update_station(
    station_id: UUID,
    station_data: StationUpdate,
    db: Session = Depends(get_db)
):
    db_station = station_service.get_station_by_id(db=db, station_id=station_id)
    if not db_station:
        raise HTTPException(status_code=404, detail="İstasyon Bulunamadı!")
        
    return station_service.update_station(db=db, db_station=db_station, station_update=station_data)


@router.delete("/{station_id}")
def delete_station(
    station_id: UUID,
    db: Session = Depends(get_db)
):
    db_station = station_service.get_station_by_id(db=db, station_id=station_id)
    if not db_station:
        raise HTTPException(status_code=404, detail="İstasyon Bulunamadı!")
        
    station_service.delete_station(db=db, db_station=db_station)
    return {"message": "İstasyon başarıyla silindi"}