import sys
import os

# Add the 'app' directory to the Python path so it can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database.session import SessionLocal
from app.models.station import Station

def clear_stations():
    db = SessionLocal()
    try:
        count = db.query(Station).count()
        print(f"Veritabanında silinecek istasyon sayısı: {count}")
        db.query(Station).delete()
        db.commit()
        print("Tüm istasyonlar başarıyla silindi.")
    except Exception as e:
        print(f"Hata oluştu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_stations()
