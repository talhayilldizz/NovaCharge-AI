from typing import List
from app.schemas.ai_schema import AIRouteAnalysisRequest, AIRouteAnalysisResponse, ChargingStop
from app.database.session import SessionLocal
from app.models.operator_tariff import OperatorTariff

from app.services.ai_pipeline.battery_service import calculate_energy_needs
from app.services.ai_pipeline.route_service import get_stations_along_route
from app.services.ai_pipeline.station_ranking_service import rank_and_select_candidates
from app.services.ai_pipeline.cost_service import calculate_charging_cost, calculate_charging_time_mins, get_power_kw
from app.services.ai_pipeline.ai_recommendation_service import get_ai_recommendation

def analyze_route_with_ai(request: AIRouteAnalysisRequest) -> AIRouteAnalysisResponse:
    # 1. Batarya ve Enerji Hesaplaması
    battery_status = calculate_energy_needs(
        total_distance_km=request.total_distance_km,
        battery_capacity_kwh=request.battery_capacity_kwh or 60.0,
        current_battery_percentage=request.current_battery_percentage or 100
    )
    
    # Şarja gerek yoksa direkt dön
    if not battery_status["is_charge_needed"]:
        return AIRouteAnalysisResponse(
            total_cost=0.0,
            total_time_lost=0,
            charging_stops=[],
            general_recommendations=[
                "Mevcut şarjınız hedefe ulaşmak için fazlasıyla yeterli.",
                "Yolculuğunuz boyunca şarj istasyonunda durmanıza gerek yoktur."
            ]
        )
        
    db = SessionLocal()
    try:
        # 2. Rota Üzerindeki İstasyonları Bul
        stations = get_stations_along_route(db, request.route_coordinates, max_distance_m=5000.0)
        
        # 3. İstasyonları Puanla ve Adayları Seç
        candidates = rank_and_select_candidates(
            stations=stations,
            total_distance_km=request.total_distance_km,
            missing_energy_kwh=battery_status["missing_energy"],
            ideal_stop_distances=battery_status.get("ideal_stop_distances", [])
        )
        
        if not candidates:
            return AIRouteAnalysisResponse(
                total_cost=0.0,
                total_time_lost=0,
                charging_stops=[],
                general_recommendations=["Rotanız üzerinde uygun şarj istasyonu bulunamadı!"]
            )
            
        # 4. Adayları Yapay Zekaya Gönder ve Seçim Yaptır
        ai_response = get_ai_recommendation(
            candidates=candidates, 
            missing_energy_kwh=battery_status["missing_energy"],
            required_stops_count=battery_status.get("required_stops_count", 1)
        )
        
        # 5. Yapay Zekanın Seçtiği İstasyonlar İçin Maliyet ve Süre Hesapla
        tariffs = db.query(OperatorTariff).all()
        tariff_dict = {t.operator_name.upper(): {"ac": t.ac_price_per_kwh, "dc": t.dc_price_per_kwh} for t in tariffs}
        
        selected_stops = []
        total_cost = 0.0
        total_time = 0
        
        selected_stations_list = ai_response.get("selected_stations", [])
        
        # AI'ın seçtiği istasyonları aday listemizle eşleştir
        for ai_stop in selected_stations_list:
            st_id = ai_stop.get("station_id")
            
            # Aday listesinde bu id'yi bul
            matched_station = next((c for c in candidates if c["id"] == st_id), None)
            if not matched_station:
                continue
                
            # Eğer enerji birden fazla istasyona bölünmüşse eşit böl.
            # Yoksa eksik enerjinin tamamını hesapla
            amount_to_charge = battery_status["missing_energy"] / max(1, len(selected_stations_list))
            
            operator_name = matched_station["name"].split("-")[0].strip().upper()
            price_per_kwh = 10.0
            if operator_name in tariff_dict:
                 price_per_kwh = tariff_dict[operator_name]["dc"] if matched_station["is_fast_charge"] else tariff_dict[operator_name]["ac"]
            elif "EŞARJ" in operator_name or "ESARJ" in operator_name:
                 price_per_kwh = tariff_dict.get("EŞARJ", {}).get("dc", 10.0)
                 
            cost = calculate_charging_cost(amount_to_charge, price_per_kwh)
            power_kw = get_power_kw(matched_station["is_fast_charge"])
            time_mins = calculate_charging_time_mins(amount_to_charge, power_kw)
            
            total_cost += cost
            total_time += time_mins
            
            selected_stops.append(ChargingStop(
                station_name=matched_station["name"],
                charging_time_mins=time_mins,
                estimated_cost_try=cost
            ))
            
        return AIRouteAnalysisResponse(
            total_cost=round(total_cost, 2),
            total_time_lost=total_time,
            charging_stops=selected_stops,
            general_recommendations=ai_response.get("general_recommendations", [])
        )
        
    finally:
        db.close()
