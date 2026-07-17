from sqlalchemy.orm import Session
from uuid import UUID
from app.models.favorite_station import FavoriteStation
from app.schemas.favorite_station_schema import FavoriteStationCreate, FavoriteStationUpdate

def add_favorite_station(db: Session, favorite: FavoriteStationCreate, user_id: UUID):
    db_favorite = FavoriteStation(
        user_id=user_id,
        external_station_id=favorite.external_station_id,
        custom_name=favorite.custom_name
    )
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    return db_favorite

def get_user_favorite_stations(db: Session, user_id: UUID):
    return db.query(FavoriteStation).filter(FavoriteStation.user_id == user_id).all()

def get_favorite_station_by_id(db: Session, favorite_id: UUID):
    return db.query(FavoriteStation).filter(FavoriteStation.id == favorite_id).first()

def get_favorite_by_external_id(db: Session, user_id: UUID, external_station_id: str):
    return db.query(FavoriteStation).filter(
        FavoriteStation.user_id == user_id,
        FavoriteStation.external_station_id == external_station_id
    ).first()

def update_favorite_station(db: Session, db_favorite: FavoriteStation, favorite_update: FavoriteStationUpdate):
    if favorite_update.custom_name is not None:
        db_favorite.custom_name = favorite_update.custom_name
    
    db.commit()
    db.refresh(db_favorite)
    return db_favorite

def remove_favorite_station(db: Session, db_favorite: FavoriteStation):
    db.delete(db_favorite)
    db.commit()
