import io
import os
import sys
from datetime import timedelta
import pytest
from fastapi.testclient import TestClient

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Use an isolated test SQLite database so tests never touch production/dev DB
TEST_DB_PATH = os.path.join(BACKEND_DIR, "test_security_suite.db")
if os.path.exists(TEST_DB_PATH):
    os.remove(TEST_DB_PATH)

os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"
os.environ["SECRET_KEY"] = "test-suite-strong-secret-key-at-least-32-chars"
os.environ["INITIAL_ADMIN_EMAIL"] = "secadmin@palarguard.test"
os.environ["INITIAL_ADMIN_PASSWORD"] = "StrongAdminPass#2026"

from app.main import app  # noqa: E402
from app.core.database import SessionLocal  # noqa: E402
from app.core.security import create_access_token, get_password_hash  # noqa: E402
from app.models.models import User  # noqa: E402
from app.seed_data import init_db  # noqa: E402

init_db()
client = TestClient(app)


def _login(email: str, password: str) -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


def _ensure_user(email: str, password: str, role: str, name: str) -> User:
    db = SessionLocal()
    try:
        u = db.query(User).filter(User.email == email).first()
        if not u:
            u = User(
                email=email,
                hashed_password=get_password_hash(password),
                full_name=name,
                role=role,
                is_active=True,
            )
            db.add(u)
            db.commit()
            db.refresh(u)
        return u
    finally:
        db.close()


def test_public_registration_blocks_administrator_and_privileged_roles():
    for forbidden_role in ["Administrator", "Environmental Analyst", "Field Investigator", "Researcher"]:
        res = client.post(
            "/api/v1/auth/register",
            json={
                "email": f"attacker_{forbidden_role.lower().replace(' ', '_')}@example.com",
                "password": "StrongPassword123",
                "full_name": "Escalation Attempt",
                "role": forbidden_role,
            },
        )
        assert res.status_code == 403, f"Role {forbidden_role} should be blocked from public registration"

    # Valid Community Reporter registration succeeds
    res_ok = client.post(
        "/api/v1/auth/register",
        json={
            "email": "citizen1@example.com",
            "password": "CitizenPassword123",
            "full_name": "Citizen One",
            "role": "Community Reporter",
        },
    )
    assert res_ok.status_code == 201
    assert res_ok.json()["role"] == "Community Reporter"


def test_anonymous_cannot_access_protected_endpoints():
    protected_calls = [
        ("GET", "/api/v1/auth/me"),
        ("GET", "/api/v1/investigations/"),
        ("POST", "/api/v1/investigations/"),
        ("PATCH", "/api/v1/investigations/1"),
        ("PATCH", "/api/v1/anomalies/1/status?new_status=Verified"),
        ("PATCH", "/api/v1/community/reports/1/status?new_status=Verified"),
        ("GET", "/api/v1/admin/users"),
        ("GET", "/api/v1/admin/audit-logs"),
        ("GET", "/api/v1/documents/"),
        ("GET", "/api/v1/monitoring/watchlist"),
    ]
    for method, path in protected_calls:
        res = client.request(method, path)
        assert res.status_code == 401, f"Anonymous {method} {path} returned {res.status_code}"


def test_invalid_and_expired_tokens_are_rejected():
    bad_headers = {"Authorization": "Bearer invalid.jwt.token"}
    assert client.get("/api/v1/auth/me", headers=bad_headers).status_code == 401
    assert client.get("/api/v1/investigations/", headers=bad_headers).status_code == 401

    # Expired token
    expired_token = create_access_token(
        subject="secadmin@palarguard.test",
        role="Administrator",
        expires_delta=timedelta(seconds=-10),
    )
    exp_headers = {"Authorization": f"Bearer {expired_token}"}
    assert client.get("/api/v1/auth/me", headers=exp_headers).status_code == 401
    assert client.get("/api/v1/admin/users", headers=exp_headers).status_code == 401


def test_community_user_blocked_from_admin_and_privileged_endpoints():
    _ensure_user("citizen_rbac@example.com", "CitizenRbac123", "Community Reporter", "Citizen RBAC")
    token = _login("citizen_rbac@example.com", "CitizenRbac123")
    headers = {"Authorization": f"Bearer {token}"}

    assert client.get("/api/v1/admin/users", headers=headers).status_code == 403
    assert client.get("/api/v1/admin/audit-logs", headers=headers).status_code == 403
    assert client.get("/api/v1/investigations/", headers=headers).status_code == 403
    assert (
        client.patch(
            "/api/v1/anomalies/1/status?new_status=Verified",
            headers=headers,
        ).status_code
        == 403
    )
    assert (
        client.patch(
            "/api/v1/community/reports/1/status?new_status=Verified",
            headers=headers,
        ).status_code
        == 403
    )
    assert (
        client.patch(
            "/api/v1/auth/users/1/role",
            json={"role": "Administrator"},
            headers=headers,
        ).status_code
        == 403
    )


def test_ownership_enforcement_on_reports_documents_and_investigations():
    _ensure_user("user_a@example.com", "PasswordA123!", "Community Reporter", "User A")
    _ensure_user("user_b@example.com", "PasswordB123!", "Community Reporter", "User B")
    _ensure_user("inv_other@example.com", "Investigator123!", "Field Investigator", "Unassigned Officer")

    token_a = _login("user_a@example.com", "PasswordA123!")
    token_b = _login("user_b@example.com", "PasswordB123!")
    token_inv = _login("inv_other@example.com", "Investigator123!")

    # User A creates a community report
    rep_res = client.post(
        "/api/v1/community/reports",
        json={"location_id": 1, "category": "Well Depletion", "description": "Water level dropped sharply."},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert rep_res.status_code == 201
    report_id = rep_res.json()["id"]

    # User B cannot modify User A's report
    mod_res = client.patch(
        f"/api/v1/community/reports/{report_id}",
        json={"description": "Tampered by B"},
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert mod_res.status_code == 403

    # User A uploads a document
    up_res = client.post(
        "/api/v1/documents/upload",
        files={"file": ("well_log.txt", io.BytesIO(b"Ranipet Well Depth: 14.9 mbgl\nTDS: 1850 mg/L\nChromium: 0.082 mg/L"), "text/plain")},
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert up_res.status_code == 201
    doc_id = up_res.json()["id"]

    # User B cannot read, analyze, export, or delete User A's document
    assert client.get(f"/api/v1/documents/{doc_id}", headers={"Authorization": f"Bearer {token_b}"}).status_code == 403
    assert (
        client.post(
            f"/api/v1/documents/{doc_id}/analyze",
            json={"task_type": "summarise", "instruction": "Summarise", "language": "en"},
            headers={"Authorization": f"Bearer {token_b}"},
        ).status_code
        == 403
    )
    assert client.get(f"/api/v1/documents/{doc_id}/export", headers={"Authorization": f"Bearer {token_b}"}).status_code == 403
    assert client.delete(f"/api/v1/documents/{doc_id}", headers={"Authorization": f"Bearer {token_b}"}).status_code == 403

    # Unassigned Field Investigator cannot modify an investigation assigned to Aarthi L
    inv_patch = client.patch(
        "/api/v1/investigations/1",
        json={"status": "Resolved"},
        headers={"Authorization": f"Bearer {token_inv}"},
    )
    assert inv_patch.status_code == 403


def test_admin_authorized_workflow_and_document_intelligence():
    admin_token = _login("secadmin@palarguard.test", "StrongAdminPass#2026")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin can access admin endpoints
    assert client.get("/api/v1/admin/users", headers=headers).status_code == 200
    assert client.get("/api/v1/admin/audit-logs", headers=headers).status_code == 200
    assert client.get("/api/v1/admin/system-status", headers=headers).status_code == 200

    # Admin can create and update investigation
    inv_res = client.post(
        "/api/v1/investigations/",
        json={"location_id": 1, "title": "Security Test Inspection", "priority": "High", "assigned_to": "Aarthi L"},
        headers=headers,
    )
    assert inv_res.status_code == 201
    inv_id = inv_res.json()["id"]
    assert client.patch(f"/api/v1/investigations/{inv_id}", json={"status": "In Progress"}, headers=headers).status_code == 200

    # CSV upload + extraction + analysis + export
    csv_bytes = b"Station,Depth_mbgl,TDS_mg_L,Chromium_mg_L\nRanipet,14.9,1850,0.082\nWalajapet,11.2,620,0.010\n"
    up_csv = client.post(
        "/api/v1/documents/upload",
        files={"file": ("palar_samples.csv", io.BytesIO(csv_bytes), "text/csv")},
        headers=headers,
    )
    assert up_csv.status_code == 201
    csv_doc = up_csv.json()
    assert csv_doc["extraction_status"] == "extracted"
    assert len(csv_doc["tables"]) == 1

    # Tamil translation analysis
    ana_res = client.post(
        f"/api/v1/documents/{csv_doc['id']}/analyze",
        json={"task_type": "translate_tamil", "instruction": "Translate findings into Tamil", "language": "ta"},
        headers=headers,
    )
    assert ana_res.status_code == 200
    ana = ana_res.json()
    assert "ஆவண" in ana["result_markdown"]
    assert ana["provider_mode"] == "deterministic_extraction"

    # Image upload honestly reports OCR unavailable and refuses fake analysis
    from PIL import Image

    buf = io.BytesIO()
    Image.new("RGB", (32, 32), color=(16, 185, 129)).save(buf, format="PNG")
    buf.seek(0)
    up_img = client.post(
        "/api/v1/documents/upload",
        files={"file": ("scan.png", buf, "image/png")},
        headers=headers,
    )
    assert up_img.status_code == 201
    img_doc = up_img.json()
    assert img_doc["extraction_status"] == "ocr_unavailable"

    fail_ana = client.post(
        f"/api/v1/documents/{img_doc['id']}/analyze",
        json={"task_type": "summarise", "instruction": "Summarise", "language": "en"},
        headers=headers,
    )
    assert fail_ana.status_code == 422


def test_production_config_requires_strong_secret_and_valid_cors():
    from app.core.config import Settings

    with pytest.raises(RuntimeError):
        Settings(ENVIRONMENT="production", SECRET_KEY="weak")

    s = Settings(
        ENVIRONMENT="production",
        SECRET_KEY="A_Very_Strong_Random_Production_Secret_Key_2026_XYZ",
    )
    os.environ["CORS_ORIGINS"] = "*"
    try:
        with pytest.raises(RuntimeError):
            s.get_cors_origins()
    finally:
        os.environ.pop("CORS_ORIGINS", None)


def test_sample_pdf_listing_extraction_and_nitrate_qa():
    from pathlib import Path

    samples_res = client.get("/api/v1/documents/samples")
    assert samples_res.status_code == 200
    payload = samples_res.json()
    assert "DEMONSTRATION DATA ONLY" in payload["warning"]
    assert len(payload["samples"]) == 3

    sample_pdf = (
        Path(__file__).resolve().parents[2]
        / "frontend"
        / "public"
        / "samples"
        / "palar_water_quality_lab_sample.pdf"
    )
    assert sample_pdf.exists()

    admin_token = _login("secadmin@palarguard.test", "StrongAdminPass#2026")
    headers = {"Authorization": f"Bearer {admin_token}"}

    with open(sample_pdf, "rb") as fh:
        up = client.post(
            "/api/v1/documents/upload",
            files={"file": (sample_pdf.name, fh, "application/pdf")},
            headers=headers,
        )
    assert up.status_code == 201
    doc = up.json()
    assert doc["extraction_status"] == "extracted"
    assert doc["page_count"] == 2
    assert "[Page 1]" in doc["extracted_text"]

    # Grounded QA against real uploaded PDF content
    qa = client.post(
        f"/api/v1/documents/{doc['id']}/analyze",
        json={
            "task_type": "answer_question",
            "instruction": "Which sample has the highest nitrate result?",
            "language": "en",
        },
        headers=headers,
    )
    assert qa.status_code == 200
    qa_data = qa.json()
    assert "71.8" in qa_data["result_markdown"]
    assert "Page" in qa_data["result_markdown"]

    # Honest refusal / absent handling for unmentioned analyte
    absent = client.post(
        f"/api/v1/documents/{doc['id']}/analyze",
        json={
            "task_type": "answer_question",
            "instruction": "What is the dissolved mercury concentration?",
            "language": "en",
        },
        headers=headers,
    )
    assert absent.status_code == 200
    assert "absent" in absent.json()["result_markdown"].lower()

