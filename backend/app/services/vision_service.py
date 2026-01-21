import base64
import json
from typing import Literal, TypedDict

import ollama

from ..config import settings

client: ollama.AsyncClient = ollama.AsyncClient(host=settings.ollama_host)


class RoomAnalysisResult(TypedDict):
    missing_items: list[str]
    damage_detected: list[str]
    cleanliness_issues: list[str]
    condition_score: int


class PhotoComparisonResult(TypedDict):
    new_damage: list[str]
    missing_items: list[str]
    condition_change: Literal["better", "same", "worse"]
    recommended_claim: bool
    estimated_damage_cost: float


async def analyze_room_photo(image_path: str, checklist_items: list[str], room_name: str) -> RoomAnalysisResult:
    """Analyze a room photo using Ollama vision model to detect missing items and damage."""

    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    checklist_str = "\n".join(f"- {item}" for item in checklist_items)

    prompt = f"""Analyze this photo of a {room_name} from an Airbnb property.

Expected items in this room:
{checklist_str}

Please identify:
1. Which items from the checklist appear to be MISSING
2. Any visible DAMAGE to furniture, walls, floors, or items
3. Overall cleanliness issues

Respond in JSON format only, no markdown or explanation:
{{
    "missing_items": ["item1", "item2"],
    "damage_detected": ["description of damage 1"],
    "cleanliness_issues": ["issue1"],
    "condition_score": 1-10
}}"""

    response = await client.chat(  # type: ignore[attr-defined]
        model=settings.ollama_model,
        messages=[
            {
                "role": "user",
                "content": prompt,
                "images": [image_data],
            }
        ],
    )

    try:
        text = response["message"]["content"].strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(text)
    except (json.JSONDecodeError, KeyError, IndexError):
        return {"missing_items": [], "damage_detected": [], "cleanliness_issues": [], "condition_score": 5}


async def compare_photos(before_path: str, after_path: str, room_name: str) -> PhotoComparisonResult:
    """Compare before/after photos to detect changes and damage."""

    def load_image(path: str) -> str:
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")

    before_data = load_image(before_path)
    after_data = load_image(after_path)

    prompt = f"""Compare these two photos of a {room_name}.
The first image is BEFORE the guest stay (check-in).
The second image is AFTER the guest stay (check-out).

Identify:
1. Any NEW damage that appeared
2. Any items that are now MISSING
3. Significant changes in condition

Respond in JSON format only, no markdown or explanation:
{{
    "new_damage": ["description"],
    "missing_items": ["item"],
    "condition_change": "better/same/worse",
    "recommended_claim": true/false,
    "estimated_damage_cost": 0.00
}}"""

    response = await client.chat(  # type: ignore[attr-defined]
        model=settings.ollama_model,
        messages=[
            {
                "role": "user",
                "content": prompt,
                "images": [before_data, after_data],
            }
        ],
    )

    try:
        text = response["message"]["content"].strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(text)
    except (json.JSONDecodeError, KeyError, IndexError):
        return {
            "new_damage": [],
            "missing_items": [],
            "condition_change": "same",
            "recommended_claim": False,
            "estimated_damage_cost": 0,
        }
