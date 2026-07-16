from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.session import get_db
from app.schemas.vehicles_schema import VehicleCreate, VehicleUpdate, VehicleResponse
from app.services import vehicle_service


router = APIRouter(
    prefix="/vehicles",
    tags=["Araç İşlemleri"]
)

@router.post("/user/{user_id}", response_model=VehicleResponse)
def add_vehicle(
    user_id: UUID,
    vehicle: VehicleCreate, 
    db: Session = Depends(get_db)
):
    return vehicle_service.create_vehicle(
        db=db,
        vehicle=vehicle,
        user_id=user_id
    )

@router.get("/user/{user_id}", response_model = List[VehicleResponse])
def get_user_vehicles(
    user_id : UUID,
    db: Session = Depends(get_db)
):
    return vehicle_service.get_user_vehicles(
        db= db,
        user_id=user_id
    )

@router.put("/user/{user_id}/{vehicle_id}", response_model = VehicleResponse)
def update_vehicle(
    user_id :UUID,
    vehicle_id :UUID,
    vehicle_data : VehicleUpdate,
    db: Session = Depends(get_db),
):
    db_vehicle = vehicle_service.get_vehicle_by_id(
        db = db,
        vehicle_id=vehicle_id
    )

    if not db_vehicle:
        raise HTTPException(
            status_code = 404,
            detail = "Araç Bulunamadı"
        )

    if db_vehicle.user_id != user_id:
        raise HTTPException(
            status_code = 403,
            detail="Bu aracı güncelleme yetkiniz yok!"
        )
    
    return vehicle_service.update_vehicle(
        db=db,
        vehicle=vehicle_data,
        db_vehicle=db_vehicle
    )

@router.delete("/user/{user_id}/{vehicle_id}")
def delete_vehicle(
    user_id :UUID,
    vehicle_id : UUID,
    db: Session = Depends(get_db)
):
    db_vehicle = vehicle_service.get_vehicle_by_id(
        db = db,
        vehicle_id=vehicle_id
    )

    if not db_vehicle:
        raise HTTPException(
            status_code = 404,
            detail = "Araç Bulunamadı"
        )
    
    if db_vehicle.user_id != user_id:
        raise HTTPException(
            status_code = 403,
            detail="Bu aracı silme yetkiniz yok!"
        )
    
    vehicle_service.delete_vehicle(
        db=db,
        db_vehicle=db_vehicle
    )

    return {
        "message" : "Araç Başarıyla Silindi"
    }
