from flask_restful import Resource
from flask import request
from datetime import datetime

from models import db, Order, OrderStatus, Customer, MenuOutletItem, Owner, Outlet
from auth.permissions import require_owner


def serialize_order(order):
    
    item = order.menu_outlet_item.item
    outlet = order.menu_outlet_item.outlet

    item_price = order.menu_outlet_item.item.price
    total_price = item_price * order.quantity

    table_booking_data = None
    if order.table_booking:
        table_booking_data = {
            "id": order.table_booking.id,
            "table_number": order.table_booking.table_number,
            "capacity": order.table_booking.capacity,
            "duration": str(order.table_booking.duration) if order.table_booking.duration else None,
            "created_at": order.table_booking.created_at.isoformat() if order.table_booking.created_at else None,
        }

    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "menu_outlet_item_id": order.menu_outlet_item_id,
        "quantity": order.quantity,
        "status": order.status.value,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "estimated": order.estimated.isoformat() if order.estimated else None,

        "outlet_name": outlet.name,
        "outlet_category": outlet.category_name,
        "items": [
            {
                "name": item.name,
                "quantity":order.quantity,
                "price": item_price,
                "image_path": item.image if item.image and item.image.strip() else 'default-food.jpg'
            }
        ],
        "total": total_price,
        "table_booking": table_booking_data
    }


class OrderListResource(Resource):
    def get(self):
        # owner=require_owner()
        
        # if not owner:
        #     return {"error":"Unauthorized"},401

        orders = Order.query.all()
        return [serialize_order(o) for o in orders], 200

    def post(self):
        data = request.get_json()

        if not data:
            return {"error": "No input data provided"}, 400

        customer_id = data.get("customer_id")
        menu_outlet_item_id = data.get("menu_outlet_item_id")
        quantity = data.get("quantity")
        table_number = data.get("table_number")

        if None in (customer_id, menu_outlet_item_id, quantity):
            return {"error": "Missing required fields"}, 400

        if not isinstance(quantity, int) or quantity <= 0:
            return {"error": "quantity must be a positive integer"}, 400

        if not Customer.query.get(customer_id):
            return {"error": "Customer not found"}, 404

        if not MenuOutletItem.query.get(menu_outlet_item_id):
            return {"error": "Menu outlet item not found"}, 404

        order = Order(
            customer_id=customer_id,
            menu_outlet_item_id=menu_outlet_item_id,
            quantity=quantity,
            status=OrderStatus.pending
        )

        db.session.add(order)
        db.session.flush()


        if table_number:
            from models import TableBooking  
        
            table_booking = TableBooking(
                order_id=order.id,
                table_number=table_number,
                capacity=4, 
                duration=None, 
                created_at=datetime.utcnow()
            )
            db.session.add(table_booking)  

        db.session.commit()

        return serialize_order(order), 201


class OrderResource(Resource):
    def get(self, order_id):
        order = Order.query.get_or_404(order_id)
        return serialize_order(order), 200

    def put(self, order_id):
        order = Order.query.get_or_404(order_id)
        data = request.get_json()

        if "quantity" in data:
            if not isinstance(data["quantity"], int) or data["quantity"] <= 0:
                return {"error": "Invalid quantity"}, 400
            order.quantity = data["quantity"]
            # Recalculate total
            item_price = order.menu_outlet_item.item.price
            order.total = item_price * order.quantity

        if "status" in data:
            try:
                order.status = OrderStatus(data["status"])
            except ValueError:
                return {"error": "Invalid status"}, 400

        if "estimated" in data:
            order.estimated = datetime.fromisoformat(data["estimated"])

        db.session.commit()
        return serialize_order(order), 200

    def delete(self, order_id):
        order = Order.query.get_or_404(order_id)
        db.session.delete(order)
        db.session.commit()
        return {"message": "Order deleted"}, 204


class CustomerOrderResource(Resource):
    def get(self, customer_id):
        if not Customer.query.get(customer_id):
            return {"error": "Customer not found"}, 404
        
        orders = Order.query.filter_by(customer_id=customer_id).all()
        return [serialize_order(o) for o in orders], 200


class OwnerOrderResource(Resource):
    def get(self, owner_id):
        if not Owner.query.get(owner_id):
            return {"error": "Owner not found"}, 404
        
        # Get all outlets for the owner
        outlets = Outlet.query.filter_by(owner_id=owner_id).all()
        outlet_ids = [outlet.id for outlet in outlets]
        
        if not outlet_ids:
            return [], 200
        
        # Get all menu outlet items for these outlets
        menu_items = MenuOutletItem.query.filter(MenuOutletItem.outlet_id.in_(outlet_ids)).all()
        menu_item_ids = [item.id for item in menu_items]
        
        if not menu_item_ids:
            return [], 200
        
        # Get all orders for these menu items
        orders = Order.query.filter(Order.menu_outlet_item_id.in_(menu_item_ids)).all()
        return [serialize_order(o) for o in orders], 200


