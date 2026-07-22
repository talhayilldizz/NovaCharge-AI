from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database.session import get_db
from app.schemas.vehicles_schema import VehicleCreate, VehicleUpdate, VehicleResponse
from app.services import vehicle_service
from app.models.user import User
from app.api.deps import get_current_user


router = APIRouter(
    prefix="/vehicles",
    tags=["Araç İşlemleri"]
)

@router.post("/", response_model=VehicleResponse)
def add_vehicle(
    vehicle: VehicleCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return vehicle_service.create_vehicle(
        db=db,
        vehicle=vehicle,
        user_id=current_user.id
    )

@router.get("/", response_model = List[VehicleResponse])
def get_user_vehicles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return vehicle_service.get_user_vehicles(
        db= db,
        user_id=current_user.id
    )

@router.put("/{vehicle_id}", response_model = VehicleResponse)
def update_vehicle(
    vehicle_id :UUID,
    vehicle_data : VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User =Depends(get_current_user)
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

    if db_vehicle.user_id != current_user.id:
        raise HTTPException(
            status_code = 403,
            detail="Bu aracı güncelleme yetkiniz yok!"
        )
    
    return vehicle_service.update_vehicle(
        db=db,
        vehicle=vehicle_data,
        db_vehicle=db_vehicle
    )

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id : UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
    
    if db_vehicle.user_id != current_user.id:
        raise HTTPException(
            status_code = 403,
            detail="Bu aracı silme yetkiniz yok!"
        )
    

    if db_vehicle.is_primary == True:
        raise HTTPException(
            status_code = 403,
            detail="Birincil araçlar silinmez"
        )

    vehicle_service.delete_vehicle(
        db=db,
        db_vehicle=db_vehicle
    )

    return {
        "message" : "Araç Başarıyla Silindi"
    }

@router.patch("/{vehicle_id}/set-primary", response_model=VehicleResponse)
def set_primary(
    vehicle_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_vehicle = vehicle_service.get_vehicle_by_id(
        db=db,
        vehicle_id=vehicle_id
    )

    if not db_vehicle:
        raise HTTPException(
            status_code=404,
            detail="Araç Bulunamadı"
        )
    
    if db_vehicle.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu aracı varsayılan yapma yetkiniz yok!"
        )
    
    updated_vehicle = vehicle_service.set_primary_vehicle(
        db=db,
        vehicle_id=vehicle_id,
        user_id=current_user.id
    )

    return updated_vehicle
