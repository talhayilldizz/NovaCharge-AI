from typing import List

def rank_and_select_candidates(stations: List[dict], total_distance_km: float, missing_energy_kwh: float, ideal_stop_distances: List[float] = None) -> List[dict]:
    """
    İdeal mola noktalarına (km) en yakın olan ve kriterleri sağlayan istasyonları seçer.
    """
    if not stations or not ideal_stop_distances:
        return []

    top_candidates = []
    
    # Her ideal mola noktası (km) için en iyi 3 adayı bulalım
    for ideal_km in ideal_stop_distances:
        scored_stations = []
        for st in stations:
            score = 100.0
            
            # 1. Rotaya Uzaklık Puanı (Her 100m sapma için 1 puan kır)
            score -= (st["distance_to_route_m"] / 100.0)
            
            # 2. Şarj Hızı Puanı (Hızlı şarj hayati önem taşır)
            if st["is_fast_charge"]:
                score += 50.0
                
            # 3. İdeal Mola Noktasına Yakınlık Puanı
            # İdeal km'den ne kadar saparsa o kadar ceza alır (Her 1 km sapma için 1 puan kır)
            distance_diff_km = abs(st["distance_from_start_km"] - ideal_km)
            score -= distance_diff_km * 1.5
            
            # Aşırı erken veya aşırı geç durmayı engelle (İdeal km'den 50km'den fazla sapmışsa listeye alma)
            if distance_diff_km > 50:
                continue
                
            st_copy = st.copy()
            st_copy["score"] = score
            st_copy["target_ideal_km"] = round(ideal_km, 1)
            scored_stations.append(st_copy)
            
        # Bu ideal mola için en iyi olanları yüksekten düşüğe sırala
        scored_stations.sort(key=lambda x: x["score"], reverse=True)
        
        # En iyi 2-3 adayı ekle (Daha önceden eklenmiş olanları tekrar eklememek için kontrol edebiliriz)
        for candidate in scored_stations[:3]:
            if not any(c["id"] == candidate["id"] for c in top_candidates):
                top_candidates.append(candidate)
                
    return top_candidates
