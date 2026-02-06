from flask_restful import Resource
from flask import request
from models import db, Item, CustomerFavourite
from auth.permissions import require_owner, get_current_user


class ItemListResource(Resource):

    def get(self):
        user = get_current_user()
        items = Item.query.all()
        response = []
        
        for item in items:
            is_favourite = False
            if user and user.role == 'customer':
                is_favourite = CustomerFavourite.query.filter_by(
                    customer_id=user.id,
                    item_id=item.id
                ).first() is not None

            response.append({
                "id": item.id,
                "name": item.name,
                "price": float(item.price),
                "category": item.category_name,               
                "is_available": item.is_available,
                "favourite_count": item.favourites,
                "isFavourite": is_favourite,
            })
        
        return response, 200


    def post(self):
        data = request.get_json()

        if not data:
            return {"error": "Request body required"}, 400

        if "name" not in data or "price" not in data:
            return {"error": "name and price are required"}, 400

        item = Item(
            name=data["name"],
            price=data["price"],
            category_name = data ["category_name"],
            image = data ["image"]
        )

        db.session.add(item)
        db.session.commit()

        return {
            "message": "Item created",
            "item_id": item.id
        }, 201


class ItemResource(Resource):

    def get(self, item_id):
        item = Item.query.get_or_404(item_id)
        return {
            "id": item.id,
            "name": item.name,
            "price": item.price
        }, 200

    def put(self, item_id):
        owner = require_owner()
        if not owner:
            return {"error": "Owner access required"}, 403

        item = Item.query.get_or_404(item_id)
        data = request.get_json()

        if not data:
            return {"error": "Request body required"}, 400

        if "name" in data:
            item.name = data["name"]

        if "price" in data:
            item.price = data["price"]

        db.session.commit()
        return {"message": "Item updated"}, 200

    def delete(self, item_id):
        owner = require_owner()
        if not owner:
            return {"error": "Owner access required"}, 403
        item = Item.query.get_or_404(item_id)
        db.session.delete(item)
        db.session.commit()
        return {"message": "Item deleted"}, 204
