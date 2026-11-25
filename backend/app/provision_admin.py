"""Explicit initial-administrator provisioning CLI.

Usage:
  python -m app.provision_admin --email admin@example.org --name "Admin Name"
Reads password securely from INITIAL_ADMIN_PASSWORD env var or interactive prompt.
Never logs or prints passwords.
"""

import argparse
import getpass
import os
import sys
from .core.database import SessionLocal, Base, engine
from .core.security import get_password_hash
from .models.models import User, AuditLog


def main() -> int:
    parser = argparse.ArgumentParser(description="Provision an initial PALAR GUARD AI administrator.")
    parser.add_argument("--email", required=False, default=os.getenv("INITIAL_ADMIN_EMAIL", ""))
    parser.add_argument("--name", required=False, default=os.getenv("INITIAL_ADMIN_NAME", "Basin Administrator"))
    args = parser.parse_args()

    email = args.email.strip().lower()
    if not email or "@" not in email:
        print("Error: a valid --email or INITIAL_ADMIN_EMAIL is required.", file=sys.stderr)
        return 1

    password = os.getenv("INITIAL_ADMIN_PASSWORD", "")
    if not password:
        password = getpass.getpass("Enter administrator password (min 12 chars): ")
        confirm = getpass.getpass("Confirm administrator password: ")
        if password != confirm:
            print("Error: passwords do not match.", file=sys.stderr)
            return 1

    if len(password) < 12:
        print("Error: password must be at least 12 characters.", file=sys.stderr)
        return 1

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"Administrator or user already exists for {email}.")
            return 0

        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=args.name.strip() or "Basin Administrator",
            role="Administrator",
            is_active=True,
        )
        db.add(user)
        db.add(
            AuditLog(
                user_email=email,
                action="CLI_ADMIN_PROVISIONED",
                entity="USER",
                details=f"Initial administrator provisioned for {email}.",
            )
        )
        db.commit()
        print(f"Provisioned administrator account for {email}.")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
