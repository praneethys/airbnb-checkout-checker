import anthropic
import base64
from pathlib import Path
from ..config import settings

client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

async def analyze_room_photo(image_path: str, checklist_items: list[str], room_name: str) -> dict:
    """Analyze a room photo using Claude's vision to detect missing items and damage."""

    with open(image_path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode("utf-8")

    media_type = "image/jpeg"
    if image_path.lower().endswith(".png"):
        media_type = "image/png"

    checklist_str = "\n".join(f"- {item}" for item in checklist_items)

    prompt = f"""Analyze this photo of a {room_name} from an Airbnb property.

Expected items in this room:
{checklist_str}

Please identify:
1. Which items from the checklist appear to be MISSING
2. Any visible DAMAGE to furniture, walls, floors, or items
3. Overall cleanliness issues

Respond in JSON format:
{{
    "missing_items": ["item1", "item2"],
    "damage_detected": ["description of damage 1"],
    "cleanliness_issues": ["issue1"],
    "condition_score": 1-10
}}"""

    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": image_data}},
                {"type": "text", "text": prompt}
            ]
        }]
    )

    import json
    try:
        return json.loads(response.content[0].text)
    except json.JSONDecodeError:
        return {"missing_items": [], "damage_detected": [], "cleanliness_issues": [], "condition_score": 5}

async def compare_photos(before_path: str, after_path: str, room_name: str) -> dict:
    """Compare before/after photos to detect changes and damage."""

    def load_image(path: str) -> tuple[str, str]:
        with open(path, "rb") as f:
            data = base64.standard_b64encode(f.read()).decode("utf-8")
        media_type = "image/png" if path.lower().endswith(".png") else "image/jpeg"
        return data, media_type

    before_data, before_type = load_image(before_path)
    after_data, after_type = load_image(after_path)

    prompt = f"""Compare these two photos of a {room_name}.
The first image is BEFORE the guest stay (check-in).
The second image is AFTER the guest stay (check-out).

Identify:
1. Any NEW damage that appeared
2. Any items that are now MISSING
3. Significant changes in condition

Respond in JSON format:
{{
    "new_damage": ["description"],
    "missing_items": ["item"],
    "condition_change": "better/same/worse",
    "recommended_claim": true/false,
    "estimated_damage_cost": 0.00
}}"""

    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": before_type, "data": before_data}},
                {"type": "image", "source": {"type": "base64", "media_type": after_type, "data": after_data}},
                {"type": "text", "text": prompt}
            ]
        }]
    )

    import json
    try:
        return json.loads(response.content[0].text)
    except json.JSONDecodeError:
        return {"new_damage": [], "missing_items": [], "condition_change": "same", "recommended_claim": False, "estimated_damage_cost": 0}
