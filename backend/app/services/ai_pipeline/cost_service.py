from typing import List

def calculate_time_and_cost(ai_selected_stations: List[dict], missing_energy_kwh: float, tariff_dict: dict) -> dict:
    """
    AI'ın seçtiği istasyonlar üzerinden standart hızlara göre süre, 
    ve veritabanı tarifelerine göre gerçek maliyet hesabı yapar.
    """
    if not ai_selected_stations:
        return {"total_cost": 0.0, "total_time": 0, "charging_stops": []}
        
    # Eksik enerjiyi seçilen duraklara eşit bölelim
    energy_per_stop = missing_energy_kwh / len(ai_selected_stations)
    
    total_cost = 0.0
    total_time = 0
    charging_stops = []
    
    for stop in ai_selected_stations:
        
        charging_power_kw = 100.0 if stop.get("is_fast_charge") else 22.0
        
       
        charging_time_hours = energy_per_stop / charging_power_kw
        charging_time_mins = int(charging_time_hours * 60)
        
        
        operator_name = stop.get("name", "").split("-")[0].strip().upper()
        
        operator_tariff = tariff_dict.get(operator_name, {"ac": 8.0, "dc": 10.0})
        price_per_kwh = operator_tariff["dc"] if stop.get("is_fast_charge") else operator_tariff["ac"]
        
        cost = round(energy_per_stop * price_per_kwh, 2)
        
        total_time += charging_time_mins
        total_cost += cost
        
        charging_stops.append({
            "station_name": stop["name"],
            "charging_time_mins": charging_time_mins,
            "estimated_cost_try": cost,
            "reason": stop.get("ai_reason", "") 
        })
        
    return {
        "total_cost": round(total_cost, 2),
        "total_time": total_time,
        "charging_stops": charging_stops
    }
