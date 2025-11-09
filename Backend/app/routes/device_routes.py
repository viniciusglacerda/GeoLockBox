from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.device import Device
from app.schemas.device_schema import DeviceCreate, DeviceUpdate, DeviceResponse

router = APIRouter()

# Listar todos os dispositivos
@router.get("", response_model=List[DeviceResponse])
def get_devices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    devices = db.query(Device).offset(skip).limit(limit).all()
    return devices


# Criar novo dispositivo
@router.post("", response_model=DeviceResponse)
def create_device(device: DeviceCreate, db: Session = Depends(get_db)):
    db_device = Device(**device.dict())
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device


# Buscar dispositivo por ID
@router.get("/{device_id}", response_model=DeviceResponse)
def get_device(device_id: int, db: Session = Depends(get_db)):
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")
    return db_device


# Atualizar dispositivo
@router.put("/{device_id}", response_model=DeviceResponse)
def update_device(device_id: int, device_update: DeviceUpdate, db: Session = Depends(get_db)):
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    for key, value in device_update.dict(exclude_unset=True).items():
        setattr(db_device, key, value)
    
    db.commit()
    db.refresh(db_device)
    return db_device


# Deletar dispositivo
@router.delete("/{device_id}", response_model=dict)
def delete_device(device_id: int, db: Session = Depends(get_db)):
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    db.delete(db_device)
    db.commit()
    return {"message": f"Device {device_id} deleted successfully"}
