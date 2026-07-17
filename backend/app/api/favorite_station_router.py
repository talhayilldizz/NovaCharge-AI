from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.schemas.favorite_station_schema import FavoriteStationCreate, FavoriteStationUpdate, FavoriteStationResponse
from app.services import favorite_station_service
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/favorites",
    tags=["Favori İstasyonlar"]
)

@router.post("/", response_model=FavoriteStationResponse)
def add_favorite(
    favorite: FavoriteStationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Bu istasyon zaten favorilerinde var mı kontrol et
    existing = favorite_station_service.get_favorite_by_external_id(
        db=db, 
        user_id=current_user.id, 
        external_station_id=favorite.external_station_id
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu istasyon zaten favorilerinizde ekli."
        )

    return favorite_station_service.add_favorite_station(
        db=db,
        favorite=favorite,
        user_id=current_user.id
    )

@router.get("/me", response_model=List[FavoriteStationResponse])
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return favorite_station_service.get_user_favorite_stations(db=db, user_id=current_user.id)

@router.put("/{favorite_id}", response_model=FavoriteStationResponse)
def update_favorite(
    favorite_id: UUID,
    favorite_update: FavoriteStationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_favorite = favorite_station_service.get_favorite_station_by_id(db=db, favorite_id=favorite_id)
    if not db_favorite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favori istasyon bulunamadı")
    
    if db_favorite.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu favoriyi güncelleme yetkiniz yok!")

    return favorite_station_service.update_favorite_station(
        db=db, 
        db_favorite=db_favorite, 
        favorite_update=favorite_update
    )

@router.delete("/{favorite_id}")
def delete_favorite(
    favorite_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_favorite = favorite_station_service.get_favorite_station_by_id(db=db, favorite_id=favorite_id)
    if not db_favorite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favori istasyon bulunamadı")
    
    if db_favorite.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu favoriyi silme yetkiniz yok!")

    favorite_station_service.remove_favorite_station(db=db, db_favorite=db_favorite)
    return {"message": "İstasyon favorilerinizden başarıyla çıkarıldı."}
