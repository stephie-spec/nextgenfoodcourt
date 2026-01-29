from flask_restful import Api, Resource
from flask import Blueprint, request
from datetime import datetime

from models import db, Order, OrderStatus, Customer, MenuOutletItem

# -------------------------------------------------------------------
# Blueprint and API setup (same pattern as owner.py)
# -------------------------------------------------------------------

order_bp = Blueprint("order_bp", __name__)
api = Api(order_bp)




class OrderListResource(Resource):

    def get(self):
        """
        Get all orders
        """
        orders = Order.query.all()

        return [
            {
                "id": order.id,
                "customer_id": order.customer_id,
                "menu_outlet_item_id": order.menu_outlet_item_id,
                "quantity": order.quantity,
                "status": order.status.value,
                "created_at": order.created_at,
                "estimated": order.estimated
            }
            for order in orders
        ], 200

    def post(self):
        """
        Create a new order
        """
        data = request.get_json()

        if not data:
            return {"error": "No input data provided"}, 400

        customer_id = data.get("customer_id")
        menu_outlet_item_id = data.get("menu_outlet_item_id")
        quantity = data.get("quantity")

        if not customer_id or not menu_outlet_item_id or not quantity:
            return {
                "error": "customer_id, menu_outlet_item_id and quantity are required"
            }, 400

        customer = Customer.query.get(customer_id)
        menu_item = MenuOutletItem.query.get(menu_outlet_item_id)

        if not customer:
            return {"error": "Customer not found"}, 404

        if not menu_item:
            return {"error": "Menu outlet item not found"}, 404

        order = Order(
            customer_id=customer_id,
            menu_outlet_item_id=menu_outlet_item_id,
            quantity=quantity,
            status=OrderStatus.pending,
            created_at=datetime.utcnow()
        )

        db.session.add(order)
        db.session.commit()

        return {
            "message": "Order created successfully",
            "order_id": order.id
        }, 201





class OrderResource(Resource):

    def get(self, order_id):
        """
        Get a single order by ID
        """
        order = Order.query.get_or_404(order_id)

        return {
            "id": order.id,
            "customer_id": order.customer_id,
            "menu_outlet_item_id": order.menu_outlet_item_id,
            "quantity": order.quantity,
            "status": order.status.value,
            "created_at": order.created_at.isoformat(),
            "estimated": order.estimated.isoformat() if order.estimated else None
        }, 200

    def put(self, order_id):
        """
        Update an order
        """
        order = Order.query.get_or_404(order_id)
        data = request.get_json()

        if not data:
            return {"error": "Request body is required"}, 400

        if "quantity" in data:
            order.quantity = data["quantity"]

        if "status" in data:
            try:
                order.status = OrderStatus(data["status"])
            except ValueError:
                return {"error": "Invalid order status"}, 400

        if "estimated" in data:
            try:
                order.estimated = datetime.fromisoformat(data["estimated"])
            except ValueError:
                return {"error": "Invalid datetime format"}, 400

        db.session.commit()

        return {"message": "Order updated successfully"}, 200

    def delete(self, order_id):
        """
        Delete an order
        """
        order = Order.query.get_or_404(order_id)

        db.session.delete(order)
        db.session.commit()

        return {"message": "Order deleted successfully"}, 204
# Route registration


api.add_resource(OrderListResource, "/orders")
api.add_resource(OrderResource, "/orders/<int:order_id>")