import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import engine
from .seed_data import init_db
from .api import (
    auth, locations, groundwater, water_quality, 
    rainfall, anomalies, investigations, community, 
    recharge, assistant, analytics, maps
)

app = FastAPI(
    title="PALAR GUARD AI — Environmental Intelligence API",
    description="Backend API services for Palar River Basin water-risk monitoring, anomaly detection, predictive intelligence, and community workflows.",
    version="1.0.0"
)

# Production CORS Configuration
cors_origins = settings.get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT != "production" else cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize and seed database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(locations.router, prefix=settings.API_V1_STR)
app.include_router(groundwater.router, prefix=settings.API_V1_STR)
app.include_router(water_quality.router, prefix=settings.API_V1_STR)
app.include_router(rainfall.router, prefix=settings.API_V1_STR)
app.include_router(anomalies.router, prefix=settings.API_V1_STR)
app.include_router(investigations.router, prefix=settings.API_V1_STR)
app.include_router(community.router, prefix=settings.API_V1_STR)
app.include_router(recharge.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(maps.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": "PALAR GUARD AI",
        "tagline": "See the Risk. Predict the Change. Protect Every Drop.",
        "version": "1.0.0",
        "team": {
            "lead": "Kayalvizhi J (Founder & Project Lead)",
            "members": ["Harini S", "Aarthi L"],
            "institution": "Chennai Institute of Technology"
        },
        "docs": "/docs",
        "health": "operational",
        "geography": "Palar River Basin (17,810 km² Catchment), Tamil Nadu, India"
    }

@app.get("/health")
def health_check():
    db_status = "connected"
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if "unhealthy" not in db_status else "degraded",
        "service": "PALAR GUARD AI Environmental Intelligence API",
        "version": "1.0.0",
        "database": db_status,
        "environment": settings.ENVIRONMENT,
        "geography": "Palar River Basin (17,810 km² Catchment), Tamil Nadu, India",
        "timestamp": datetime.utcnow().isoformat()
    }
