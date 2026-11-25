from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.models import (
    WatchlistLocation,
    Location,
    GroundwaterRecord,
    WaterQualityRecord,
    AnomalyAlert,
    User,
)
from ..schemas.schemas import WatchlistCreate

router = APIRouter(prefix="/monitoring", tags=["Monitoring Watchlist"])


@router.get("/watchlist")
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = (
        db.query(WatchlistLocation)
        .filter(WatchlistLocation.user_id == current_user.id)
        .order_by(WatchlistLocation.created_at.desc())
        .all()
    )
    out = []
    for item in items:
        loc = db.query(Location).filter(Location.id == item.location_id).first()
        if not loc:
            continue
        gw = (
            db.query(GroundwaterRecord)
            .filter(GroundwaterRecord.location_id == loc.id)
            .order_by(GroundwaterRecord.observation_date.desc())
            .first()
        )
        wq = (
            db.query(WaterQualityRecord)
            .filter(WaterQualityRecord.location_id == loc.id)
            .order_by(WaterQualityRecord.observation_date.desc())
            .first()
        )
        open_alerts = (
            db.query(AnomalyAlert)
            .filter(AnomalyAlert.location_id == loc.id, AnomalyAlert.status == "Open")
            .count()
        )
        out.append(
            {
                "id": item.id,
                "location_id": loc.id,
                "location_name": loc.name,
                "district": loc.district,
                "basin_zone": loc.basin_zone,
                "risk_score": loc.risk_score,
                "alert_threshold_mbgl": item.alert_threshold_mbgl,
                "alert_threshold_tds": item.alert_threshold_tds,
                "notes": item.notes,
                "latest_mbgl": gw.water_level_mbgl if gw else None,
                "latest_tds": wq.tds_mg_l if wq else None,
                "latest_chromium": wq.chromium_mg_l if wq else None,
                "open_alerts": open_alerts,
                "threshold_exceeded": bool(
                    (gw and gw.water_level_mbgl >= item.alert_threshold_mbgl)
                    or (wq and wq.tds_mg_l >= item.alert_threshold_tds)
                ),
                "created_at": item.created_at.isoformat(),
            }
        )
    return out


@router.post("/watchlist", status_code=status.HTTP_201_CREATED)
def add_watchlist_item(
    payload: WatchlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loc = db.query(Location).filter(Location.id == payload.location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    existing = (
        db.query(WatchlistLocation)
        .filter(
            WatchlistLocation.user_id == current_user.id,
            WatchlistLocation.location_id == payload.location_id,
        )
        .first()
    )
    if existing:
        existing.alert_threshold_mbgl = payload.alert_threshold_mbgl
        existing.alert_threshold_tds = payload.alert_threshold_tds
        existing.notes = payload.notes or ""
        db.commit()
        db.refresh(existing)
        return {"id": existing.id, "location_id": existing.location_id, "updated": True}

    item = WatchlistLocation(
        user_id=current_user.id,
        location_id=payload.location_id,
        alert_threshold_mbgl=payload.alert_threshold_mbgl,
        alert_threshold_tds=payload.alert_threshold_tds,
        notes=payload.notes or "",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "location_id": item.location_id, "updated": False}


@router.delete("/watchlist/{item_id}")
def delete_watchlist_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(WatchlistLocation).filter(WatchlistLocation.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
    if item.user_id != current_user.id and current_user.role != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot delete another user's watchlist entry.",
        )
    db.delete(item)
    db.commit()
    return {"deleted": True, "id": item_id}
