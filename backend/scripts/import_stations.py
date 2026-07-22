import sys
import os
import pandas as pd
import uuid

# Add the 'app' directory to the Python path so it can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.database.session import SessionLocal
from app.models.station import Station, StationSocket

def import_stations():
    db = SessionLocal()
    try:
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'station_data', 'ev_charging_stations_turkey.csv')
        df = pd.read_csv(csv_path)
        
        # We fill NaNs with empty string or sensible defaults
        df['Province'] = df['Province'].fillna('Bilinmeyen')
        df['District'] = df['District'].fillna('Bilinmeyen')
        
        print("Data loaded. Total rows:", len(df))
        
        # Group by Station_ID
        grouped = df.groupby('Station_ID')
        
        stations_to_insert = []
        sockets_to_insert = []
        
        count = 0
        total_groups = len(grouped)
        
        for station_id, group in grouped:
            # Create a UUID for this station
            st_uuid = uuid.uuid4()
            
            # The station level attributes (take from the first row of the group)
            first_row = group.iloc[0]
            
            # Check if any socket is DC (fast charge)
            # Assuming 'DC' in Current_Type or Service_Type. Let's just check 'DC' in Current_Type
            is_fast_charge = group['Current_Type'].astype(str).str.contains('DC', case=False, na=False).any()
            
            # Create Station object
            station_code = str(station_id)
            brand = str(first_row['Brand'])
            province = str(first_row['Province'])
            
            # Generate a nice name
            name = f"{brand} {province} İstasyonu"
            
            # WKT Location
            lat = float(first_row['Latitude'])
            lon = float(first_row['Longitude'])
            point_wkt = f"SRID=4326;POINT({lon} {lat})"
            
            total_sockets = len(group)
            
            station = Station(
                id=st_uuid,
                station_code=station_code,
                name=name,
                brand=brand,
                latitude=lat,
                longitude=lon,
                location=point_wkt,
                province=province,
                district=str(first_row['District']),
                is_fast_charge=is_fast_charge,
                total_sockets=total_sockets
            )
            stations_to_insert.append(station)
            
            # Now create sockets
            for _, row in group.iterrows():
                socket = StationSocket(
                    id=uuid.uuid4(),
                    station_id=st_uuid,
                    socket_code=str(row['Socket_ID']),
                    is_green_energy=bool(row['Is_Green_Energy']),
                    service_type=str(row['Service_Type']),
                    current_type=str(row['Current_Type']),
                    connector_type=str(row['Connector_Type']),
                    power_kw=float(row['Power_kW'])
                )
                sockets_to_insert.append(socket)
            
            count += 1
            if count % 1000 == 0:
                print(f"Processed {count}/{total_groups} stations...")

        print("Inserting into database...")
        # We can bulk save objects
        db.bulk_save_objects(stations_to_insert)
        db.bulk_save_objects(sockets_to_insert)
        
        db.commit()
        print("Import successfully completed!")
        
    except Exception as e:
        print(f"Error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import_stations()
