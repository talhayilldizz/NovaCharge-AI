from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID


from app.database.session import get_db
from app.schemas.route_schema import RouteCreate, RouteResponse
from app.services import route_service, vehicle_service
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.ai_schema import AIRouteAnalysisResponse, AIRouteAnalysisRequest
from app.services.ai_service import analyze_route_with_ai

router = APIRouter(
    prefix="/routes",
    tags=["Rota İşlemleri"]
)


@router.post("/", response_model=RouteResponse)
def create_route(
    route: RouteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicles= vehicle_service.get_user_vehicles(
        db,
        user_id=current_user.id
    )

    if len(vehicles) == 0:
        raise HTTPException(
            status_code=403,
            detail = "Araç oluşturmadan rota oluşturamazsınız!"
        )
    
    return route_service.create_route(db=db, route=route, user_id=current_user.id)

@router.get("/me", response_model=List[RouteResponse])
def get_user_routes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    routes = route_service.get_user_routes(db=db, user_id=current_user.id)
    if not routes:
        raise HTTPException(status_code=404, detail="Size ait rota bulunamadı")
    return routes


@router.get("/{route_id}", response_model=RouteResponse)
def get_route(
    route_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_route = route_service.get_route_by_id(db=db, route_id=route_id)
    if not db_route:
        raise HTTPException(status_code=404, detail="Rota bulunamadı")

    if db_route.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Sadece kendi rotanızı görebilirsiniz."
        )
    return db_route


@router.delete("/{route_id}")
def delete_route(
    route_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_route = route_service.get_route_by_id(db=db, route_id=route_id)
    if not db_route:
        raise HTTPException(status_code=404, detail="Rota bulunamadı")
        
    if db_route.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu rotayı silme yetkiniz yok!")
        
    route_service.delete_route(db=db, db_route=db_route)
    return {"message": "Rota başarıyla silindi"}

@router.post("/ai-analysis", response_model=AIRouteAnalysisResponse)
def get_ai_route_analysis(
    request:AIRouteAnalysisRequest
):
    try:
        return analyze_route_with_ai(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

