import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import engine, Base
import app.models 

print("Supabase'e baglaniliyor ve tüm mimari insa ediliyor...")
Base.metadata.create_all(bind=engine)
print("Butun tablolar Supabase uzerinde basariyla olusturuldu!")
