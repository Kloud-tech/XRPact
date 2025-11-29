# validator_service.py
from typing import List
from math import radians, cos, sin, asin, sqrt
from sqlalchemy.orm import Session

from models import Validator


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    # rayon Terre en km
    R = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return R * c


def select_validators_for_project(
    db: Session,
    project_lat: float,
    project_lon: float,
    max_radius_km: float = 50.0,
    k: int = 3,
) -> List[Validator]:
    candidates = db.query(Validator).filter(Validator.slashed == False).all()

    scored = []
    for val in candidates:
        if val.latitude is None or val.longitude is None:
            continue
        dist = haversine_km(project_lat, project_lon, val.latitude, val.longitude)
        if dist > max_radius_km:
            continue
        success_rate = val.success_rate or 0.5
        score = 0.6 * success_rate + 0.4 * max(0.0, 1.0 - dist / max_radius_km)
        scored.append((score, val))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [val for _, val in scored[:k]]