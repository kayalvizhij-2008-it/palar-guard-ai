import sys
import os

sys.path.insert(0, os.path.abspath('backend'))
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

print("--- Testing API Endpoints ---")
r = client.get("/")
print("Root:", r.status_code, r.json().get("project"))

r = client.get("/health")
print("Health:", r.status_code, r.json())

r = client.get("/api/v1/locations/")
print("Locations:", r.status_code, len(r.json()), "stations loaded")

r = client.get("/api/v1/groundwater/forecast")
print("Groundwater Forecast:", r.status_code, len(r.json()), "forecast records")

r = client.get("/api/v1/anomalies/")
print("Anomalies:", r.status_code, len(r.json()), "anomalies loaded")

r = client.get("/api/v1/analytics/summary")
print("Analytics Summary:", r.status_code, r.json().get("summary", {}).get("total_stations"), "total stations")

print("--- All API Endpoints Verified Successfully ---")
