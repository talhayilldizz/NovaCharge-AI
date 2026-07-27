import os
import sys
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# App import paths for sqlalchemy session
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.operator_tariff import OperatorTariff
from app.models.station import Station
from app.models.station_review import StationReview
from app.database.session import SessionLocal

tariffs = [
    ("Trugo", 9.95, 14.98),
    ("ZES", 9.99, 16.49),
    ("Eşarj", 9.90, 13.50),
    ("AstorŞarj", 9.49, 12.49),
    ("Beefull", 9.90, 12.99),
    ("Voltrun", 9.90, 12.90),
    ("Otowatt", 7.99, 9.99),
    ("Petrol Ofisi e-POwer", 8.49, 10.99),
    ("Tesla Supercharger", 8.90, 9.40),
    ("Aksa Şarj", 8.99, 12.49),
    ("Multiforce", 7.00, 10.90),
    ("Swapp", 6.90, 6.90),
    ("Onlife", 5.79, 8.49),
    ("Obişarj", 9.90, 12.96),
    ("Borenco", 8.99, 10.99),
    ("Vale", 8.99, 12.99),
    ("Neva Şarj", 8.90, 11.90),
    ("Magicline", 8.20, 9.90),
    ("RHG", 9.98, 12.49),
    ("VOLTGO", 6.99, 9.75),
    ("D-Charge", 9.90, 12.99),
    ("Shell Recharge", 11.99, 15.99),
    ("Charge Teknoloji", 7.70, 9.00),
    ("360enerji", 7.00, 8.99),
    ("Fastgo", 8.49, 8.90),
    ("FixCharge", 9.33, 10.76),
    ("Spark", 8.39, 9.39),
    ("Otopriz", 7.88, 13.90),
    ("Sharz.net", 9.29, 11.49),
    ("G-Charge", 8.49, 11.49),
    ("OnCharge (Kalyon)", 9.99, 13.50),
    ("JetŞarj", 8.29, 11.29),
    ("Epsiz (Epsiz Şarj)", 6.00, 8.99),
    ("Reşarj", 7.79, 10.79),
    ("CW Enerji", 8.99, 13.49),
    ("Otojet", 10.49, 14.99),
    ("Armatec", 7.49, 9.99),
    ("FullCharger (FCTR)", 8.29, 11.29),
    ("ChargeIQ", 7.99, 10.49),
    ("Voltla", 8.49, 11.99),
    ("Enom Enerji", 7.79, 10.79),
    ("Hunat Enerji", 8.99, 12.49),
    ("5Şarj (Borusan EnBW)", 7.99, 15.90),
    ("Çelikler Enerji", 8.49, 10.60),
    ("Enyakıt Enerji", 11.80, 14.90),
    ("Rönesans Charger", 10.99, 15.99),
    ("Şarj Mahal", 8.40, 11.84),
    ("WAT Mobilite", 12.99, 9.99),
    ("SepaşCharge", 10.99, 8.99),
    ("TotalEnergies", 13.50, 9.50),
    ("Kingpower (Jetco)", 11.90, 8.50),
    ("Clixolar (Solarşarjet)", 15.49, 10.49),
    ("B-Charge (Bakırcı E-Mobility)", 10.99, 8.40),
    ("Plug&Drive (PGD Enerji)", 11.90, 8.90),
    ("Getasolar (Proşarj)", 11.90, 8.90),
    ("Hızzlan Charge / N'Drive", 12.99, 9.99)
]

def main():
    db = SessionLocal()
    try:
        # Clear existing tariffs to avoid unique constraint failures on operator_name
        db.query(OperatorTariff).delete()
        
        for name, ac_price, dc_price in tariffs:
            tariff = OperatorTariff(
                operator_name=name,
                ac_price_per_kwh=ac_price,
                dc_price_per_kwh=dc_price
            )
            db.add(tariff)
            
        db.commit()
        print(f"Successfully added {len(tariffs)} operator tariffs to the database.")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
