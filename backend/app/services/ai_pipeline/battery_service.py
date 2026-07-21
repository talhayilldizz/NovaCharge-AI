def calculate_energy_needs(total_distance_km: float, battery_capacity_kwh: float, current_battery_percentage: int) -> dict:
    """
    Hesaplamaları yapar ve ihtiyaç duyulan enerjiyi, mola sayısını ve ideal mola km'lerini döndürür.
    """
    consumption_rate = 18.0  # Standart Ortalama 18 kWh / 100 km
    needed_energy = (total_distance_km / 100.0) * consumption_rate
    
    current_charge_pct = current_battery_percentage or 100
    battery_capacity = battery_capacity_kwh or 60.0
    current_energy = (current_charge_pct / 100.0) * battery_capacity
    
    
    missing_energy = max(0.0, needed_energy - current_energy + 6.0) 
    
    is_charge_needed = missing_energy > 0
    ideal_stop_distances = []
    
    if is_charge_needed:
        
        usable_first_leg_energy = current_energy - (battery_capacity * 0.15)
        first_stop_km = max(50.0, (usable_first_leg_energy / consumption_rate) * 100.0)
        
        
        usable_middle_leg_energy = battery_capacity * 0.65  # %80'den %15'e düşene kadar (65%)
        middle_leg_km = (usable_middle_leg_energy / consumption_rate) * 100.0
        
        current_stop_km = first_stop_km
        while current_stop_km < total_distance_km - 30: # Hedefe 30km kala mola vermeye gerek yok
            ideal_stop_distances.append(current_stop_km)
            current_stop_km += middle_leg_km
            
    return {
        "needed_energy": needed_energy,
        "current_energy": current_energy,
        "missing_energy": missing_energy,
        "is_charge_needed": is_charge_needed,
        "required_stops_count": len(ideal_stop_distances),
        "ideal_stop_distances": ideal_stop_distances
    }
