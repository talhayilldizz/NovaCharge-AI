from sqlalchemy.orm import Session
from uuid import UUID
from app.models.vehicle import Vehicle
from app.schemas.vehicles_schema import VehicleCreate, VehicleUpdate

def get_vehicle_by_id(
    db: Session,
    vehicle_id: UUID
):
    return db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

def get_user_vehicles(
    db: Session,
    user_id: UUID
):
    return db.query(Vehicle).filter(Vehicle.user_id == user_id).all()

def create_vehicle(
    db: Session,
    vehicle: VehicleCreate,
    user_id: UUID
):
    db_vehicle = Vehicle(
        **vehicle.model_dump(),
        user_id = user_id
    )

    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)

    return db_vehicle

def update_vehicle(
    db: Session,
    vehicle: VehicleUpdate,
    db_vehicle: Vehicle
):
    update_data = vehicle.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_vehicle, key, value)

    db.commit()
    db.refresh(db_vehicle)

    return db_vehicle

def delete_vehicle(db: Session, db_vehicle: Vehicle):
    db.delete(db_vehicle)
    db.commit()
    return True

def set_primary_vehicle(db: Session, vehicle_id: UUID, user_id: UUID):
    # First set all vehicles of this user to is_primary = False
    db.query(Vehicle).filter(Vehicle.user_id == user_id).update({"is_primary": False})
    
    # Then set the selected vehicle to is_primary = True
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == user_id).first()
    if db_vehicle:
        db_vehicle.is_primary = True
    
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle