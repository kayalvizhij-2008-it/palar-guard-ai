import os
import sys
import pytest

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__)))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

TEST_DB = os.path.join(backend_path, "test_prod_suite.db")
if os.path.exists(TEST_DB):
    os.remove(TEST_DB)

os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB}"
os.environ["SECRET_KEY"] = "test-prod-api-strong-secret-key-at-least-32-chars"
os.environ["INITIAL_ADMIN_EMAIL"] = "prodadmin@palarguard.test"
os.environ["INITIAL_ADMIN_PASSWORD"] = "StrongProdPass#2026"

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402
from app.seed_data import init_db  # noqa: E402

init_db()
client = TestClient(app)


def _admin_headers():
    r = client.post(
        "/api/v1/auth/login",
        json={"email": "prodadmin@palarguard.test", "password": "StrongProdPass#2026"},
    )
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


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
    ranipet = next((l for l in locations if "Ranipet" in l["name"]), None)
    assert ranipet is not None
    assert ranipet["district"] == "Ranipet"
    assert ranipet["basin_zone"] == "Middle Basin"


def test_groundwater():
    response = client.get("/api/v1/groundwater/forecast")
    assert response.status_code == 200
    data = response.json()
    assert len(data["forecast"]) > 0


def test_water_quality():
    response = client.get("/api/v1/water-quality/")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_rainfall():
    response = client.get("/api/v1/rainfall/")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_anomalies():
    response = client.get("/api/v1/anomalies/")
    assert response.status_code == 200
    anomalies = response.json()
    assert len(anomalies) > 0
    critical = next((a for a in anomalies if a["severity"] == "Critical"), None)
    assert critical is not None
    assert "Chromium" in critical["parameter"]


def test_investigations_requires_auth_and_succeeds_for_admin():
    assert client.get("/api/v1/investigations/").status_code == 401
    response = client.get("/api/v1/investigations/", headers=_admin_headers())
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_community_reports():
    response = client.get("/api/v1/community/")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_recharge_suitability():
    response = client.get("/api/v1/recharge/")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_assistant_query():
    response = client.post("/api/v1/assistant/query", json={"prompt": "Ranipet groundwater status"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data


def test_analytics_summary():
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["total_stations"] >= 7


def test_maps_overview_disables_unverified_boundary_polygon():
    response = client.get("/api/v1/maps/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["basin_boundary_available"] is False
    polys = [f for f in data["features"] if f["geometry"]["type"] in ("Polygon", "MultiPolygon")]
    assert len(polys) == 0
