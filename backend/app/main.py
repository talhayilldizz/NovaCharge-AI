from app.api import user_router
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import station


app = FastAPI(title="VoltPilot AI API")

app.include_router(user_router.router)

@app.get("/")
def read_root():
    return {"message": "VoltPilot AI API Sorunsuz Calisiyor! ⚡"}

@app.get("/test-db")
def test_db_connection(db: Session = Depends(get_db)):
    count = db.query(station.Station).count()
    return {
        "status": "success",
        "message": "Veritabani baglantisi basarili!", 
        "total_stations": count
    }
