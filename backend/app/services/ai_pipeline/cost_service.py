from typing import List

def calculate_time_and_cost(ai_selected_stations: List[dict], missing_energy_kwh: float, tariff_dict: dict) -> dict:
    """
    AI'ın seçtiği istasyonlar üzerinden standart hızlara göre süre, 
    ve veritabanı tarifelerine göre gerçek maliyet hesabı yapar.
    """
    if not ai_selected_stations:
        return {"total_cost": 0.0, "total_time": 0, "charging_stops": []}
        
    sorted_stops = sorted(ai_selected_stations, key=lambda x: x.get("distance_from_start_km", 0))
    
    segments = []
    prev_km = 0
    for stop in sorted_stops:
        dist = stop.get("distance_from_start_km", 0) - prev_km
        segments.append(dist if dist > 0 else 50)
        prev_km = stop.get("distance_from_start_km", 0)
        
    total_segments = sum(segments)
    if total_segments <= 0:
        total_segments = 1
        
    total_cost = 0.0
    total_time = 0
    charging_stops = []
    
    for i, stop in enumerate(sorted_stops):
        energy_for_this_stop = missing_energy_kwh * (segments[i] / total_segments)
        
        if energy_for_this_stop < 10:
            energy_for_this_stop = 10.0
            
        charging_power_kw = 100.0 if stop.get("is_fast_charge") else 22.0
        
        charging_time_hours = energy_for_this_stop / charging_power_kw
        charging_time_mins = int(charging_time_hours * 60)
        if charging_time_mins < 5:
            charging_time_mins = 5
            
        operator_name = stop.get("brand", "").strip().upper()
        
        operator_tariff = tariff_dict.get(operator_name, {"ac": 8.0, "dc": 10.0})
        if "TESLA" in operator_name:
            operator_tariff = {"ac": 8.5, "dc": 9.4}
        elif "SHARZ" in operator_name:
            operator_tariff = {"ac": 8.0, "dc": 9.5}
        elif "WAT" in operator_name:
            operator_tariff = {"ac": 8.2, "dc": 9.8}
            
        price_per_kwh = operator_tariff["dc"] if stop.get("is_fast_charge") else operator_tariff["ac"]
        
        cost = round(energy_for_this_stop * price_per_kwh, 2)
        
        total_time += charging_time_mins
        total_cost += cost
        
        charging_stops.append({
            "station_name": stop["name"],
            "latitude": stop.get("latitude"),
            "longitude": stop.get("longitude"),
            "charging_time_mins": charging_time_mins,
            "estimated_cost_try": cost,
            "reason": stop.get("ai_reason", "") 
        })
        
    return {
        "total_cost": round(total_cost, 2),
        "total_time": total_time,
        "charging_stops": charging_stops
    }
