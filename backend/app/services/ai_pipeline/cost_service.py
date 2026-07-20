def get_power_kw(is_fast_charge: bool) -> int:
    """
    Şarj istasyonunun gücünü varsayılan olarak döndürür.
    """
    return 120 if is_fast_charge else 22

def calculate_charging_cost(charge_amount_kwh: float, price_per_kwh: float) -> float:
    """
    Şarj maliyetini hesaplar.
    """
    return round(charge_amount_kwh * price_per_kwh, 2)

def calculate_charging_time_mins(charge_amount_kwh: float, power_kw: int) -> int:
    """
    Şarj süresini dakika cinsinden hesaplar.
    """
    if power_kw <= 0:
        return 0
    # Saat cinsinden süre = (alınacak enerji kWh) / (şarj gücü kW)
    hours = charge_amount_kwh / power_kw
    # %20 verimsizlik / şarj eğrisi yavaşlaması payı ekleyelim
    hours = hours * 1.2
    return int(hours * 60)
