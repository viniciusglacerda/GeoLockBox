from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.user_routes import router as user_router
from app.routes.device_routes import router as device_router
from app.routes.auth_routes import router as auth_router

app = FastAPI(
    title="GeoLockBox API",
    description="API para gerenciamento do sistema GeoLockBox - dispositivos inteligentes de segurança em entregas",
    version="1.0.0"
)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(device_router, prefix="/devices", tags=["Devices"])
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do GeoLockBox!"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
