from fastapi import APIRouter

from app.routes.auth_routes import router as auth_router
from app.routes.user_routes import router as user_router
from app.routes.device_routes import router as device_router
from app.routes.delivery_routes import router as delivery_router
from app.routes.telemetry_routes import router as telemetry_routes
from app.routes.logs_routes import router as log_router


routes = APIRouter()


routes.include_router(auth_router, prefix="/auth", tags=["Authentication"])
routes.include_router(user_router, prefix="/users", tags=["Users"])
routes.include_router(device_router, prefix="/devices", tags=["Devices"])
routes.include_router(delivery_router, prefix="/deliveries", tags=["Deliveries"])
routes.include_router(telemetry_routes, prefix="/telemetry", tags=["Telemetry"])
routes.include_router(log_router, prefix="/logs", tags=["Logs"])
