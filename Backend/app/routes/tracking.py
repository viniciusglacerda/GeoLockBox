import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from geopy.distance import geodesic

from app.models.delivery import Delivery
from app.models.telemetry import Telemetry
from app.models.device import Device
from app.core.database import get_session

router = APIRouter()


@router.get("/{delivery_id}/generate")
async def generate_tracking_file(delivery_id: str):
    """
    Generates a device_tracking_log.json file based on the actual telemetry recorded in the database.
    """

    session = get_session()

    delivery = session.query(Delivery).filter_by(id=delivery_id).first()
    if not delivery:
        raise HTTPException(404, "Delivery not found")

    if not delivery.device_id:
        raise HTTPException(400, "This delivery has no assigned device")

    device = session.query(Device).filter_by(id=delivery.device_id).first()
    if not device:
        raise HTTPException(404, "Device not found")

    telemetry_list = (
        session.query(Telemetry)
        .filter_by(device_id=device.id)
        .order_by(Telemetry.timestamp.asc())
        .all()
    )

    if len(telemetry_list) < 2:
        raise HTTPException(400, "Insufficient telemetry to generate tracking")

    start = telemetry_list[0]
    end = telemetry_list[-1]

    start_coords = (start.latitude, start.longitude)
    end_coords = (end.latitude, end.longitude)

    tracking_points = [
        [float(t.longitude), float(t.latitude)] for t in telemetry_list
    ]

    total_distance_km = 0.0
    for i in range(len(telemetry_list) - 1):
        p1 = telemetry_list[i]
        p2 = telemetry_list[i + 1]
        total_distance_km += geodesic(
            (p1.latitude, p1.longitude),
            (p2.latitude, p2.longitude)
        ).km

    start_time = start.timestamp
    end_time = end.timestamp

    duration_hours = (end_time - start_time).total_seconds() / 3600
    speed_avg = total_distance_km / duration_hours if duration_hours > 0 else 0

    tracking_data = {
        "deliveryId": delivery.id,
        "deviceId": device.id,
        "status": delivery.status,
        "validated": True,
        "start": {"lat": start.latitude, "lng": start.longitude},
        "end": {"lat": end.latitude, "lng": end.longitude},
        "startTimestamp": start_time.isoformat(),
        "endTimestamp": end_time.isoformat(),
        "distanceKm": round(total_distance_km, 2),
        "speedAvgKmH": round(speed_avg, 2),
        "tracking": tracking_points
    }

    filename = f"device_tracking_log_{delivery.id}.json"
    with open(filename, "w") as f:
        json.dump(tracking_data, f, indent=4)

    return {
        "message": "Tracking file generated",
        "file": filename,
        "points": len(tracking_points),
        "distanceKm": round(total_distance_km, 2)
    }
