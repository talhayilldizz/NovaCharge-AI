from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database.session import get_db
from app.schemas.route_schema import RouteCreate, RouteResponse
from app.services import route_service

router = APIRouter(
    prefix="/routes",
    tags=["Rota İşlemleri"]
)


@router.post("/user/{user_id}", response_model=RouteResponse)
def create_route(
    user_id: UUID,
    route: RouteCreate,
    db: Session = Depends(get_db)
):
    return route_service.create_route(db=db, route=route, user_id=user_id)


@router.get("/user/{user_id}", response_model=List[RouteResponse])
def get_user_routes(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    routes = route_service.get_user_routes(db=db, user_id=user_id)
    if not routes:
        raise HTTPException(status_code=404, detail="Kullanıcıya ait rota bulunamadı")
    return routes


@router.get("/user/{user_id}/{route_id}", response_model=RouteResponse)
def get_route(
    route_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db)
):
    db_route = route_service.get_route_by_id(db=db, route_id=route_id)
    if not db_route:
        raise HTTPException(status_code=404, detail="Rota bulunamadı")

    if db_route.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Sadece kendi rotanızı görebilirsiniz."
        )
    return db_route


@router.delete("/user/{user_id}/{route_id}")
def delete_route(
    user_id: UUID,
    route_id: UUID,
    db: Session = Depends(get_db)
):
    db_route = route_service.get_route_by_id(db=db, route_id=route_id)
    if not db_route:
        raise HTTPException(status_code=404, detail="Rota bulunamadı")
        
    if db_route.user_id != user_id:
        raise HTTPException(status_code=403, detail="Bu rotayı silme yetkiniz yok!")
        
    route_service.delete_route(db=db, db_route=db_route)
    return {"message": "Rota başarıyla silindi"}
