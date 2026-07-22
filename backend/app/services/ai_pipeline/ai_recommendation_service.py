import openai
import json
import os
import json
import openai
from typing import List

def get_ai_recommendation(
    candidates: List[dict],
    required_stops_count: int
) -> dict:

    api_key = os.getenv("OPENAI_API_KEY","")

    if not api_key:
        raise Exception("Apı Anahtarı Bulunamadı..")

    candidates_text = json.dumps([{
        "station_id" : c["id"],
        "name":c["name"],
        "target_ideal_km":c.get("target_ideal_km"),
        "distance_from_start_km" : round(c.get("distance_from_start_km", 0), 1),
        "distance_to_route_m": round(c.get("distance_to_route_m", 0), 0),
        "is_fast_charge": c.get("is_fast_charge", False)
    } for c in candidates], indent=2, ensure_ascii=False)

    system_prompt = f"""
        Sen bir Elektrikli Araç (EV) Şarj Planlama asistanısın. 
        Aşağıda sana önceden hesaplanmış, rotaya en uygun aday şarj istasyonlarının bir listesi verilecek.
        GÖREVİN:
        1. Bu rota için matematiksel olarak TAM OLARAK {required_stops_count} ADET mola noktası seçmelisin.
        2. Adaylar listesinde her istasyonun "target_ideal_km" değeri vardır. Farklı "target_ideal_km" hedeflerine uyan istasyonlardan HER BİR HEDEF İÇİN YALNIZCA BİR TANE seç.
        3. KESİNLİKLE aynı bölgede, birbirine çok yakın (aynı "target_ideal_km" veya aralarında 50 km'den az mesafe olan) iki istasyonu peş peşe SEÇME. Mantıklı bir seyahat için molaların arası açık olmalıdır.
        4. HİÇBİR MATEMATİKSEL HESAPLAMA YAPMA (Maliyet, Süre vb.). Sadece "station_id" ve seçim "reason" (neden) değerlerini döndür.
        YANIT FORMATI KESİNLİKLE AŞAĞIDAKİ GİBİ OLMALIDIR (Sadece JSON):
        {{
        "selected_stations": [
            {{
            "station_id": "uuid-buraya",
            "reason": "100 kW hızlı şarj imkanı sunduğu ve rotadan sapma gerektirmediği için 1. mola noktası olarak seçildi."
            }}
        ],
        "general_recommendations": [
            "İlk mola noktasında aracınızı %80'e kadar şarj etmeniz önerilir."
        ]
        }}
    """


    user_prompt = f"""
        Seçilmesi Gereken İstasyon Sayısı: {required_stops_count}
        Aday İstasyonlar:
        {candidates_text}
    """

    client = openai.OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages = [
            {
                "role":"system",
                "content":system_prompt
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

    return json.loads(response.choices[0].message.content)