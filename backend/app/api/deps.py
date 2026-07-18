import os
from dotenv import load_dotenv
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.session import get_db
from app.models.user import User

# .env dosyasını yükle
load_dotenv()

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
        # Token başlığını okuyup algoritmayı yazdıralım
        header = jwt.get_unverified_header(token)
        print(f"Token Header: {header}")

        # 1. Supabase'in anahtarıyla bu token gerçekten bizim sisteme mi ait çözüyoruz (Decode & Verify)
        # ES256 algoritması için Asimetrik (Public Key) doğrulaması:
        # Eğer henüz .env dosyasına SUPABASE_PUBLIC_KEY eklemediysen hata verecektir.
        public_key = os.getenv("SUPABASE_PUBLIC_KEY")
        
        if public_key:
            # Doğru senaryo: Public Key ile güvenli doğrulama (Canlı Ortam)
            public_key_formatted = f"-----BEGIN PUBLIC KEY-----\n{public_key}\n-----END PUBLIC KEY-----" if "BEGIN" not in public_key else public_key
            payload = jwt.decode(
                token, 
                public_key_formatted, 
                algorithms=["ES256"], 
                options={"verify_aud": False}
            )
        else:
            # Geliştirme aşaması için Public Key yoksa imza doğrulamasını geçici olarak atlıyoruz
            print("UYARI: SUPABASE_PUBLIC_KEY bulunamadı. İmza doğrulaması atlanıyor!")
            payload = jwt.decode(
                token, 
                options={"verify_signature": False}
            )
        
        # 2. Token içinden Supabase'in atadığı eşsiz kullanıcı kimliğini (sub) alıyoruz
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

    # 3. Bu ID'ye sahip kullanıcı veritabanımızda (users tablosunda) var mı kontrol et
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Supabase'de kayıtlısınız ama veritabanımızda profiliniz bulunamadı!"
        )
        
    # Her şey yolundaysa Kullanıcı (User) objesini direkt döndür
    return user
