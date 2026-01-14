from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base

class RoomType(str, enum.Enum):
    BEDROOM = "bedroom"
    BATHROOM = "bathroom"
    KITCHEN = "kitchen"
    LIVING_ROOM = "living_room"
    OTHER = "other"

class CheckType(str, enum.Enum):
    CHECKIN = "checkin"
    CHECKOUT = "checkout"

class Property(Base):
    __tablename__ = "properties"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    address = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    rooms = relationship("Room", back_populates="property", cascade="all, delete-orphan")
    checks = relationship("Check", back_populates="property", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    name = Column(String(255), nullable=False)
    room_type = Column(Enum(RoomType), default=RoomType.OTHER)
    property = relationship("Property", back_populates="rooms")
    checklist_items = relationship("ChecklistItem", back_populates="room", cascade="all, delete-orphan")

class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    name = Column(String(255), nullable=False)
    replacement_cost = Column(Float, default=0.0)
    room = relationship("Room", back_populates="checklist_items")

class Check(Base):
    __tablename__ = "checks"
    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    check_type = Column(Enum(CheckType), nullable=False)
    guest_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    property = relationship("Property", back_populates="checks")
    photos = relationship("Photo", back_populates="check", cascade="all, delete-orphan")
    issues = relationship("Issue", back_populates="check", cascade="all, delete-orphan")

class Photo(Base):
    __tablename__ = "photos"
    id = Column(Integer, primary_key=True)
    check_id = Column(Integer, ForeignKey("checks.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    analysis_result = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    check = relationship("Check", back_populates="photos")

class Issue(Base):
    __tablename__ = "issues"
    id = Column(Integer, primary_key=True)
    check_id = Column(Integer, ForeignKey("checks.id"), nullable=False)
    description = Column(Text, nullable=False)
    item_name = Column(String(255))
    estimated_cost = Column(Float, default=0.0)
    severity = Column(String(50), default="low")
    check = relationship("Check", back_populates="issues")
