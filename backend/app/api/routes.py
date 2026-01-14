import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..config import settings
from ..database import get_db
from ..models import Check, ChecklistItem, CheckType, Issue, Photo, Property, Room
from ..schemas import (
    CheckCreate,
    ChecklistItemCreate,
    ChecklistItemResponse,
    CheckResponse,
    IssueResponse,
    PropertyCreate,
    PropertyResponse,
    RoomCreate,
    RoomResponse,
)
from ..services import analyze_room_photo, compare_photos

router = APIRouter()


# Properties
@router.post("/properties", response_model=PropertyResponse)
async def create_property(data: PropertyCreate, db: AsyncSession = Depends(get_db)):
    prop = Property(**data.model_dump())
    db.add(prop)
    await db.commit()
    await db.refresh(prop)
    return prop


@router.get("/properties", response_model=list[PropertyResponse])
async def list_properties(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Property))
    return result.scalars().all()


@router.get("/properties/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Property).where(Property.id == property_id))
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(404, "Property not found")
    return prop


# Rooms
@router.post("/properties/{property_id}/rooms", response_model=RoomResponse)
async def create_room(property_id: int, data: RoomCreate, db: AsyncSession = Depends(get_db)):
    room = Room(property_id=property_id, **data.model_dump())
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room


@router.get("/properties/{property_id}/rooms", response_model=list[RoomResponse])
async def list_rooms(property_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Room).where(Room.property_id == property_id))
    return result.scalars().all()


# Checklist Items
@router.post("/rooms/{room_id}/items", response_model=ChecklistItemResponse)
async def create_checklist_item(room_id: int, data: ChecklistItemCreate, db: AsyncSession = Depends(get_db)):
    item = ChecklistItem(room_id=room_id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.get("/rooms/{room_id}/items", response_model=list[ChecklistItemResponse])
async def list_checklist_items(room_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ChecklistItem).where(ChecklistItem.room_id == room_id))
    return result.scalars().all()


@router.put("/items/{item_id}", response_model=ChecklistItemResponse)
async def update_checklist_item(item_id: int, data: ChecklistItemCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ChecklistItem).where(ChecklistItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Item not found")
    for k, v in data.model_dump().items():
        setattr(item, k, v)
    await db.commit()
    await db.refresh(item)
    return item


# Checks
@router.post("/properties/{property_id}/checks", response_model=CheckResponse)
async def create_check(property_id: int, data: CheckCreate, db: AsyncSession = Depends(get_db)):
    check = Check(property_id=property_id, **data.model_dump())
    db.add(check)
    await db.commit()
    await db.refresh(check)
    return check


@router.get("/properties/{property_id}/checks", response_model=list[CheckResponse])
async def list_checks(property_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Check).where(Check.property_id == property_id).order_by(Check.created_at.desc()))
    return result.scalars().all()


# Photo Upload & Analysis
@router.post("/checks/{check_id}/photos/{room_id}")
async def upload_and_analyze_photo(
    check_id: int, room_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)
):
    os.makedirs(settings.upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(settings.upload_dir, filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Get room and checklist
    room_result = await db.execute(select(Room).where(Room.id == room_id))
    room = room_result.scalar_one_or_none()
    if not room:
        raise HTTPException(404, "Room not found")

    items_result = await db.execute(select(ChecklistItem).where(ChecklistItem.room_id == room_id))
    items = items_result.scalars().all()
    item_names = [i.name for i in items]
    item_costs = {i.name: i.replacement_cost for i in items}

    # Analyze with vision
    analysis = await analyze_room_photo(file_path, item_names, room.name)

    # Save photo record
    photo = Photo(check_id=check_id, room_id=room_id, file_path=file_path, analysis_result=str(analysis))
    db.add(photo)

    # Create issues for missing items and damage
    issues = []
    for missing in analysis.get("missing_items", []):
        cost = item_costs.get(missing, 0)
        issue = Issue(
            check_id=check_id,
            description=f"Missing: {missing}",
            item_name=missing,
            estimated_cost=cost,
            severity="medium",
        )
        db.add(issue)
        issues.append(issue)

    for damage in analysis.get("damage_detected", []):
        issue = Issue(check_id=check_id, description=damage, severity="high")
        db.add(issue)
        issues.append(issue)

    await db.commit()
    return {"photo_id": photo.id, "analysis": analysis, "issues_created": len(issues)}


# Damage Report
@router.get("/properties/{property_id}/damage-report")
async def generate_damage_report(
    property_id: int, checkin_id: int, checkout_id: int, db: AsyncSession = Depends(get_db)
):
    # Get checks with photos
    checkin_result = await db.execute(
        select(Check)
        .options(selectinload(Check.photos), selectinload(Check.issues))
        .where(Check.id == checkin_id, Check.check_type == CheckType.CHECKIN)
    )
    checkin = checkin_result.scalar_one_or_none()

    checkout_result = await db.execute(
        select(Check)
        .options(selectinload(Check.photos), selectinload(Check.issues))
        .where(Check.id == checkout_id, Check.check_type == CheckType.CHECKOUT)
    )
    checkout = checkout_result.scalar_one_or_none()

    if not checkin or not checkout:
        raise HTTPException(404, "Check-in or check-out not found")

    prop_result = await db.execute(select(Property).where(Property.id == property_id))
    prop = prop_result.scalar_one()

    # Compare photos by room
    comparisons = []
    checkin_by_room = {p.room_id: p for p in checkin.photos}
    for photo in checkout.photos:
        if photo.room_id in checkin_by_room:
            before = checkin_by_room[photo.room_id]
            room_result = await db.execute(select(Room).where(Room.id == photo.room_id))
            room = room_result.scalar_one()
            comparison = await compare_photos(before.file_path, photo.file_path, room.name)
            comparisons.append(
                {
                    "room_id": photo.room_id,
                    "room_name": room.name,
                    "before_photo": before.file_path,
                    "after_photo": photo.file_path,
                    "comparison": comparison,
                }
            )

    total_cost = sum(i.estimated_cost for i in checkout.issues)

    return {
        "property_name": prop.name,
        "guest_name": checkout.guest_name,
        "checkin_date": checkin.created_at,
        "checkout_date": checkout.created_at,
        "issues": [IssueResponse.model_validate(i) for i in checkout.issues],
        "total_estimated_cost": total_cost,
        "comparison_photos": comparisons,
    }


# Cost Tracking
@router.get("/properties/{property_id}/cost-history")
async def get_cost_history(property_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Issue, Check.created_at, Check.guest_name)
        .join(Check)
        .where(Check.property_id == property_id)
        .order_by(Check.created_at.desc())
    )
    rows = result.all()
    return [{"issue": IssueResponse.model_validate(r[0]), "date": r[1], "guest": r[2]} for r in rows]
