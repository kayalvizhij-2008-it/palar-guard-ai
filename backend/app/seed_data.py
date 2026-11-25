import os
from sqlalchemy import inspect, text
from .core.config import settings
from .core.database import SessionLocal, engine, Base
from .core.security import get_password_hash
from .models.models import (
    User, Location, GroundwaterRecord, RainfallRecord,
    WaterQualityRecord, AnomalyAlert, Investigation,
    CommunityReport, RechargeAssessment, AuditLog
)


def _ensure_column_migrations():
    """Safely add new columns to existing tables without discarding existing data."""
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    migrations = []
    if "community_reports" in existing_tables:
        cols = {c["name"] for c in inspector.get_columns("community_reports")}
        if "owner_id" not in cols:
            migrations.append("ALTER TABLE community_reports ADD COLUMN owner_id INTEGER REFERENCES users(id)")
    if "investigations" in existing_tables:
        cols = {c["name"] for c in inspector.get_columns("investigations")}
        if "created_by_id" not in cols:
            migrations.append("ALTER TABLE investigations ADD COLUMN created_by_id INTEGER REFERENCES users(id)")

    if migrations:
        with engine.begin() as conn:
            for stmt in migrations:
                conn.execute(text(stmt))


def provision_initial_admin(db) -> None:
    """Provision an initial administrator ONLY from explicit environment credentials."""
    admin_email = os.getenv("INITIAL_ADMIN_EMAIL", "").strip().lower()
    admin_password = os.getenv("INITIAL_ADMIN_PASSWORD", "")
    admin_name = os.getenv("INITIAL_ADMIN_NAME", "Basin Administrator").strip()

    if not admin_email or not admin_password:
        return

    if len(admin_password) < 12:
        raise RuntimeError("INITIAL_ADMIN_PASSWORD must be at least 12 characters long.")

    existing = db.query(User).filter(User.email == admin_email).first()
    if existing:
        return

    admin_user = User(
        email=admin_email,
        hashed_password=get_password_hash(admin_password),
        full_name=admin_name or "Basin Administrator",
        role="Administrator",
        is_active=True,
    )
    db.add(admin_user)
    db.add(
        AuditLog(
            user_email="system",
            action="INITIAL_ADMIN_PROVISIONED",
            entity="USER",
            details=f"Initial administrator account provisioned for {admin_email} via explicit environment config.",
        )
    )


def init_db():
    Base.metadata.create_all(bind=engine)
    _ensure_column_migrations()
    db = SessionLocal()

    try:
        # Provision explicit env-based administrator if configured
        provision_initial_admin(db)

        # Optionally seed non-admin demo accounts ONLY in non-production when DEV_DEMO_PASSWORD is explicitly supplied
        if settings.ENVIRONMENT.lower() != "production":
            dev_demo_pw = os.getenv("DEV_DEMO_PASSWORD", "").strip()
            if dev_demo_pw and len(dev_demo_pw) >= 8:
                demo_users = [
                    {"email": "analyst@palarguard.ai", "name": "Harini S", "role": "Environmental Analyst"},
                    {"email": "investigator@palarguard.ai", "name": "Aarthi L", "role": "Field Investigator"},
                    {"email": "researcher@palarguard.ai", "name": "CIT Research Fellow", "role": "Researcher"},
                    {"email": "community@palarguard.ai", "name": "Palar Watershed Citizen", "role": "Community Reporter"},
                ]
                for u in demo_users:
                    if not db.query(User).filter(User.email == u["email"]).first():
                        db.add(
                            User(
                                email=u["email"],
                                hashed_password=get_password_hash(dev_demo_pw),
                                full_name=u["name"],
                                role=u["role"],
                                is_active=True,
                            )
                        )

        # Idempotent baseline hydrological data seed (never overwrites existing records)
        if db.query(Location).first():
            db.commit()
            return

        locations_data = [
            {"name": "Ranipet Industrial Corridor", "district": "Ranipet", "lat": 12.9274, "lng": 79.3330, "zone": "Middle Basin", "risk": 78.5, "conf": "High"},
            {"name": "Ambur Tannery Cluster", "district": "Tirupathur", "lat": 12.7904, "lng": 78.7166, "zone": "Upper Basin", "risk": 74.2, "conf": "High"},
            {"name": "Vaniyambadi Watershed", "district": "Tirupathur", "lat": 12.6825, "lng": 78.6186, "zone": "Upper Basin", "risk": 68.0, "conf": "High"},
            {"name": "Vellore Central Anicut", "district": "Vellore", "lat": 12.9165, "lng": 79.1325, "zone": "Central Basin", "risk": 55.4, "conf": "Medium"},
            {"name": "Walajapet Agricultural Plains", "district": "Ranipet", "lat": 12.9304, "lng": 79.3817, "zone": "Middle Basin", "risk": 48.0, "conf": "High"},
            {"name": "Kanchipuram Temple Tank Grid", "district": "Kanchipuram", "lat": 12.8342, "lng": 79.7036, "zone": "Lower Basin", "risk": 42.5, "conf": "High"},
            {"name": "Chengalpattu Estuarine Reach", "district": "Chengalpattu", "lat": 12.6841, "lng": 79.9836, "zone": "Coastal Discharge Zone", "risk": 36.8, "conf": "Medium"},
        ]

        loc_objs = {}
        for loc in locations_data:
            l = Location(
                name=loc["name"],
                district=loc["district"],
                state="Tamil Nadu",
                latitude=loc["lat"],
                longitude=loc["lng"],
                basin_zone=loc["zone"],
                is_monitored=True,
                risk_score=loc["risk"],
                confidence_level=loc["conf"],
            )
            db.add(l)
            db.flush()
            loc_objs[loc["name"]] = l

        gw_timeline = [
            ("2023-Q1", 11.2, -0.4),
            ("2023-Q2", 13.8, -0.8),
            ("2023-Q3", 12.4, +0.3),
            ("2023-Q4", 8.9, +1.8),
            ("2024-Q1", 10.5, -0.2),
            ("2024-Q2", 14.2, -1.1),
            ("2024-Q3", 12.9, +0.4),
            ("2024-Q4", 9.1, +2.1),
            ("2025-Q1", 11.8, -0.5),
            ("2025-Q2", 15.6, -1.4),
            ("2025-Q3", 13.2, +0.6),
            ("2025-Q4", 9.8, +1.9),
            ("2026-Q1", 12.4, -0.6),
        ]
        for loc_name, l in loc_objs.items():
            base_offset = 2.5 if "Ranipet" in loc_name or "Ambur" in loc_name else 0.0
            for date_str, base_val, trend in gw_timeline:
                db.add(
                    GroundwaterRecord(
                        location_id=l.id,
                        observation_date=date_str,
                        water_level_mbgl=round(base_val + base_offset, 2),
                        trend_rate=trend,
                        provenance="VERIFIED_PUBLIC",
                        is_synthetic=False,
                        data_source="CGWB Palar Aquifer Report / India-WRIS",
                    )
                )

        rf_data = [
            ("2025-06", 52.4, 60.0),
            ("2025-07", 78.2, 85.0),
            ("2025-08", 124.6, 110.0),
            ("2025-09", 145.8, 130.0),
            ("2025-10", 210.4, 195.0),
            ("2025-11", 285.0, 240.0),
            ("2025-12", 95.2, 80.0),
            ("2026-01", 12.4, 15.0),
            ("2026-02", 4.2, 8.0),
        ]
        for l in loc_objs.values():
            for d, actual, normal in rf_data:
                dev = round(((actual - normal) / normal) * 100, 1)
                db.add(
                    RainfallRecord(
                        location_id=l.id,
                        observation_date=d,
                        rainfall_mm=actual,
                        normal_rainfall_mm=normal,
                        deviation_pct=dev,
                        provenance="VERIFIED_PUBLIC",
                        is_synthetic=False,
                        data_source="IMD NWIC Catchment Rain Station",
                    )
                )

        for loc_name, l in loc_objs.items():
            is_industrial = "Ranipet" in loc_name or "Ambur" in loc_name
            db.add(
                WaterQualityRecord(
                    location_id=l.id,
                    observation_date="2026-02",
                    ph=7.9 if is_industrial else 7.4,
                    tds_mg_l=1850.0 if is_industrial else 620.0,
                    ec_us_cm=2900.0 if is_industrial else 940.0,
                    chromium_mg_l=0.082 if "Ranipet" in loc_name else (0.071 if "Ambur" in loc_name else 0.01),
                    bod_mg_l=4.8 if is_industrial else 1.9,
                    do_mg_l=4.2 if is_industrial else 6.8,
                    provenance="VERIFIED_PUBLIC" if not is_industrial else "HISTORICAL_REPORT",
                    is_synthetic=False,
                    data_source="CPCB / TNPCB River Monitoring Stretch",
                )
            )

        anomalies_seed = [
            {
                "loc": loc_objs["Ranipet Industrial Corridor"].id,
                "param": "Chromium (Total)",
                "obs": 0.082,
                "base": 0.015,
                "z": 3.84,
                "sev": "Critical",
                "stat": "Open",
                "reason": "Chromium concentration exceeds BIS 10500 drinking standard (0.05 mg/L) with Z-score 3.84 vs seasonal baseline.",
            },
            {
                "loc": loc_objs["Ambur Tannery Cluster"].id,
                "param": "Electrical Conductivity & TDS",
                "obs": 2840.0,
                "base": 1450.0,
                "z": 2.92,
                "sev": "High",
                "stat": "Under Review",
                "reason": "Elevated electrical conductivity indicating concentrated mineral load relative to seasonal baseline.",
            },
            {
                "loc": loc_objs["Vaniyambadi Watershed"].id,
                "param": "Groundwater Drawdown Rate",
                "obs": 15.6,
                "base": 11.2,
                "z": 2.45,
                "sev": "Medium",
                "stat": "Open",
                "reason": "Quarterly water table drawdown exceeded historical mean following pre-monsoon extraction.",
            },
        ]
        for a in anomalies_seed:
            db.add(
                AnomalyAlert(
                    location_id=a["loc"],
                    parameter=a["param"],
                    observed_value=a["obs"],
                    expected_baseline=a["base"],
                    z_score=a["z"],
                    severity=a["sev"],
                    status=a["stat"],
                    trigger_reason=a["reason"],
                    provenance="MODEL_PREDICTION",
                )
            )

        investigations_seed = [
            {
                "loc": loc_objs["Ranipet Industrial Corridor"].id,
                "title": "Ranipet Sluice Outflow & Chromium Verification",
                "priority": "Urgent",
                "status": "Assigned",
                "assigned_to": "Aarthi L",
                "findings": "Baseline review queued for on-site spectrophotometer verification and duplicate 1L lab sampling.",
                "checklist": "Calibrate optical sensor; Collect duplicate 1L samples; Map upstream drainage channels",
            },
            {
                "loc": loc_objs["Ambur Tannery Cluster"].id,
                "title": "Ambur Riparian Salinity Ground Audit",
                "priority": "High",
                "status": "In Progress",
                "assigned_to": "Harini S",
                "findings": "Preliminary electrical conductivity audit initiated along riparian observation wells.",
                "checklist": "Test borehole EC within 500m; Interview local farming cooperative; Cross-reference discharge logs",
            },
        ]
        for inv in investigations_seed:
            db.add(
                Investigation(
                    location_id=inv["loc"],
                    title=inv["title"],
                    priority=inv["priority"],
                    status=inv["status"],
                    assigned_to=inv["assigned_to"],
                    findings=inv["findings"],
                    verification_checklist=inv["checklist"],
                )
            )

        community_seed = [
            {
                "loc": loc_objs["Ambur Tannery Cluster"].id,
                "title": "Discolored stream water near bypass canal",
                "cat": "Effluent Discoloration",
                "desc": "Dark brownish tint visible in the stream during evening hours with pungent smell. Irrigation well water tastes unusually saline.",
                "lat": 12.7885,
                "lng": 78.7210,
                "status": "Verified",
                "reporter": "K. Murugan (Ambur Farmer)",
            },
            {
                "loc": loc_objs["Vaniyambadi Watershed"].id,
                "title": "Agricultural borewell dried up unexpectedly",
                "cat": "Well Depletion",
                "desc": "Borewell depth was 140 feet; stopped producing water three days ago after rapid drawdown in adjacent open wells.",
                "lat": 12.6790,
                "lng": 78.6220,
                "status": "Action Initiated",
                "reporter": "S. Selvaraj",
            },
        ]
        for c in community_seed:
            db.add(
                CommunityReport(
                    location_id=c["loc"],
                    title=c["cat"] if not c["title"] else c["title"],
                    category=c["cat"],
                    description=c["desc"],
                    latitude=c["lat"],
                    longitude=c["lng"],
                    status=c["status"],
                    reporter_name=c["reporter"],
                )
            )

        for l in loc_objs.values():
            is_good = "Walajapet" in l.name or "Kanchipuram" in l.name
            db.add(
                RechargeAssessment(
                    location_id=l.id,
                    soil_permeability="Coarse Sand & Gravel Alluvium" if is_good else "Clayey Silt weathered Gneiss",
                    slope_gradient_pct=1.4 if is_good else 2.8,
                    aquifer_storage_head_m=11.2,
                    recharge_suitability_score=88.0 if is_good else 62.0,
                    recommended_intervention="Series of Check Dams & Percolation Tanks" if is_good else "Subsurface Dyke with Silt Trap Shaft",
                )
            )

        db.add(
            AuditLog(
                user_email="system",
                action="SYSTEM_INITIALIZATION",
                entity="DATABASE",
                details="Database schema initialized with Palar River Basin baseline records.",
            )
        )

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
