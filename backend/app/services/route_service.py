from sqlalchemy.orm import Session
from uuid import UUID
from app.models.route import Route
from app.schemas.route_schema import RouteCreate

def get_route_by_id(db: Session, route_id: UUID):
    return db.query(Route).filter(Route.id == route_id).first()

def get_user_routes(db: Session, user_id: UUID):
    """Kullanıcının geçmişte oluşturduğu tüm rotaları listeler"""
    return db.query(Route).filter(Route.user_id == user_id).all()

def create_route(
    db: Session, 
    route: RouteCreate, 
    user_id: UUID
):
    start_wkt = f"SRID=4326;POINT({route.start_lon} {route.start_lat})"
    end_wkt = f"SRID=4326;POINT({route.end_lon} {route.end_lat})"
    
    db_route = Route(
        user_id=user_id,
        vehicle_id=route.vehicle_id,
        start_location=start_wkt,
        end_location=end_wkt,
        total_distance_km=route.total_distance_km,
        total_duration_mins=route.total_duration_mins
    )
    
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

def delete_route(db: Session, db_route: Route):
    db.delete(db_route)
    db.commit()
    return True
