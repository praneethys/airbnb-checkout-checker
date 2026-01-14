from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class RoomType(str, Enum):
    BEDROOM = "bedroom"
    BATHROOM = "bathroom"
    KITCHEN = "kitchen"
    LIVING_ROOM = "living_room"
    OTHER = "other"

class CheckType(str, Enum):
    CHECKIN = "checkin"
    CHECKOUT = "checkout"

# Property
class PropertyCreate(BaseModel):
    name: str
    address: Optional[str] = None

class PropertyResponse(BaseModel):
    id: int
    name: str
    address: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

# Room
class RoomCreate(BaseModel):
    name: str
    room_type: RoomType = RoomType.OTHER

class RoomResponse(BaseModel):
    id: int
    property_id: int
    name: str
    room_type: RoomType
    class Config:
        from_attributes = True

# ChecklistItem
class ChecklistItemCreate(BaseModel):
    name: str
    replacement_cost: float = 0.0

class ChecklistItemResponse(BaseModel):
    id: int
    room_id: int
    name: str
    replacement_cost: float
    class Config:
        from_attributes = True

# Check
class CheckCreate(BaseModel):
    check_type: CheckType
    guest_name: Optional[str] = None

class CheckResponse(BaseModel):
    id: int
    property_id: int
    check_type: CheckType
    guest_name: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

# Issue
class IssueResponse(BaseModel):
    id: int
    check_id: int
    description: str
    item_name: Optional[str]
    estimated_cost: float
    severity: str
    class Config:
        from_attributes = True

# Photo Analysis
class PhotoAnalysisResponse(BaseModel):
    photo_id: int
    missing_items: list[str]
    damage_detected: list[str]
    issues: list[IssueResponse]

# Damage Report
class DamageReportResponse(BaseModel):
    property_name: str
    guest_name: Optional[str]
    checkin_date: datetime
    checkout_date: datetime
    issues: list[IssueResponse]
    total_estimated_cost: float
    comparison_photos: list[dict]
