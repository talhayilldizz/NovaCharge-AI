from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from uuid import UUID
from app.models.station import Station, StationSocket
from app.schemas.station_schema import StationCreate, StationUpdate

def get_station_by_id(
    db: Session,
    station_id: UUID
):
    return db.query(Station).options(
        joinedload(Station.sockets),
        joinedload(Station.reviews)
    ).filter(Station.id == station_id).first()


def get_nearby_stations(
    db:Session,
    lat: float,
    lon: float,
    radius_km: float = 10.0
):
    radius_degrees = radius_km / 111.0

    user_point = f"SRID=4326;POINT({lon} {lat})"

    return db.query(Station).options(
        joinedload(Station.sockets),
        joinedload(Station.reviews)
    ).filter(
        func.ST_DWithin(
            Station.location,
            user_point,
            radius_degrees
        )
    ).all()

def get_all_stations(
    db: Session,
    limit: int = 50
):
    return db.query(Station).options(
        joinedload(Station.sockets),
        joinedload(Station.reviews)
    ).limit(limit).all()

def get_lightweight_stations(
    db: Session,
    limit: int = 20000
):
    # Select only required fields to minimize memory and network usage
    return db.query(
        Station.id,
        Station.name,
        Station.brand,
        Station.latitude,
        Station.longitude,
        Station.is_fast_charge,
        Station.total_sockets
    ).limit(limit).all()

def create_station(
    db: Session,
    station: StationCreate
):
    point_wkt = f"SRID=4326;POINT({station.longitude} {station.latitude})"

    db_station = Station(
        **station.model_dump(),
        location = point_wkt
    )

    db.add(db_station)
    db.commit()
    db.refresh(db_station)

    return db_station

def update_station(
    db: Session,
    db_station: Station,
    station_update: StationUpdate
):
    update_data = station_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_station, key, value)

    if "latitude" in update_data or "longitude" in update_data:
        new_lat = db_station.latitude
        new_lon = db_station.longitude

        db_station.location = f"SRID=4326;POINT({new_lon} {new_lat})"
    

    db.commit()
    db.refresh(db_station)
    return db_station


def delete_station(db: Session, db_station: Station):
    db.delete(db_station)
    db.commit()
    return True