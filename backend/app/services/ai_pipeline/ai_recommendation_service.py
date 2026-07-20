import openai
import json
import os
from typing import List

def get_ai_recommendation(candidates: List[dict], missing_energy_kwh: float, required_stops_count: int) -> dict:
    """
    Sadece en iyi adayları GPT'ye gönderir ve tam olarak gereken sayıda istasyonu seçmesini ister.
    Matematik, süre ve maliyet GPT'den istenmez. Sadece 'Neden' bu istasyonları seçtiğini açıklaması beklenir.
    """
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        raise Exception("API Anahtarı yok!")

    # Adayları JSON metnine çeviriyoruz (Daha net okuması için)
    candidates_text = json.dumps([{
        "station_id": c["id"],
        "name": c["name"],
        "target_ideal_km": c.get("target_ideal_km"),
        "distance_from_start_km": round(c["distance_from_start_km"], 1),
        "distance_to_route_m": round(c["distance_to_route_m"], 0),
        "is_fast_charge": c["is_fast_charge"]
    } for c in candidates], indent=2, ensure_ascii=False)

    system_prompt = f"""
    Sen bir Elektrikli Araç (EV) Şarj Planlama asistanısın. 
    Aşağıda sana önceden hesaplanmış ve puanlanmış, rotaya en uygun aday şarj istasyonlarının bir listesi verilecek.

    GÖREVİN:
    1. Bu rota için matematiksel olarak TAM OLARAK {required_stops_count} ADET mola noktası seçmelisin.
    2. Adaylar listesinde her istasyonun "target_ideal_km" (olması gereken ideal konum) değeri vardır. 
       Farklı ideal km hedeflerine uyan en iyi {required_stops_count} istasyonu seçerek rotaya dağıt.
    3. HİÇBİR MATEMATİKSEL HESAPLAMA YAPMA (Maliyet, Süre vb.). Sadece "station_id" ve seçim "reason" (neden) değerlerini döndür.

    YANIT FORMATI KESİNLİKLE AŞAĞIDAKİ GİBİ OLMALIDIR (Sadece JSON):
    {{
      "selected_stations": [
        {{
          "station_id": "uuid-buraya-gelecek",
          "reason": "120 kW hızlı şarj imkanı sunduğu ve rotadan sadece 45 metre sapma gerektirdiği için 1. mola noktası olarak seçildi."
        }}
      ],
      "general_recommendations": [
        "İlk mola noktasında aracınızı %80'e kadar şarj etmeniz önerilir."
      ]
    }}
    """

    user_prompt = f"""
    Seçilmesi Gereken İstasyon Sayısı: {required_stops_count}
    İhtiyaç Duyulan Ekstra Enerji: {round(missing_energy_kwh, 1)} kWh
    
    Aday İstasyonlar:
    {candidates_text}
    """

    client = openai.OpenAI(api_key=api_key)

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )

        return json.loads(response.choices[0].message.content)
    except Exception as e:
        raise Exception(f"AI Öneri Hatası: {str(e)}")
