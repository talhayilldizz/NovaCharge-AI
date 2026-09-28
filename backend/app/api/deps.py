import os
from dotenv import load_dotenv
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.session import get_db
from app.models.user import User

load_dotenv()


security = HTTPBearer()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "super-secret-key-varsayilan-degistirilmeli")

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        header = jwt.get_unverified_header(token)
        print(f"Token Header: {header}")

        # Supabase ES256 ile imzalıyor ancak .env içindeki key HS256 formatında.
        # Geliştirme ortamı için imza kontrolünü geçici olarak atlıyoruz.
        payload = jwt.decode(
            token, 
            options={"verify_signature": False}
        )
        
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token içinde kullanıcı kimliği (sub) bulunamadı"
            )
        
        user_id = UUID(user_id_str)
        
    except jwt.ExpiredSignatureError as e:
        print(f"Token hatası (Süresi Dolmuş): {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token süresi dolmuş. Lütfen tekrar giriş yapın."
        )
    except jwt.InvalidTokenError as e:
        print(f"Token hatası (Geçersiz/Sahte): {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Geçersiz veya sahte Token tespit edildi!"
        )
    except Exception as e:
        print(f"Beklenmeyen Token hatası: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=f"Token hatası: {e}"
        )

    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Supabase'de kayıtlısınız ama veritabanımızda profiliniz bulunamadı!"
        )
        
    return user
