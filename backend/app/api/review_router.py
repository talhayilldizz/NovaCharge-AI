from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.session import get_db
from app.schemas.review_schema import ReviewCreate, ReviewUpdate, StationReviewsSummary, ReviewResponse
from app.services import review_service
from app.api.deps import get_current_user
from app.models.user import User
from typing import List

router = APIRouter(
    prefix="/reviews",
    tags=["Yorumlar"]
)

@router.post("/{station_id}", response_model=ReviewResponse)
def add_review(
    station_id: UUID,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=403,
            detail="Yorum yapmak için giriş yapmalısınız"
        )
    
    return review_service.create_review(db=db, station_id=station_id, user_id=current_user.id, review_in=review_in)


@router.get("/{station_id}", response_model=StationReviewsSummary)
def get_reviews(
    station_id: UUID,
    db: Session = Depends(get_db)
):
    return review_service.get_station_reviews(db=db, station_id=station_id)

@router.get("/", response_model=List[ReviewResponse])
def get_user_reviews(
    current_user: User=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return review_service.get_review_by_userid(
        db= db,
        user_id=current_user.id
    )


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review_endpoint(
    review_id: UUID,
    review_in: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_review = review_service.get_review_by_id(db=db, review_id=review_id)

    if not db_review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı.")
    
    if db_review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu yorumu güncelleme yetkiniz yok!")

    return review_service.update_review(db=db, db_review=db_review, review_in=review_in)

@router.delete("/{review_id}")
def delete_review_endpoint(
    review_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_review = review_service.get_review_by_id(db=db, review_id=review_id)
    
    if not db_review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı.")
        
    if db_review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu yorumu silme yetkiniz yok!")
        
    review_service.delete_review(db=db, db_review=db_review)
    return {"message": "Yorum başarıyla silindi."}  