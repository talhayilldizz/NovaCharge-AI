from app.schemas.ai_schema import AIRouteAnalysisRequest, AIRouteAnalysisResponse, ChargingStop
from app.database.session import SessionLocal
from app.models.operator_tariff import OperatorTariff
from app.models.station import Station
from app.services import station_service

from app.services.ai_pipeline.battery_service import calculate_energy_needs
from app.services.ai_pipeline.route_service import analyze_stations_on_route
from app.services.ai_pipeline.station_ranking_service import rank_and_select_candidates
from app.services.ai_pipeline.ai_recommendation_service import get_ai_recommendation
from app.services.ai_pipeline.cost_service import calculate_time_and_cost

def analyze_route_with_ai(request: AIRouteAnalysisRequest) -> AIRouteAnalysisResponse:
    battery_status = calculate_energy_needs(
        total_distance_km=request.total_distance_km,
        battery_capacity_kwh=request.battery_capacity_kwh,
        current_battery_percentage=request.current_battery_percentage
    )
    
    if not battery_status["is_charge_needed"]:
        return AIRouteAnalysisResponse(
            total_cost=0.0,
            total_time_lost=0,
            charging_stops=[],
            general_recommendations=[
                "Mevcut şarjınız hedefe ulaşmak için yeterlidir.",
                "Yolculuğunuz boyunca şarj istasyonunda durmanıza gerek yoktur."
            ]
        )

    db = SessionLocal()
    try:
        all_stations_db = station_service.get_lightweight_stations(db=db, limit=20000)
        stations = [
            {
                "id": str(s[0]),
                "name": s[1],
                "brand": s[2],
                "latitude": s[3],
                "longitude": s[4],
                "is_fast_charge": s[5],
            }
            for s in all_stations_db
        ]
        
        analyzed_stations = analyze_stations_on_route(
            route_coordinates=request.route_coordinates,
            total_distance_km=request.total_distance_km,
            stations=stations
        )
        
        
        candidates = rank_and_select_candidates(
            stations=analyzed_stations,
            ideal_stop_distances=battery_status["ideal_stop_distances"]
        )
        
        if not candidates:
            return AIRouteAnalysisResponse(
                total_cost=0.0,
                total_time_lost=0,
                charging_stops=[],
                general_recommendations=["Rotanız üzerinde uygun bir şarj istasyonu bulunamadı! Lütfen rotanızı değiştirin."]
            )
            
        try:
            ai_response = get_ai_recommendation(
                candidates=candidates,
                required_stops_count=battery_status["required_stops_count"]
            )
        except Exception as e:
            ai_response = {"selected_stations": []} 
        
        selected_candidates = []
        for ai_stop in ai_response.get("selected_stations", []):
            st_id = ai_stop.get("station_id")
            reason = ai_stop.get("reason", "")
            
            matched = next((c for c in candidates if c["id"] == st_id), None)
            if matched:
                matched["ai_reason"] = reason
                selected_candidates.append(matched)

        unique_targets = set([c["target_ideal_km"] for c in selected_candidates])
        if len(selected_candidates) < battery_status["required_stops_count"] or len(unique_targets) < len(selected_candidates):
            selected_candidates = []
            seen_ideals = set()
            for c in candidates:
                if c["target_ideal_km"] not in seen_ideals:
                    selected_candidates.append(c)
                    seen_ideals.add(c["target_ideal_km"])
                    if len(selected_candidates) == battery_status["required_stops_count"]:
                        break

        tariffs = db.query(OperatorTariff).all()
        tariff_dict = {t.operator_name.upper(): {"ac": t.ac_price_per_kwh, "dc": t.dc_price_per_kwh} for t in tariffs}
        
        cost_data = calculate_time_and_cost(
            ai_selected_stations=selected_candidates,
            missing_energy_kwh=battery_status["missing_energy"],
            tariff_dict=tariff_dict
        )
        
        general_recs = ai_response.get("general_recommendations", [])
        if not general_recs:
            general_recs.append(f"Toplamda {battery_status['required_stops_count']} kez mola vermeniz gerekiyor.")
            general_recs.append(f"Mola noktalarında aracınızı %80'e kadar şarj etmeniz menzil sağlığınız için idealdir.")

        if len(selected_candidates) < battery_status["required_stops_count"]:
            general_recs.append("⚠️ UYARI: Rotanız üzerinde yeterli sayıda şarj istasyonu bulunamadığı için eksik mola noktası planlandı. Yolda kalma riskiniz var, lütfen seyahatinizi dikkatli planlayın!")

        return AIRouteAnalysisResponse(
            total_cost=cost_data["total_cost"],
            total_time_lost=cost_data["total_time"],
            charging_stops=[ChargingStop(**s) for s in cost_data["charging_stops"]],
            general_recommendations=general_recs
        )
    finally:
        db.close()
