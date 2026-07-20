from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from app.models.station import Station
import json

def get_stations_along_route(db: Session, route_coordinates: List[List[float]], max_distance_m: float = 5000.0) -> List[dict]:
    """
    Verilen rota koordinatlarına (polyline) en fazla max_distance_m (örn: 5000m) uzaklıktaki 
    istasyonları bulur ve başlangıç noktasından uzaklıklarını hesaplar.
    
    route_coordinates: [[lat, lon], [lat, lon], ...]
    """
    if not route_coordinates or len(route_coordinates) < 2:
        return []
        
    # Koordinatları PostGIS LineString formatına dönüştür (Lon, Lat sırasıyla!)
    # Shapely/PostGIS varsayılan olarak X=Lon, Y=Lat kullanır.
    linestring_coords = ", ".join([f"{coord[1]} {coord[0]}" for coord in route_coordinates])
    linestring_wkt = f"SRID=4326;LINESTRING({linestring_coords})"
    
    # Rota çizgisini geography tipine çeviriyoruz ki metre cinsinden mesafe hesaplayabilelim.
    route_geom = func.ST_GeomFromEWKT(linestring_wkt)
    route_geog = func.ST_GeographyFromText(func.ST_AsText(route_geom))

    # Rotaya 5 km'den yakın olan istasyonları filtrele
    # ST_DWithin geography tiplerinde metre cinsinden çalışır.
    stations = db.query(
        Station,
        func.ST_Distance(
            func.ST_GeographyFromText(func.ST_AsText(Station.location)),
            route_geog
        ).label("distance_to_route_m"),
        func.ST_LineLocatePoint(
            route_geom,
            Station.location
        ).label("fraction_along_route")
    ).filter(
        func.ST_DWithin(
            func.ST_GeographyFromText(func.ST_AsText(Station.location)),
            route_geog,
            max_distance_m
        )
    ).all()
    
    # Toplam rotanın uzunluğunu hesapla
    total_length_m = db.query(func.ST_Length(route_geog)).scalar() or 1.0
    
    results = []
    for st, dist_to_route, fraction in stations:
        dist_from_start_km = (fraction * total_length_m) / 1000.0
        
        results.append({
            "id": str(st.id),
            "name": st.name,
            "latitude": st.latitude,
            "longitude": st.longitude,
            "is_fast_charge": st.is_fast_charge,
            "distance_to_route_m": float(dist_to_route),
            "distance_from_start_km": float(dist_from_start_km)
        })
        
    return results
