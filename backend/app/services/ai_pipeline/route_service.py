from shapely.geometry import LineString, Point
from geopy.distance import geodesic
from typing import List

def analyze_stations_on_route(
    route_coordinates: List[List[float]],
    total_distance_km: float,
    stations:List[dict]
) -> List[dict]:

    if not route_coordinates or not stations:
        return []
    

    route_line = LineString(route_coordinates)

    analyzed_stations = []
    for st in stations:
        st_point = Point(
            st["latitude"],
            st["longitude"]
        )

        closest_point_on_line = route_line.interpolate(route_line.project(st_point))

        distance_to_route_m = geodesic(
            (st["latitude"], st["longitude"]),
            (closest_point_on_line.x, closest_point_on_line.y)
        ).meters

        route_fraction = route_line.project(
            st_point,
            normalized=True
        )

        distance_from_start_km = route_fraction * total_distance_km

        st_copy = st.copy()
        st_copy["distance_to_route_m"] = distance_to_route_m
        st_copy["distance_from_start_km"] = distance_from_start_km
        analyzed_stations.append(st_copy)
    
    return analyzed_stations
