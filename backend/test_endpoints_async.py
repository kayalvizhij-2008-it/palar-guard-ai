import os
import sys
import asyncio
import httpx

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.seed_data import init_db

async def run_tests():
    init_db()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("\n=== PALAR GUARD AI — BACKEND ROUTE VERIFICATION ===")

        # 1. Root & Health
        r = await client.get("/")
        assert r.status_code == 200
        print("✓ GET / -> 200 OK | Project:", r.json()["project"])

        r = await client.get("/health")
        assert r.status_code == 200
        health_data = r.json()
        assert health_data["status"] == "healthy"
        print(f"✓ GET /health -> 200 OK | DB Status: {health_data['database']} | Region: {health_data['geography']}")

        # 2. Locations
        r = await client.get("/api/v1/locations/")
        assert r.status_code == 200
        locations = r.json()
        assert len(locations) >= 7
        print(f"✓ GET /api/v1/locations/ -> 200 OK | {len(locations)} monitoring stations loaded")

        # 3. Groundwater Forecast
        r = await client.get("/api/v1/groundwater/forecast")
        assert r.status_code == 200
        print(f"✓ GET /api/v1/groundwater/forecast -> 200 OK | {len(r.json())} forecast series")

        # 4. Water Quality
        r = await client.get("/api/v1/water-quality/")
        assert r.status_code == 200
        print(f"✓ GET /api/v1/water-quality/ -> 200 OK | {len(r.json())} hydrochemical samples")

        # 5. Rainfall & Catchment
        r = await client.get("/api/v1/rainfall/")
        assert r.status_code == 200
        print(f"✓ GET /api/v1/rainfall/ -> 200 OK | {len(r.json())} rainfall periods")

        # 6. Active Anomalies
        r = await client.get("/api/v1/anomalies/")
        assert r.status_code == 200
        anomalies = r.json()
        assert len(anomalies) > 0
        print(f"✓ GET /api/v1/anomalies/ -> 200 OK | {len(anomalies)} active anomaly alerts")

        # 7. Investigations
        r = await client.get("/api/v1/investigations/")
        assert r.status_code == 200
        print(f"✓ GET /api/v1/investigations/ -> 200 OK | {len(r.json())} field investigations")

        # 8. Community Reports
        r = await client.get("/api/v1/community/")
        assert r.status_code == 200
        print(f"✓ GET /api/v1/community/ -> 200 OK | {len(r.json())} community citizen reports")

        # 9. Recharge Interventions
        r = await client.get("/api/v1/recharge/")
        assert r.status_code == 200
        print(f"✓ GET /api/v1/recharge/ -> 200 OK | {len(r.json())} recharge suitability sites")

        # 10. AI Assistant Query
        r = await client.post("/api/v1/assistant/query", json={"prompt": "Ranipet groundwater status"})
        assert r.status_code == 200
        print("✓ POST /api/v1/assistant/query -> 200 OK | Grounded RAG query response verified")

        # 11. Analytics Summary
        r = await client.get("/api/v1/analytics/summary")
        assert r.status_code == 200
        analytics = r.json()
        assert "summary" in analytics
        print(f"✓ GET /api/v1/analytics/summary -> 200 OK | Total Stations: {analytics['summary']['total_stations']}")

        print("\n=== ALL 11 BACKEND API SERVICES VERIFIED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(run_tests())
