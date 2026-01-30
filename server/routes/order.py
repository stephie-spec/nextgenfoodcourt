from flask_restful import Resource
from flask import request
from datetime import datetime

from models import db, Order, OrderStatus, Customer, MenuOutletItem


def serialize_order(order):
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "menu_outlet_item_id": order.menu_outlet_item_id,
        "quantity": order.quantity,
        "status": order.status.value,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "estimated": order.estimated.isoformat() if order.estimated else None
    }


class OrderListResource(Resource):
    def get(self):
        orders = Order.query.all()
        return [serialize_order(o) for o in orders], 200

    def post(self):
        data = request.get_json()

        if not data:
            return {"error": "No input data provided"}, 400

        customer_id = data.get("customer_id")
        menu_outlet_item_id = data.get("menu_outlet_item_id")
        quantity = data.get("quantity")

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
