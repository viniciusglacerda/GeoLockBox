from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base 

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="idle")  # locked, unlocked, in_transit
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    battery_level = Column(Float, nullable=True)
    last_update = Column(DateTime, default=datetime.utcnow)
    active = Column(Boolean, default=True)

    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_user = relationship("User", back_populates="devices")

    telemetry = relationship("Telemetry", back_populates="device", cascade="all, delete-orphan")
    commands = relationship("Command", back_populates="device", cascade="all, delete-orphan")
    deliveries = relationship("Delivery", back_populates="device", cascade="all, delete-orphan")
