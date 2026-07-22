from typing import List

def rank_and_select_candidates(
    stations: List[dict], 
    ideal_stop_distances: List[float]
) -> List[dict]:

    if not stations or not ideal_stop_distances:
        return []

    top_candidates = []

    for ideal_km in ideal_stop_distances:
        scored_stations = []
        
        for st in stations:
            score = 100.0

            score -= (st.get("distance_to_route_m", 0) / 100.0)

            if st.get("distance_to_route_m", 0) > 5000:
                continue

            if st.get("is_fast_charge", False):
                score += 50.0

            distance_diff_km = abs(st.get("distance_from_start_km", 0) - ideal_km)
            score -= (distance_diff_km * 1.5)

            if distance_diff_km > 150:  # Gevşetildi: İstasyon sayısı az olan uzun rotalarda en azından istasyon bulabilsin
                continue
            
            st_copy = st.copy()
            st_copy["score"] = score
            st_copy["target_ideal_km"] = round(ideal_km, 1)
            scored_stations.append(st_copy)

        scored_stations.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        for candidate in scored_stations[:3]:
            if not any(c["id"] == candidate["id"] for c in top_candidates):
                top_candidates.append(candidate)
                
    return top_candidates
