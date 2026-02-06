from flask_restful import Resource
from flask import request

from extensions import db
from models import MenuOutletItem, Outlet, Item


class MenuListResource(Resource):
    def get(self):
        """
        Get all menu items (outlet ↔ item) with full item details
        """
        menu_items = MenuOutletItem.query.all()
        if not menu_items:
            return {"message": "No menu items found"}, 404

        return [
            {
                "id": menu.id,
                "outlet_id": menu.outlet_id,
                "outlet_name": menu.outlet.name if menu.outlet else None,
                "item_id": menu.item_id,
                "item_name": menu.item.name if menu.item else None,
                "price": float(menu.item.price) if menu.item and menu.item.price else None,
                "category": menu.item.category_name if menu.item and menu.item.category_name else "Uncategorized",
                "is_available": menu.item.is_available if menu.item is not None else True,
            }
            for menu in menu_items
        ], 200

    def post(self):
        """
        Add new item + link it to an outlet's menu (handles multipart/form-data)
        """
        # Handle form data (multipart/form-data)
        name = request.form.get('name')
        price_str = request.form.get('price')
        category = request.form.get('category')
        is_available_str = request.form.get('is_available')
        outlet_id_str = request.form.get('outlet_id')
        image_file = request.files.get('image')

        if not name or not price_str or not outlet_id_str:
            return {"error": "name, price, and outlet_id are required"}, 400

        try:
            price = float(price_str)
            outlet_id = int(outlet_id_str)
            is_available = is_available_str.lower() == 'true' if is_available_str else True
        except ValueError:
            return {"error": "Invalid price or outlet_id format"}, 400

        outlet = Outlet.query.get(outlet_id)
        if not outlet:
            return {"error": "Outlet not found"}, 404

        # Create new Item
        new_item = Item(
            name=name,
            price=price,
            category_name=category,
            is_available=is_available,
            # image = save_image(image_file)   
        )

        db.session.add(new_item)
        db.session.flush()  # Get new_item.id

        # Link to outlet
        existing_link = MenuOutletItem.query.filter_by(
            outlet_id=outlet_id,
            item_id=new_item.id
        ).first()

        if existing_link:
            db.session.rollback()
            return {"error": "Item already exists in this outlet menu"}, 409

        menu_link = MenuOutletItem(
            outlet_id=outlet_id,
            item_id=new_item.id
        )

        db.session.add(menu_link)
        db.session.commit()

        return {
            "message": "Item created and added to menu",
            "item_id": new_item.id,
            "menu_id": menu_link.id
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
