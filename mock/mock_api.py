from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from pathlib import Path
import json
import threading
from datetime import datetime

DATA_FILE = Path("mock.json")
_lock = threading.Lock()

app = FastAPI(title="GeoLockBox - Mock API", version="mvp-2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.options("/{full_path:path}")
async def handle_preflight(full_path: str):
    return JSONResponse(
        content={"message": "CORS preflight response"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
        }
    )

# ---------------------------
# Helpers de leitura/escrita
# ---------------------------
def read_mock() -> dict:
    with _lock:
        if not DATA_FILE.exists():
            print("mock.json não encontrado.")
            return {}
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))

def write_mock(data: dict):
    with _lock:
        DATA_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

# ---------------------------
# Modelos Pydantic
# ---------------------------
class LoginIn(BaseModel):
    username: str
    password: str

class TelemetryIn(BaseModel):
    latitude: float
    longitude: float
    speed: Optional[float] = None

class DeliveryIn(BaseModel):
    order_number: Optional[str]
    receiver_name: Optional[str]
    address_street: Optional[str]
    address_number: Optional[str]
    address_city: Optional[str]
    address_state: Optional[str]
    address_zip: Optional[str]
    status: Optional[str] = "pending"
    device_id: Optional[str] = None
    driver_id: Optional[str] = None
    dest_lat: Optional[float]
    dest_lon: Optional[float]
    geofence_radius: Optional[int]

class GeofenceIn(BaseModel):
    center: List[float]  # [lat, lon]
    radius_m: int

class AssignIn(BaseModel):
    device_id: str
    delivery_id: Optional[str] = None
    driver_id: Optional[str] = None

# ---------------------------
# AUTENTICAÇÃO
# ---------------------------
@app.post("/mock/auth/login")
def login(payload: LoginIn):
    data = read_mock()
    users = data.get("users", [])
    user = next(
        (u for u in users if (u["username"] == payload.username or u["email"] == payload.username) and u["password"] == payload.password),
        None
    )
    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")

    return {
        "token": f"mock-token-{user['id']}",
        "user": {"id": user["id"], "username": user["username"], "role": user["role"]}
    }

# ---------------------------
# DEVICES
# ---------------------------
@app.get("/mock/devices")
def list_devices():
    return read_mock().get("devices", [])

@app.get("/mock/device/{device_id}")
def get_device(device_id: str):
    data = read_mock()
    dev = next((d for d in data.get("devices", []) if d["id"] == device_id), None)
    if not dev:
        raise HTTPException(status_code=404, detail="device not found")
    return dev

@app.post("/mock/device/{device_id}/telemetry")
def push_telemetry(device_id: str, t: TelemetryIn):
    data = read_mock()
    dev = next((d for d in data.get("devices", []) if d["id"] == device_id), None)
    if not dev:
        raise HTTPException(status_code=404, detail="device not found")

    tel = {
        "id": f"TEL-{int(datetime.utcnow().timestamp())}",
        "device_id": device_id,
        "latitude": t.latitude,
        "longitude": t.longitude,
        "speed": t.speed,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

    data.setdefault("telemetry", []).append(tel)
    dev["latitude"] = t.latitude
    dev["longitude"] = t.longitude
    dev["last_update"] = tel["timestamp"]
    if t.speed is not None:
        dev["status"] = "in_transit" if t.speed > 0.5 else "idle"

    write_mock(data)
    return {"ok": True, "telemetry": tel, "device": dev}

# ---------------------------
# DELIVERIES
# ---------------------------
@app.get("/mock/deliveries")
def list_deliveries():
    return read_mock().get("deliveries", [])

@app.get("/mock/delivery/{delivery_id}")
def get_delivery(delivery_id: str):
    data = read_mock()
    item = next((d for d in data.get("deliveries", []) if d["id"] == delivery_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="delivery not found")
    return item

@app.post("/mock/delivery")
def create_delivery(payload: DeliveryIn):
    data = read_mock()

    new_id = f"DEL-{int(datetime.utcnow().timestamp())}"

    delivery = payload.dict(exclude_none=True)
    delivery["id"] = new_id

    data.setdefault("deliveries", []).append(delivery)
    write_mock(data)

    return delivery

@app.put("/mock/delivery/{delivery_id}")
def update_delivery(delivery_id: str, payload: DeliveryIn):
    data = read_mock()
    delivery = next((d for d in data.get("deliveries", []) if d["id"] == delivery_id), None)

    if not delivery:
        raise HTTPException(status_code=404, detail="delivery not found")

    for k, v in payload.dict(exclude_none=True).items():
        delivery[k] = v

    write_mock(data)
    return delivery

@app.delete("/mock/delivery/{delivery_id}")
def delete_delivery(delivery_id: str):
    data = read_mock()
    before = len(data.get("deliveries", []))
    data["deliveries"] = [d for d in data.get("deliveries", []) if d["id"] != delivery_id]
    after = len(data["deliveries"])

    write_mock(data)
    return {"deleted": before - after}

# ---------------------------
# TRACKING — AGORA USA ORDER_NUMBER
# ---------------------------
@app.get("/mock/track/{order_number}")
def track(order_number: str):
    data = read_mock()
    delivery = next((d for d in data.get("deliveries", []) if d["order_number"] == order_number), None)
    if not delivery:
        raise HTTPException(status_code=404, detail="order_number not found")

    dev = next((d for d in data.get("devices", []) if d["id"] == delivery.get("device_id")), None)
    telemetry = [t for t in data.get("telemetry", []) if t["device_id"] == delivery.get("device_id")]
    telemetry = sorted(telemetry, key=lambda x: x.get("timestamp", ""), reverse=True)
    last_tel = telemetry[0] if telemetry else None

    return {"delivery": delivery, "device": dev, "last_telemetry": last_tel}

# ---------------------------
# GEOFENCE NO DESTINO DA ENTREGA
# ---------------------------
@app.post("/mock/delivery/{delivery_id}/geofence")
def update_delivery_geofence(delivery_id: str, gf: GeofenceIn):
    data = read_mock()
    delivery = next((d for d in data.get("deliveries", []) if d["id"] == delivery_id), None)

    if not delivery:
        raise HTTPException(status_code=404, detail="delivery not found")

    delivery["dest_lat"] = gf.center[0]
    delivery["dest_lon"] = gf.center[1]
    delivery["geofence_radius"] = gf.radius_m

    write_mock(data)
    return {"ok": True, "delivery": delivery}

# ---------------------------
# ASSIGNMENTS
# ---------------------------
@app.get("/mock/assignments")
def assignments():
    data = read_mock()

    result = []
    for delivery in data.get("deliveries", []):
        result.append({
            "delivery": delivery,
            "device": next((d for d in data.get("devices", []) if d["id"] == delivery.get("device_id")), None),
            "driver": next((u for u in data.get("users", []) if u["id"] == delivery.get("driver_id")), None)
        })
    return result

@app.get("/mock/assign/delivery/{delivery_id}")
def assignment_delivery(delivery_id: str):
    data = read_mock()
    delivery = next((d for d in data.get("deliveries", []) if d["id"] == delivery_id), None)

    if not delivery:
        raise HTTPException(status_code=404, detail="delivery not found")

    return {
        "delivery": delivery,
        "device": next((d for d in data.get("devices", []) if d["id"] == delivery.get("device_id")), None),
        "driver": next((u for u in data.get("users", []) if u["id"] == delivery.get("driver_id")), None)
    }

@app.post("/mock/assign")
def assign(payload: AssignIn):
    data = read_mock()

    # vincular delivery ao device
    if payload.delivery_id:
        delivery = next((d for d in data.get("deliveries", []) if d["id"] == payload.delivery_id), None)
        if not delivery:
            raise HTTPException(status_code=404, detail="delivery not found")
        delivery["device_id"] = payload.device_id

    # vincular motorista ao device
    if payload.driver_id:
        dev = next((d for d in data.get("devices", []) if d["id"] == payload.device_id), None)
        if not dev:
            raise HTTPException(status_code=404, detail="device not found")
        dev["assigned_user_id"] = payload.driver_id

    write_mock(data)
    return {"ok": True}

# ---------------------------
# RAW UPDATE (opcional)
# ---------------------------
@app.put("/mock/raw")
def raw_update(patch: dict = Body(...)):
    data = read_mock()
    data.update(patch)
    write_mock(data)
    return {"ok": True, "new_meta": data.get("meta")}
