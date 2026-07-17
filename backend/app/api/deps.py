import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.session import get_db
from app.models.user import User

# Kullanıcıdan Header içinde "Bearer <token>" formatında şifre isteyecek kilit
security = HTTPBearer()

# .env dosyasından Supabase'e ait çok gizli JWT Secret kodumuzu okuyoruz
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "super-secret-key-varsayilan-degistirilmeli")

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        # 1. Supabase'in anahtarıyla bu token gerçekten bizim sisteme mi ait çözüyoruz (Decode & Verify)
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"], 
            options={"verify_aud": False} # Supabase için audience doğrulaması bazen sorun yaratır, kapattık
        )
        
        # 2. Token içinden Supabase'in atadığı eşsiz kullanıcı kimliğini (sub) alıyoruz
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token içinde kullanıcı kimliği (sub) bulunamadı"
            )
        
        user_id = UUID(user_id_str)
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token süresi dolmuş. Lütfen tekrar giriş yapın."
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Geçersiz veya sahte Token tespit edildi!"
        )

    # 3. Bu ID'ye sahip kullanıcı veritabanımızda (users tablosunda) var mı kontrol et
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Supabase'de kayıtlısınız ama veritabanımızda profiliniz bulunamadı!"
        )
        
    # Her şey yolundaysa Kullanıcı (User) objesini direkt döndür
    return user
