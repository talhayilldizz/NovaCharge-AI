from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from app.models.station_review import StationReview
from app.schemas.review_schema import ReviewCreate, StationReviewsSummary, ReviewResponse, ReviewUpdate

def create_review(
    db: Session, 
    station_id: UUID, 
    user_id: UUID, 
    review_in: ReviewCreate
) -> StationReview:

    db_review = StationReview(
        station_id=station_id,
        user_id=user_id,
        rating=review_in.rating,
        comment=review_in.comment,
        is_anonymous=review_in.is_anonymous
    )

    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    return db_review

def get_station_reviews(
    db: Session, 
    station_id: UUID
) -> StationReviewsSummary:

    reviews_db = db.query(StationReview).options(joinedload(StationReview.user)).filter(
        StationReview.station_id == station_id
    ).order_by(StationReview.created_at.desc()).all()
    
    total_reviews = len(reviews_db)
    
    if total_reviews > 0:
        avg_rating = sum([r.rating for r in reviews_db]) / total_reviews
    else:
        avg_rating = 0.0
        
    responses = []
    for r in reviews_db:
        if r.is_anonymous:
            username = "Sürücü"
        else:
            username = f"{r.user.first_name or ''} {r.user.last_name or ''}".strip() if r.user else "Sürücü"
            if not username:
                username = "Sürücü"
            
        responses.append(ReviewResponse(
            id=r.id,
            station_id=r.station_id,
            user_id=r.user_id,
            user_name=username,
            rating=r.rating,
            comment=r.comment,
            is_anonymous=bool(r.is_anonymous),
            created_at=r.created_at
        ))

    return StationReviewsSummary(
        average_rating=round(avg_rating, 1),
        total_reviews=total_reviews,
        reviews=responses
    )

def update_review(
    db: Session, 
    db_review: StationReview, 
    review_in: ReviewUpdate
) -> StationReview:

    if review_in.rating is not None:
        db_review.rating = review_in.rating
    if review_in.comment is not None:
        db_review.comment = review_in.comment
    if review_in.is_anonymous is not None:
        db_review.is_anonymous = review_in.is_anonymous
        
    db.commit()
    db.refresh(db_review)
    return db_review

def delete_review(
    db: Session, 
    db_review: StationReview
) -> bool:

    db.delete(db_review)
    db.commit()
    return True

def get_review_by_userid(
    user_id: UUID,
    db: Session
):
    reviews_db = db.query(StationReview).options(joinedload(StationReview.user)).filter(StationReview.user_id == user_id).all()
    
    responses = []
    for r in reviews_db:
        if r.is_anonymous:
            username = "Sürücü"
        else:
            username = f"{r.user.first_name or ''} {r.user.last_name or ''}".strip() if r.user else "Sürücü"
            if not username:
                username = "Sürücü"
            
        responses.append(ReviewResponse(
            id=r.id,
            station_id=r.station_id,
            user_id=r.user_id,
            user_name=username,
            rating=r.rating,
            comment=r.comment,
            is_anonymous=bool(r.is_anonymous),
            created_at=r.created_at
        ))
        
    return responses

def get_review_by_id(
    db: Session, 
    review_id: UUID
) -> StationReview:

    return db.query(StationReview).filter(StationReview.id == review_id).first()