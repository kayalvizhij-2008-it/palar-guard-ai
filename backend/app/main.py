from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .seed_data import init_db
from .api import (
    auth, locations, groundwater, water_quality, 
    rainfall, anomalies, investigations, community, 
    recharge, assistant, analytics
)

app = FastAPI(
    title="PALAR GUARD AI — Environmental Intelligence API",
    description="Backend API services for Palar River Basin water-risk monitoring, anomaly detection, predictive intelligence, and community workflows.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development mode allow all origins
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
        "health": "operational"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "geography": "Palar River Basin, Tamil Nadu"
    }
