from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class ReviewCreate(BaseModel):
    rating: int = Field(
        ...,
        ge=1,
        le=5,
        description="Puan 1 ile 5 arasında olmalıdır"
    )
    comment: Optional[str] = None
    is_anonymous: Optional[bool] = True


class ReviewResponse(BaseModel):
    id: UUID
    station_id: UUID
    station_name: Optional[str] = None
    user_id: UUID
    user_name: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    is_anonymous: bool
    created_at: datetime

    class Config:
        from_attributes = True
    
class StationReviewsSummary(BaseModel):
    average_rating: float
    total_reviews: int
    reviews: List[ReviewResponse]


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5, description="Puan 1 ile 5 arasında olmalıdır")
    comment: Optional[str] = None
    is_anonymous: Optional[bool] = None
