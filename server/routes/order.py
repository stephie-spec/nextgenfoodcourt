from flask_restful import Resource
from flask import request
from datetime import datetime

from models import db, Order, OrderStatus, Customer, MenuOutletItem, Owner, Outlet
from auth.permissions import require_owner


def serialize_order(order):
    # Safe serialization: relationships may be missing in some cases
    try:
        menu_link = getattr(order, 'menu_outlet_item', None)
        item = getattr(menu_link, 'item', None)
        outlet = getattr(menu_link, 'outlet', None)

        item_price = item.price if item and getattr(item, 'price', None) is not None else 0
        total_price = item_price * (order.quantity or 0)

        # Get table booking if exists
        table_number = None
        if getattr(order, 'table_booking', None):
            table_number = getattr(order.table_booking, 'table_number', None)

        return {
            "id": order.id,
            "customer_id": order.customer_id,
            "tracking_code": getattr(order, 'tracking_code', None),
            "guest_name": getattr(order, 'guest_name', None),
            "guest_email": getattr(order, 'guest_email', None),
            "customer_name": (order.customer.name if getattr(order, 'customer', None) else (getattr(order, 'guest_name', None) or 'Guest')),
            "menu_outlet_item_id": order.menu_outlet_item_id,
            "quantity": order.quantity,
            "status": order.status.value,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "estimated": order.estimated.isoformat() if order.estimated else None,
            "outlet_name": outlet.name if outlet else 'Unknown Outlet',
            "outlet_category": outlet.category_name if outlet else None,
            "items": [
                {
                    "name": item.name if item else 'Unknown Item',
                    "quantity": order.quantity,
                    "price": item_price,
                    "image_path": item.image if (item and item.image and item.image.strip()) else 'default-food.jpg'
                }
            ],
            "total": total_price,
            "table_number": table_number
        }
    except Exception as e:
        # Fallback serialization if relationships are missing
        print(f"Error serializing order {getattr(order,'id', '<unknown>')}: {str(e)}")
        return {
            "id": getattr(order, 'id', None),
            "customer_id": getattr(order, 'customer_id', None),
            "menu_outlet_item_id": getattr(order, 'menu_outlet_item_id', None),
            "quantity": getattr(order, 'quantity', None),
            "status": (getattr(order, 'status').value if getattr(order, 'status', None) else None),
            "created_at": (getattr(order, 'created_at').isoformat() if getattr(order, 'created_at', None) else None),
            "estimated": (getattr(order, 'estimated').isoformat() if getattr(order, 'estimated', None) else None),
            "outlet_name": "Unknown",
            "outlet_category": None,
            "items": [],
            "total": 0,
            "error": str(e)
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
        # guest fields (optional)
        guest_name = data.get("guest_name")
        guest_email = data.get("guest_email")
        guest_phone = data.get("guest_phone")
        # menu_outlet_item_id and quantity are required; customer_id is optional (guest checkout)
        if menu_outlet_item_id is None or quantity is None:
            return {"error": "Missing required fields"}, 400

        # Validate quantity
        if not isinstance(quantity, int) or quantity <= 0:
            return {"error": "quantity must be a positive integer"}, 400

        # If a customer_id was provided, validate it. Otherwise allow guest order.
        if customer_id is not None and not Customer.query.get(customer_id):
            return {"error": "Customer not found"}, 404

        # Validate menu outlet item exists
        menu_item = MenuOutletItem.query.get(menu_outlet_item_id)
        if not menu_item:
            return {"error": f"Menu outlet item with id {menu_outlet_item_id} not found"}, 404

        try:
            order = Order(
                customer_id=customer_id,
                menu_outlet_item_id=menu_outlet_item_id,
                quantity=quantity,
                status=OrderStatus.pending,
                guest_name=guest_name,
                guest_email=guest_email,
                guest_phone=guest_phone
            )

            db.session.add(order)
            db.session.commit()

            return serialize_order(order), 201
        except Exception as e:
            db.session.rollback()
            return {"error": f"Failed to create order: {str(e)}"}, 500


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


class OrderTrackResource(Resource):
    def get(self, tracking_code):
        order = Order.query.filter_by(tracking_code=tracking_code).first()
        if not order:
            return {"error": "Order not found"}, 404
        return serialize_order(order), 200


