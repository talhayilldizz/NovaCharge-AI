import openai
import json
import os
from app.schemas.ai_schema import AIRouteAnalysisRequest, AIRouteAnalysisResponse, ChargingStop
from app.database.session import SessionLocal
from app.models.operator_tariff import OperatorTariff

def analyze_route_with_ai(
    request: AIRouteAnalysisRequest
) -> AIRouteAnalysisResponse:

    api_key = os.getenv("OPENAI_API_KEY","")

    if not api_key:
        raise Exception("API Anahtarı yok!")
    
    #güncel sarj tarifelerini aldım
    db = SessionLocal()
    tariffs = db.query(OperatorTariff).all()
    db.close()

    tariff_text = "Güncel İstasyon Fiyatları (TL/kWh):\n"

    for t in tariffs:
        tariff_text += f"- {t.operator_name}: AC {t.ac_price_per_kwh} TL, DC {t.dc_price_per_kwh} TL\n"

    system_prompt = f"""
        Sen uzman bir Elektrikli Araç (EV) Rota Planlama Asistanısın.
        Kullanıcı sana rota detaylarını, aracının mevcut şarjını ve rotadaki istasyonları verecek.

        KURALLAR VE HESAPLAMA MANTIĞI:
        1. Araç tüketimi ortalama 18 kWh / 100 km olarak varsayılır (eğer özel bilgi yoksa).
        2. Tüketilecek toplam enerji = (Mesafe / 100) * 18
        3. Aracın mevcut şarj yüzdesini ve batarya kapasitesini (kWh) dikkate al. Yola %100 yerine kullanıcının girdiği şarjla çıkacak. Buna göre yolda alınması gereken net enerjiyi hesapla.
        4. Hedefe ulaşmak için yolda ne kadar şarj alman gerekiyorsa, bunu sana verilen rotadaki uygun istasyonlardan (mümkünse DC - hızlı şarj olanlardan) seç.
        5. Şarj maliyetini, seçtiğin istasyon markasının tarifesine (DC fiyatına) göre tam hesapla.
        6. Hızlı (DC) şarjın dakikada yaklaşık 1.5 kWh enerji verdiğini varsay ve zaman kaybını buna göre hesapla.
        7. Yanıtını KESİNLİKLE aşağıdaki JSON formatında döndür:
        {{
        "total_cost": 450.5,
        "total_time_lost": 45,
        "charging_stops": [
            {{
            "station_name": "ZES - xyz AVM",
            "charging_time_mins": 25,
            "estimated_cost_try": 250.0
            }}
        ],
        "general_recommendations": [
            "Aracınızın mevcut şarjı düşük olduğu için yola çıkar çıkmaz ilk mola noktasına uğrayın."
        ]
        }}
        {tariff_text}
    """

    stations_text = ", ".join([f"{s.name} ({'DC' if s.is_fast_charge else 'AC'})" for s in request.stations_on_route])

    
    user_prompt = f"""
        Rota: {request.start_point} -> {request.end_point}
        Mesafe: {request.total_distance_km} km
        Süre: {request.total_duration_mins} dakika
        Araç Modeli: {request.vehicle_model or 'Bilinmiyor'}
        Batarya Kapasitesi: {request.battery_capacity_kwh or 60} kWh
        Menzil: {request.range_km or 350} km
        Mevcut Şarj: %{request.current_battery_percentage or 100}
        Rotadaki İstasyonlar: {stations_text}
    """

    client = openai.OpenAI(api_key=api_key)

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role":"user",
                    "content":user_prompt
                }
            ],
            response_format={
                "type":"json_object"
            }
        )

        result_json = json.loads(response.choices[0].message.content)
        stops = [
            ChargingStop(**stop) for stop in result_json.get("charging_stops",[])
        ]

        return AIRouteAnalysisResponse(
            total_cost = float(result_json.get("total_cost",0.0)),
            total_time_lost=int(result_json.get("total_time_lost",0)),
            charging_stops=stops,
            general_recommendations=result_json.get("general_recommendations", [])
        )
    
    except Exception as e:
        raise Exception(f"AI Analiz Hatası: {str(e)}")
