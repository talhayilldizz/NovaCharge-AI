from fastapi import status
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.session import get_db
from app.schemas.station_schema import StationUpdate, StationCreate, StationResponse, LightweightStationResponse
from app.services import station_service
from typing import List

router = APIRouter(
    prefix="/stations",
    tags=["İstasyon İşlemleri"]
)

@router.get("/lightweight", response_model=List[LightweightStationResponse])
def get_lightweight_stations(
    db: Session = Depends(get_db),
    limit: int = 20000
):
    """
    Haritada performanslı gösterim için çok hafifletilmiş istasyon verisi döner.
    """
    stations = station_service.get_lightweight_stations(db=db, limit=limit)
    
    # We map them to dictionaries so Pydantic can parse them
    return [
        {
            "id": s[0],
            "name": s[1],
            "brand": s[2],
            "latitude": s[3],
            "longitude": s[4],
            "is_fast_charge": s[5],
            "total_sockets": s[6],
            "average_rating": 0.0,
            "total_reviews": 0
        }
        for s in stations
    ]

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