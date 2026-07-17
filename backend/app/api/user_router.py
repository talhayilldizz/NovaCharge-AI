from fastapi import status
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.session import get_db
from app.schemas.user_schema import UserResponse, UpdateProfile
from app.services import user_service
from app.models.user import User
from app.api.deps import get_current_user 

router = APIRouter(
    prefix="/users",
    tags=["Kullanıcı İşlemleri"]
)

@router.get("/", response_model=UserResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = user_service.get_user_by_id(db, current_user.id)

    if not user:
        raise HTTPException(
            status_code = 404,
            detail= "Kullanıcı Bulunamadı"
        )
    
    return user

@router.put("/", response_model = UserResponse)
def update_user_profile(
    profile_data: UpdateProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = user_service.get_user_by_id(db, current_user.id)

    if not user:
        raise HTTPException(
            status_code = 404,
            detail= "Kullanıcı Bulunamadı"
        )

    updated_user = user_service.update_user_profile(
        db,
        db_user=user,
        profile_data= profile_data
    ) 

    return updated_user
