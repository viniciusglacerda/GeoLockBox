from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --- Configuração do banco de dados ---
DATABASE_URL = "sqlite:///./geolockbox.db"  # Banco SQLite local

# Cria engine de conexão
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}  # Necessário para SQLite
)

# Cria sessão de conexão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declarativa para os models
Base = declarative_base()


# Função auxiliar para obter sessão em endpoints FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
