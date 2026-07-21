from app.schemas.ai_schema import AIRouteAnalysisRequest, AIRouteAnalysisResponse, ChargingStop
from app.database.session import SessionLocal
from app.models.operator_tariff import OperatorTariff
from app.models.station import Station

from app.services.ai_pipeline.battery_service import calculate_energy_needs
from app.services.ai_pipeline.route_service import analyze_stations_on_route
from app.services.ai_pipeline.station_ranking_service import rank_and_select_candidates
from app.services.ai_pipeline.ai_recommendation_service import get_ai_recommendation
from app.services.ai_pipeline.cost_service import calculate_time_and_cost

def analyze_route_with_ai(request: AIRouteAnalysisRequest) -> AIRouteAnalysisResponse:
    # 1. Batarya ve Menzil Analizi
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
        # Veritabanından tüm istasyonları çek
        all_stations_db = db.query(Station).all()
        stations = [
            {
                "id": str(s.id),
                "name": s.name,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "is_fast_charge": s.is_fast_charge,
            }
            for s in all_stations_db
        ]
        
        # 2. Rotaya Göre İstasyonları Analiz Et (Mesafe ve Kilometre)
        analyzed_stations = analyze_stations_on_route(
            route_coordinates=request.route_coordinates,
            total_distance_km=request.total_distance_km,
            stations=stations
        )
        
        # 3. İdeal Noktalara Göre Adayları Sırala ve Seç
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
            
        # 4. GPT'ye Seçim Yaptır (Sadece Karar Aşaması)
        try:
            ai_response = get_ai_recommendation(
                candidates=candidates,
                required_stops_count=battery_status["required_stops_count"]
            )
        except Exception as e:
            ai_response = {"selected_stations": [{"station_id": c["id"], "reason": "AI sunucusuna ulaşılamadığı için algoritmik olarak en ideal nokta seçildi."} for c in candidates[:battery_status["required_stops_count"]]]}
        
        # AI'dan dönen ID'leri kendi aday listemizle eşleştir
        selected_candidates = []
        for ai_stop in ai_response.get("selected_stations", []):
            st_id = ai_stop.get("station_id")
            reason = ai_stop.get("reason", "")
            
            matched = next((c for c in candidates if c["id"] == st_id), None)
            if matched:
                matched["ai_reason"] = reason
                selected_candidates.append(matched)

        # AI saçmalayıp (Halüsinasyon) olmayan bir ID döndüyse güvenlik önlemi:
        if not selected_candidates:
            selected_candidates = candidates[:battery_status["required_stops_count"]]

        # Maliyet ve Süre Hesapla (Kesin Matematik)
        tariffs = db.query(OperatorTariff).all()
        tariff_dict = {t.operator_name.upper(): {"ac": t.ac_price_per_kwh, "dc": t.dc_price_per_kwh} for t in tariffs}
        
        cost_data = calculate_time_and_cost(
            ai_selected_stations=selected_candidates,
            missing_energy_kwh=battery_status["missing_energy"],
            tariff_dict=tariff_dict
        )
        
        # Tavsiyeleri oluştur
        general_recs = ai_response.get("general_recommendations", [])
        if not general_recs:
            general_recs.append(f"Toplamda {battery_status['required_stops_count']} kez mola vermeniz gerekiyor.")
            general_recs.append(f"Mola noktalarında aracınızı %80'e kadar şarj etmeniz menzil sağlığınız için idealdir.")

        return AIRouteAnalysisResponse(
            total_cost=cost_data["total_cost"],
            total_time_lost=cost_data["total_time"],
            charging_stops=[ChargingStop(**s) for s in cost_data["charging_stops"]],
            general_recommendations=general_recs
        )
    finally:
        db.close()
