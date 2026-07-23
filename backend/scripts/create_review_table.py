from app.database.session import engine
from app.models.station_review import StationReview


StationReview.__table__.create(engine, checkfirst=True)
