from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}
engine_kwargs: dict = {"connect_args": connect_args}

if not is_sqlite:
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300
    # Enforce TLS for hosted Supabase / managed PostgreSQL unless explicitly overridden in URL
    if ("supabase" in settings.DATABASE_URL or settings.is_production) and "sslmode=" not in settings.DATABASE_URL:
        connect_args["sslmode"] = "require"

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

if is_sqlite:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragmas(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
