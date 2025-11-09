from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="receiver")  # sender, receiver, admin
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    devices = relationship("Device", back_populates="assigned_user", cascade="all, delete-orphan")
    sent_deliveries = relationship("Delivery", foreign_keys="Delivery.sender_id", back_populates="sender")
    received_deliveries = relationship("Delivery", foreign_keys="Delivery.receiver_id", back_populates="receiver")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
