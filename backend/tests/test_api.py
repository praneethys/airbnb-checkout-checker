import pytest


class TestProperties:
    async def test_create_property(self, client):
        response = await client.post("/api/properties", json={"name": "Beach House", "address": "123 Ocean Ave"})
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Beach House"
        assert data["address"] == "123 Ocean Ave"
        assert "id" in data

    async def test_list_properties(self, client):
        # Create a property first
        await client.post("/api/properties", json={"name": "Mountain Cabin"})

        response = await client.get("/api/properties")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    async def test_get_property(self, client):
        # Create a property first
        create_response = await client.post("/api/properties", json={"name": "City Apartment"})
        property_id = create_response.json()["id"]

        response = await client.get(f"/api/properties/{property_id}")
        assert response.status_code == 200
        assert response.json()["name"] == "City Apartment"

    async def test_get_property_not_found(self, client):
        response = await client.get("/api/properties/99999")
        assert response.status_code == 404


class TestRooms:
    async def test_create_room(self, client):
        # Create a property first
        prop_response = await client.post("/api/properties", json={"name": "Test Property"})
        property_id = prop_response.json()["id"]

        response = await client.post(
            f"/api/properties/{property_id}/rooms", json={"name": "Master Bedroom", "room_type": "bedroom"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Master Bedroom"
        assert data["room_type"] == "bedroom"

    async def test_list_rooms(self, client):
        # Create a property and room
        prop_response = await client.post("/api/properties", json={"name": "Test Property"})
        property_id = prop_response.json()["id"]
        await client.post(f"/api/properties/{property_id}/rooms", json={"name": "Living Room", "room_type": "living_room"})

        response = await client.get(f"/api/properties/{property_id}/rooms")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1


class TestChecklistItems:
    async def test_create_checklist_item(self, client):
        # Create property and room first
        prop_response = await client.post("/api/properties", json={"name": "Test Property"})
        property_id = prop_response.json()["id"]
        room_response = await client.post(
            f"/api/properties/{property_id}/rooms", json={"name": "Kitchen", "room_type": "kitchen"}
        )
        room_id = room_response.json()["id"]

        response = await client.post(f"/api/rooms/{room_id}/items", json={"name": "Coffee Maker", "replacement_cost": 50.0})
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Coffee Maker"
        assert data["replacement_cost"] == 50.0

    async def test_list_checklist_items(self, client):
        # Create property, room, and item
        prop_response = await client.post("/api/properties", json={"name": "Test Property"})
        property_id = prop_response.json()["id"]
        room_response = await client.post(
            f"/api/properties/{property_id}/rooms", json={"name": "Bathroom", "room_type": "bathroom"}
        )
        room_id = room_response.json()["id"]
        await client.post(f"/api/rooms/{room_id}/items", json={"name": "Towels", "replacement_cost": 20.0})

        response = await client.get(f"/api/rooms/{room_id}/items")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1


class TestChecks:
    async def test_create_checkin(self, client):
        # Create a property first
        prop_response = await client.post("/api/properties", json={"name": "Test Property"})
        property_id = prop_response.json()["id"]

        response = await client.post(
            f"/api/properties/{property_id}/checks", json={"check_type": "checkin", "guest_name": "John Doe"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["check_type"] == "checkin"
        assert data["guest_name"] == "John Doe"

    async def test_create_checkout(self, client):
        # Create a property first
        prop_response = await client.post("/api/properties", json={"name": "Test Property"})
        property_id = prop_response.json()["id"]

        response = await client.post(
            f"/api/properties/{property_id}/checks", json={"check_type": "checkout", "guest_name": "Jane Doe"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["check_type"] == "checkout"

    async def test_list_checks(self, client):
        # Create property and check
        prop_response = await client.post("/api/properties", json={"name": "Test Property"})
        property_id = prop_response.json()["id"]
        await client.post(f"/api/properties/{property_id}/checks", json={"check_type": "checkin", "guest_name": "Guest"})

        response = await client.get(f"/api/properties/{property_id}/checks")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1


class TestCostHistory:
    async def test_get_cost_history_empty(self, client):
        # Create a property first
        prop_response = await client.post("/api/properties", json={"name": "Test Property"})
        property_id = prop_response.json()["id"]

        response = await client.get(f"/api/properties/{property_id}/cost-history")
        assert response.status_code == 200
        assert response.json() == []
