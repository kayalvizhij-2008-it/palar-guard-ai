import os
import sys
import pytest

# Ensure backend root is on path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__)))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from fastapi.testclient import TestClient
from app.main import app
from app.seed_data import init_db

# Initialize database
init_db()
client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "PALAR GUARD AI"
    assert "tagline" in data
    assert data["health"] == "operational"

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "Palar River Basin" in data["geography"]

def test_locations():
    response = client.get("/api/v1/locations/")
    assert response.status_code == 200
    locations = response.json()
    assert len(locations) >= 7
    # Verify Ranipet station
    ranipet = next((l for l in locations if "Ranipet" in l["name"]), None)
    assert ranipet is not None
    assert ranipet["district"] == "Ranipet"
    assert ranipet["basin_zone"] == "Middle Basin"

def test_groundwater():
    response = client.get("/api/v1/groundwater/forecast")
    assert response.status_code == 200
    forecasts = response.json()
    assert len(forecasts) > 0

def test_water_quality():
    response = client.get("/api/v1/water-quality/")
    assert response.status_code == 200
    records = response.json()
    assert len(records) > 0

def test_rainfall():
    response = client.get("/api/v1/rainfall/")
    assert response.status_code == 200
    rain_data = response.json()
    assert len(rain_data) > 0

def test_anomalies():
    response = client.get("/api/v1/anomalies/")
    assert response.status_code == 200
    anomalies = response.json()
    assert len(anomalies) > 0
    # Confirm Ranipet chromium anomaly exists
    critical = next((a for a in anomalies if a["severity"] == "Critical"), None)
    assert critical is not None
    assert "Chromium" in critical["parameter"]

def test_investigations():
    response = client.get("/api/v1/investigations/")
    assert response.status_code == 200
    inv = response.json()
    assert len(inv) > 0

def test_community_reports():
    response = client.get("/api/v1/community/")
    assert response.status_code == 200
    reports = response.json()
    assert len(reports) > 0

def test_recharge_suitability():
    response = client.get("/api/v1/recharge/")
    assert response.status_code == 200
    assessments = response.json()
    assert len(assessments) > 0

def test_assistant_query():
    response = client.post("/api/v1/assistant/query", json={"prompt": "Ranipet groundwater status"})
    assert response.status_code == 200
    data = response.json()
    assert "response" in data

def test_analytics_summary():
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert data["summary"]["total_stations"] >= 7

if __name__ == "__main__":
    print("Running production API verification...")
    pytest.main(["-v", "backend/test_production_api.py"])
