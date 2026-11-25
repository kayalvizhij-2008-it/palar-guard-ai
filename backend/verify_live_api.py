import urllib.request
import json
import sys

def test_endpoint(url, method="GET", payload=None):
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    data = None
    if payload:
        data = json.dumps(payload).encode("utf-8")
    
    try:
        with urllib.request.urlopen(req, data=data, timeout=5) as response:
            res_body = response.read().decode("utf-8")
            status = response.status
            return status, json.loads(res_body)
    except Exception as e:
        return 500, str(e)

def main():
    print("=== LIVE FASTAPI BACKEND VERIFICATION ===")
    base = "http://127.0.0.1:8000"

    tests = [
        ("GET /", f"{base}/", "GET", None),
        ("GET /health", f"{base}/health", "GET", None),
        ("GET /api/v1/locations/", f"{base}/api/v1/locations/", "GET", None),
        ("GET /api/v1/groundwater/forecast", f"{base}/api/v1/groundwater/forecast", "GET", None),
        ("GET /api/v1/water-quality/", f"{base}/api/v1/water-quality/", "GET", None),
        ("GET /api/v1/rainfall/", f"{base}/api/v1/rainfall/", "GET", None),
        ("GET /api/v1/anomalies/", f"{base}/api/v1/anomalies/", "GET", None),
        ("GET /api/v1/investigations/", f"{base}/api/v1/investigations/", "GET", None),
        ("GET /api/v1/community/", f"{base}/api/v1/community/", "GET", None),
        ("GET /api/v1/recharge/", f"{base}/api/v1/recharge/", "GET", None),
        ("POST /api/v1/assistant/query", f"{base}/api/v1/assistant/query", "POST", {"prompt": "Ranipet groundwater status"}),
        ("GET /api/v1/analytics/summary", f"{base}/api/v1/analytics/summary", "GET", None),
        ("GET /api/v1/maps/overview", f"{base}/api/v1/maps/overview", "GET", None),
        ("GET /api/v1/maps/layers", f"{base}/api/v1/maps/layers", "GET", None),
        ("GET /api/v1/maps/stations", f"{base}/api/v1/maps/stations", "GET", None),
        ("GET /api/v1/maps/stations/1", f"{base}/api/v1/maps/stations/1", "GET", None),
        ("GET /api/v1/maps/groundwater", f"{base}/api/v1/maps/groundwater", "GET", None),
        ("GET /api/v1/maps/rainfall", f"{base}/api/v1/maps/rainfall", "GET", None),
        ("GET /api/v1/maps/water-quality", f"{base}/api/v1/maps/water-quality", "GET", None),
        ("GET /api/v1/maps/anomalies", f"{base}/api/v1/maps/anomalies", "GET", None),
        ("GET /api/v1/maps/risks", f"{base}/api/v1/maps/risks", "GET", None),
        ("GET /api/v1/maps/community-reports", f"{base}/api/v1/maps/community-reports", "GET", None),
        ("GET /api/v1/maps/investigations", f"{base}/api/v1/maps/investigations", "GET", None),
        ("GET /api/v1/maps/recharge", f"{base}/api/v1/maps/recharge", "GET", None),
        ("GET /api/v1/maps/locations/search", f"{base}/api/v1/maps/locations/search?q=Ranipet", "GET", None),
    ]

    passed = 0
    for name, url, method, payload in tests:
        status, data = test_endpoint(url, method, payload)
        if status == 200:
            print(f"✓ {name:<32} -> {status} OK")
            passed += 1
        else:
            print(f"✗ {name:<32} -> {status} ERROR: {data}")

    print(f"\nResults: {passed}/{len(tests)} endpoints verified operational.")
    if passed == len(tests):
        print("STATUS: ALL API SERVICES VERIFIED & READY FOR PRODUCTION.")
        sys.exit(0)
    else:
        print("STATUS: SOME ENDPOINTS FAILED.")
        sys.exit(1)

if __name__ == "__main__":
    main()
