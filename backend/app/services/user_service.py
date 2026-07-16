from sqlalchemy.orm import Session
from uuid import UUID
from app.models.user import User
from app.schemas.user_schema import UpdateProfile

def get_user_by_id(
    db: Session,
    user_id: UUID
):
    return db.query(User).filter(User.id == user_id).first()

def update_user_profile(
    db: Session,
    db_user: User,
    profile_data: UpdateProfile
):
    update_data = profile_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)

    return db_user