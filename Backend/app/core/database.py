from sqlmodel import create_engine, Session
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_FILE = os.path.join(BASE_DIR, "geolockbox.db")
sqlite_url = f"sqlite:///{os.path.join(BASE_DIR, DB_FILE)}"

engine = create_engine(sqlite_url, echo=False, connect_args={"check_same_thread": False})

def get_session():
    with Session(engine) as session:
        yield session

