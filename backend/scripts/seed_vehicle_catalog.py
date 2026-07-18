import sys
import os

# Add the backend directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import engine, SessionLocal
from app.models.vehicle_catalog import VehicleCatalog

EV_DATABASE = {
  "Audi": [
    { "model": "Q4 e-tron 40", "batteryCapacity": "76.6", "rangeKm": "520", "plugType": "CCS2" },
    { "model": "Q4 e-tron 45", "batteryCapacity": "76.6", "rangeKm": "530", "plugType": "CCS2" },
    { "model": "Q4 e-tron 50 quattro", "batteryCapacity": "76.6", "rangeKm": "500", "plugType": "CCS2" },
    { "model": "Q6 e-tron quattro", "batteryCapacity": "94.9", "rangeKm": "625", "plugType": "CCS2" },
    { "model": "Q8 e-tron 50", "batteryCapacity": "89.0", "rangeKm": "491", "plugType": "CCS2" },
    { "model": "Q8 e-tron 55", "batteryCapacity": "106.0", "rangeKm": "582", "plugType": "CCS2" },
    { "model": "e-tron GT quattro", "batteryCapacity": "83.7", "rangeKm": "488", "plugType": "CCS2" },
    { "model": "RS e-tron GT", "batteryCapacity": "83.7", "rangeKm": "472", "plugType": "CCS2" }
  ],
  "BMW": [
    { "model": "i3 (120 Ah)", "batteryCapacity": "37.9", "rangeKm": "310", "plugType": "CCS2" },
    { "model": "iX1 xDrive30", "batteryCapacity": "64.7", "rangeKm": "438", "plugType": "CCS2" },
    { "model": "iX2 xDrive30", "batteryCapacity": "64.7", "rangeKm": "449", "plugType": "CCS2" },
    { "model": "iX3", "batteryCapacity": "74.0", "rangeKm": "460", "plugType": "CCS2" },
    { "model": "i4 eDrive35", "batteryCapacity": "67.0", "rangeKm": "483", "plugType": "CCS2" },
    { "model": "i4 eDrive40", "batteryCapacity": "80.7", "rangeKm": "590", "plugType": "CCS2" },
    { "model": "i4 M50", "batteryCapacity": "80.7", "rangeKm": "520", "plugType": "CCS2" },
    { "model": "i5 eDrive40", "batteryCapacity": "81.2", "rangeKm": "582", "plugType": "CCS2" },
    { "model": "i5 M60 xDrive", "batteryCapacity": "81.2", "rangeKm": "516", "plugType": "CCS2" },
    { "model": "iX xDrive40", "batteryCapacity": "71.0", "rangeKm": "425", "plugType": "CCS2" },
    { "model": "iX xDrive50", "batteryCapacity": "105.2", "rangeKm": "630", "plugType": "CCS2" },
    { "model": "iX M60", "batteryCapacity": "105.2", "rangeKm": "561", "plugType": "CCS2" },
    { "model": "i7 xDrive60", "batteryCapacity": "101.7", "rangeKm": "625", "plugType": "CCS2" }
  ],
  "BYD": [
    { "model": "Dolphin", "batteryCapacity": "60.4", "rangeKm": "427", "plugType": "CCS2" },
    { "model": "Atto 3", "batteryCapacity": "60.4", "rangeKm": "420", "plugType": "CCS2" },
    { "model": "Seal RWD", "batteryCapacity": "82.5", "rangeKm": "570", "plugType": "CCS2" },
    { "model": "Seal AWD", "batteryCapacity": "82.5", "rangeKm": "520", "plugType": "CCS2" },
    { "model": "Han", "batteryCapacity": "85.4", "rangeKm": "521", "plugType": "CCS2" },
    { "model": "Tang", "batteryCapacity": "86.4", "rangeKm": "400", "plugType": "CCS2" }
  ],
  "Dacia": [
    { "model": "Spring Electric 45", "batteryCapacity": "26.8", "rangeKm": "230", "plugType": "CCS2" },
    { "model": "Spring Electric 65", "batteryCapacity": "26.8", "rangeKm": "220", "plugType": "CCS2" }
  ],
  "Fiat": [
    { "model": "500e (24 kWh)", "batteryCapacity": "21.3", "rangeKm": "190", "plugType": "CCS2" },
    { "model": "500e (42 kWh)", "batteryCapacity": "37.3", "rangeKm": "320", "plugType": "CCS2" },
    { "model": "600e", "batteryCapacity": "50.8", "rangeKm": "400", "plugType": "CCS2" }
  ],
  "Ford": [
    { "model": "Mustang Mach-E Standard", "batteryCapacity": "70.0", "rangeKm": "440", "plugType": "CCS2" },
    { "model": "Mustang Mach-E Extended", "batteryCapacity": "91.0", "rangeKm": "600", "plugType": "CCS2" },
    { "model": "Mustang Mach-E GT", "batteryCapacity": "91.0", "rangeKm": "490", "plugType": "CCS2" },
    { "model": "F-150 Lightning", "batteryCapacity": "98.0", "rangeKm": "386", "plugType": "CCS1" }
  ],
  "Hyundai": [
    { "model": "Ioniq 5 (58 kWh)", "batteryCapacity": "58.0", "rangeKm": "384", "plugType": "CCS2" },
    { "model": "Ioniq 5 (77.4 kWh)", "batteryCapacity": "77.4", "rangeKm": "507", "plugType": "CCS2" },
    { "model": "Ioniq 5 N", "batteryCapacity": "84.0", "rangeKm": "448", "plugType": "CCS2" },
    { "model": "Ioniq 6 (53 kWh)", "batteryCapacity": "53.0", "rangeKm": "429", "plugType": "CCS2" },
    { "model": "Ioniq 6 (77.4 kWh)", "batteryCapacity": "77.4", "rangeKm": "614", "plugType": "CCS2" },
    { "model": "Kona Electric (48 kWh)", "batteryCapacity": "48.4", "rangeKm": "377", "plugType": "CCS2" },
    { "model": "Kona Electric (65 kWh)", "batteryCapacity": "65.4", "rangeKm": "514", "plugType": "CCS2" }
  ],
  "Kia": [
    { "model": "Niro EV", "batteryCapacity": "64.8", "rangeKm": "460", "plugType": "CCS2" },
    { "model": "Soul EV", "batteryCapacity": "64.0", "rangeKm": "452", "plugType": "CCS2" },
    { "model": "EV6 (58 kWh)", "batteryCapacity": "58.0", "rangeKm": "394", "plugType": "CCS2" },
    { "model": "EV6 (77.4 kWh)", "batteryCapacity": "77.4", "rangeKm": "528", "plugType": "CCS2" },
    { "model": "EV6 GT", "batteryCapacity": "77.4", "rangeKm": "424", "plugType": "CCS2" },
    { "model": "EV9 (76.1 kWh)", "batteryCapacity": "76.1", "rangeKm": "418", "plugType": "CCS2" },
    { "model": "EV9 (99.8 kWh)", "batteryCapacity": "99.8", "rangeKm": "541", "plugType": "CCS2" }
  ],
  "Mercedes-Benz": [
    { "model": "EQA 250", "batteryCapacity": "66.5", "rangeKm": "426", "plugType": "CCS2" },
    { "model": "EQA 300 4MATIC", "batteryCapacity": "66.5", "rangeKm": "432", "plugType": "CCS2" },
    { "model": "EQB 250", "batteryCapacity": "66.5", "rangeKm": "474", "plugType": "CCS2" },
    { "model": "EQB 300 4MATIC", "batteryCapacity": "66.5", "rangeKm": "419", "plugType": "CCS2" },
    { "model": "EQC 400", "batteryCapacity": "80.0", "rangeKm": "414", "plugType": "CCS2" },
    { "model": "EQE 300", "batteryCapacity": "89.0", "rangeKm": "639", "plugType": "CCS2" },
    { "model": "EQE 350+", "batteryCapacity": "90.6", "rangeKm": "654", "plugType": "CCS2" },
    { "model": "EQE 500 4MATIC", "batteryCapacity": "90.6", "rangeKm": "590", "plugType": "CCS2" },
    { "model": "EQS 450+", "batteryCapacity": "107.8", "rangeKm": "732", "plugType": "CCS2" },
    { "model": "EQS 580 4MATIC", "batteryCapacity": "107.8", "rangeKm": "676", "plugType": "CCS2" }
  ],
  "MG": [
    { "model": "MG4 Standard", "batteryCapacity": "51.0", "rangeKm": "350", "plugType": "CCS2" },
    { "model": "MG4 Long Range", "batteryCapacity": "64.0", "rangeKm": "450", "plugType": "CCS2" },
    { "model": "MG4 XPOWER", "batteryCapacity": "64.0", "rangeKm": "385", "plugType": "CCS2" },
    { "model": "ZS EV Standard", "batteryCapacity": "51.1", "rangeKm": "320", "plugType": "CCS2" },
    { "model": "ZS EV Long Range", "batteryCapacity": "68.3", "rangeKm": "440", "plugType": "CCS2" },
    { "model": "MG5 EV", "batteryCapacity": "57.4", "rangeKm": "400", "plugType": "CCS2" },
    { "model": "Marvel R", "batteryCapacity": "70.0", "rangeKm": "402", "plugType": "CCS2" }
  ],
  "Mini": [
    { "model": "Cooper SE", "batteryCapacity": "28.9", "rangeKm": "234", "plugType": "CCS2" },
    { "model": "Countryman SE ALL4", "batteryCapacity": "64.7", "rangeKm": "433", "plugType": "CCS2" }
  ],
  "Nissan": [
    { "model": "Leaf (40 kWh)", "batteryCapacity": "39.0", "rangeKm": "270", "plugType": "CHAdeMO" },
    { "model": "Leaf e+ (62 kWh)", "batteryCapacity": "59.0", "rangeKm": "385", "plugType": "CHAdeMO" },
    { "model": "Ariya (63 kWh)", "batteryCapacity": "63.0", "rangeKm": "403", "plugType": "CCS2" },
    { "model": "Ariya (87 kWh)", "batteryCapacity": "87.0", "rangeKm": "533", "plugType": "CCS2" }
  ],
  "Peugeot": [
    { "model": "e-208", "batteryCapacity": "46.3", "rangeKm": "362", "plugType": "CCS2" },
    { "model": "e-2008", "batteryCapacity": "46.3", "rangeKm": "345", "plugType": "CCS2" },
    { "model": "e-308", "batteryCapacity": "51.0", "rangeKm": "410", "plugType": "CCS2" },
    { "model": "e-3008", "batteryCapacity": "73.0", "rangeKm": "525", "plugType": "CCS2" }
  ],
  "Polestar": [
    { "model": "Polestar 2 Standard Range", "batteryCapacity": "67.0", "rangeKm": "478", "plugType": "CCS2" },
    { "model": "Polestar 2 Long Range SM", "batteryCapacity": "78.0", "rangeKm": "551", "plugType": "CCS2" },
    { "model": "Polestar 2 Long Range DM", "batteryCapacity": "78.0", "rangeKm": "487", "plugType": "CCS2" },
    { "model": "Polestar 3", "batteryCapacity": "107.0", "rangeKm": "610", "plugType": "CCS2" },
    { "model": "Polestar 4", "batteryCapacity": "94.0", "rangeKm": "600", "plugType": "CCS2" }
  ],
  "Porsche": [
    { "model": "Taycan", "batteryCapacity": "71.0", "rangeKm": "431", "plugType": "CCS2" },
    { "model": "Taycan 4S", "batteryCapacity": "83.7", "rangeKm": "463", "plugType": "CCS2" },
    { "model": "Taycan GTS", "batteryCapacity": "83.7", "rangeKm": "504", "plugType": "CCS2" },
    { "model": "Taycan Turbo", "batteryCapacity": "83.7", "rangeKm": "450", "plugType": "CCS2" },
    { "model": "Taycan Turbo S", "batteryCapacity": "83.7", "rangeKm": "416", "plugType": "CCS2" },
    { "model": "Macan 4 Electric", "batteryCapacity": "95.0", "rangeKm": "613", "plugType": "CCS2" }
  ],
  "Renault": [
    { "model": "Zoe ZE50", "batteryCapacity": "52.0", "rangeKm": "395", "plugType": "Type 2" },
    { "model": "Megane E-Tech (40 kWh)", "batteryCapacity": "40.0", "rangeKm": "300", "plugType": "CCS2" },
    { "model": "Megane E-Tech (60 kWh)", "batteryCapacity": "60.0", "rangeKm": "450", "plugType": "CCS2" },
    { "model": "Scenic E-Tech (87 kWh)", "batteryCapacity": "87.0", "rangeKm": "625", "plugType": "CCS2" }
  ],
  "Skoda": [
    { "model": "Enyaq iV 60", "batteryCapacity": "58.0", "rangeKm": "412", "plugType": "CCS2" },
    { "model": "Enyaq iV 80", "batteryCapacity": "77.0", "rangeKm": "544", "plugType": "CCS2" },
    { "model": "Enyaq iV 80x", "batteryCapacity": "77.0", "rangeKm": "520", "plugType": "CCS2" },
    { "model": "Enyaq RS iV", "batteryCapacity": "77.0", "rangeKm": "517", "plugType": "CCS2" }
  ],
  "Tesla": [
    { "model": "Model 3 RWD", "batteryCapacity": "57.5", "rangeKm": "513", "plugType": "CCS2" },
    { "model": "Model 3 Long Range", "batteryCapacity": "75.0", "rangeKm": "629", "plugType": "CCS2" },
    { "model": "Model 3 Performance", "batteryCapacity": "75.0", "rangeKm": "528", "plugType": "CCS2" },
    { "model": "Model Y RWD", "batteryCapacity": "57.5", "rangeKm": "455", "plugType": "CCS2" },
    { "model": "Model Y Long Range", "batteryCapacity": "75.0", "rangeKm": "533", "plugType": "CCS2" },
    { "model": "Model Y Performance", "batteryCapacity": "75.0", "rangeKm": "514", "plugType": "CCS2" },
    { "model": "Model S Long Range", "batteryCapacity": "95.0", "rangeKm": "652", "plugType": "CCS2" },
    { "model": "Model S Plaid", "batteryCapacity": "95.0", "rangeKm": "600", "plugType": "CCS2" },
    { "model": "Model X Long Range", "batteryCapacity": "95.0", "rangeKm": "560", "plugType": "CCS2" },
    { "model": "Model X Plaid", "batteryCapacity": "95.0", "rangeKm": "543", "plugType": "CCS2" },
    { "model": "Cybertruck AWD", "batteryCapacity": "123.0", "rangeKm": "547", "plugType": "NACS" }
  ],
  "Togg": [
    { "model": "T10X V1 Standard", "batteryCapacity": "52.4", "rangeKm": "314", "plugType": "CCS2" },
    { "model": "T10X V1 Long Range", "batteryCapacity": "88.5", "rangeKm": "523", "plugType": "CCS2" },
    { "model": "T10X V2 Long Range", "batteryCapacity": "88.5", "rangeKm": "523", "plugType": "CCS2" }
  ],
  "Volkswagen": [
    { "model": "ID.3 Pro", "batteryCapacity": "58.0", "rangeKm": "426", "plugType": "CCS2" },
    { "model": "ID.3 Pro S", "batteryCapacity": "77.0", "rangeKm": "546", "plugType": "CCS2" },
    { "model": "ID.4 Pro", "batteryCapacity": "77.0", "rangeKm": "522", "plugType": "CCS2" },
    { "model": "ID.4 GTX", "batteryCapacity": "77.0", "rangeKm": "480", "plugType": "CCS2" },
    { "model": "ID.5 Pro", "batteryCapacity": "77.0", "rangeKm": "520", "plugType": "CCS2" },
    { "model": "ID.5 GTX", "batteryCapacity": "77.0", "rangeKm": "490", "plugType": "CCS2" },
    { "model": "ID.7 Pro", "batteryCapacity": "77.0", "rangeKm": "621", "plugType": "CCS2" },
    { "model": "ID. Buzz", "batteryCapacity": "77.0", "rangeKm": "423", "plugType": "CCS2" }
  ],
  "Volvo": [
    { "model": "EX30 Single Motor", "batteryCapacity": "49.0", "rangeKm": "344", "plugType": "CCS2" },
    { "model": "EX30 Extended Range", "batteryCapacity": "64.0", "rangeKm": "480", "plugType": "CCS2" },
    { "model": "EX30 Twin Motor", "batteryCapacity": "64.0", "rangeKm": "460", "plugType": "CCS2" },
    { "model": "XC40 Recharge Single", "batteryCapacity": "69.0", "rangeKm": "425", "plugType": "CCS2" },
    { "model": "XC40 Recharge Twin", "batteryCapacity": "78.0", "rangeKm": "418", "plugType": "CCS2" },
    { "model": "C40 Recharge Single", "batteryCapacity": "69.0", "rangeKm": "438", "plugType": "CCS2" },
    { "model": "C40 Recharge Twin", "batteryCapacity": "78.0", "rangeKm": "448", "plugType": "CCS2" },
    { "model": "EX90", "batteryCapacity": "107.0", "rangeKm": "600", "plugType": "CCS2" }
  ]
}

def seed_catalog():
    print("Creating tables...")
    VehicleCatalog.__table__.create(bind=engine, checkfirst=True)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_count = db.query(VehicleCatalog).count()
        if existing_count > 0:
            print(f"Vehicle catalog already contains {existing_count} records. Clearing table...")
            db.query(VehicleCatalog).delete()
            db.commit()

        print("Seeding vehicle catalog...")
        records = []
        for brand, models in EV_DATABASE.items():
            for m in models:
                vehicle = VehicleCatalog(
                    brand=brand,
                    model=m["model"],
                    battery_capacity=float(m["batteryCapacity"]),
                    range_km=int(m["rangeKm"]),
                    plug_type=m["plugType"]
                )
                records.append(vehicle)
        
        db.add_all(records)
        db.commit()
        print(f"Successfully seeded {len(records)} vehicles to the catalog!")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_catalog()
