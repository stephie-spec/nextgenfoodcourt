from flask_restful import Resource
from flask import request

from extensions import db
from models import MenuOutletItem, Outlet, Item


class MenuListResource(Resource):
    def get(self):
        """
        Get all menu items (outlet ↔ item)
        """
        menu_items = MenuOutletItem.query.all()

        return [
            {
                "id": menu.id,
                "outlet_id": menu.outlet_id,
                "outlet_name": menu.outlet.name if menu.outlet else None,
                "item_id": menu.item_id,
                "item_name": menu.item.name if menu.item else None,
                "price": menu.item.price if menu.item else None
            }
            for menu in menu_items
        ], 200

    def post(self):
        """
        Add item to outlet menu
        """
        data = request.get_json()

        if not data:
            return {"error": "Request body is required"}, 400

        outlet_id = data.get("outlet_id")
        item_id = data.get("item_id")

        if not outlet_id or not item_id:
            return {"error": "outlet_id and item_id are required"}, 400

        outlet = Outlet.query.get(outlet_id)
        item = Item.query.get(item_id)

        if not outlet:
            return {"error": "Outlet not found"}, 404

        if not item:
            return {"error": "Item not found"}, 404

        existing = MenuOutletItem.query.filter_by(
            outlet_id=outlet_id,
            item_id=item_id
        ).first()

        if existing:
            return {"error": "Item already exists in this outlet menu"}, 409

        menu_item = MenuOutletItem(
            outlet_id=outlet_id,
            item_id=item_id
        )

        db.session.add(menu_item)
        db.session.commit()

        return {
            "message": "Item added to menu successfully",
            "menu_id": menu_item.id
        }, 201


class MenuResource(Resource):
    def get(self, menu_id):
        """
        Get single menu record
        """
        menu = MenuOutletItem.query.get_or_404(menu_id)

        return {
            "id": menu.id,
            "outlet_id": menu.outlet_id,
            "outlet_name": menu.outlet.name,
            "item_id": menu.item_id,
            "item_name": menu.item.name,
            "price": menu.item.price
        }, 200

    def delete(self, menu_id):
        """
        Remove item from menu
        """
        menu = MenuOutletItem.query.get_or_404(menu_id)

        db.session.delete(menu)
        db.session.commit()

        return {"message": "Menu item removed"}, 204
