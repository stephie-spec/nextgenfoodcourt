from flask_restful import Api, Resource

from datetime import datetime

from models import db, Order, OrderStatus, Customer, MenuOutletItem


# order_bp = Blueprint("order_bp", __name__)
# api = Api(order_bp)


# Helpers

def serialize_order(order):
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "menu_outlet_item_id": order.menu_outlet_item_id,
        "quantity": order.quantity,
        "status": order.status.value,
        "created_at": order.created_at.isoformat(),
        "estimated": order.estimated.isoformat() if order.estimated else None
    }

class OrderListResource(Resource):

    def get(self):
        """
        Get all orders
        """
        orders = Order.query.all()
        return [serialize_order(order) for order in orders], 200

    def post(self):
        """
        Create a new order
        """
        data = request.get_json()

        if not data:
            return {"error": "Request body is required"}, 400

        customer_id = data.get("customer_id")
        menu_outlet_item_id = data.get("menu_outlet_item_id")
        quantity = data.get("quantity")

        if not all([customer_id, menu_outlet_item_id, quantity]):
            return {
                "error": "customer_id, menu_outlet_item_id, and quantity are required"
            }, 400

        if quantity <= 0:
            return {"error": "quantity must be greater than 0"}, 400

        customer = Customer.query.get(customer_id)
        if not customer:
            return {"error": "Customer not found"}, 404

        menu_item = MenuOutletItem.query.get(menu_outlet_item_id)
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
            "order": serialize_order(order)
        }, 201

class OrderResource(Resource):

    def get(self, order_id):
        """
        Get a single order
        """
        order = Order.query.get_or_404(order_id)
        return serialize_order(order), 200

    def put(self, order_id):
        """
        Update an order
        """
        order = Order.query.get_or_404(order_id)
        data = request.get_json()

        if not data:
            return {"error": "Request body is required"}, 400

        if "quantity" in data:
            if data["quantity"] <= 0:
                return {"error": "quantity must be greater than 0"}, 400
            order.quantity = data["quantity"]

        if "status" in data:
            try:
                order.status = OrderStatus(data["status"])
            except ValueError:
                return {
                    "error": "Invalid status. Use 'pending' or 'completed'"
                }, 400

        if "estimated" in data:
            try:
                order.estimated = datetime.fromisoformat(data["estimated"])
            except ValueError:
                return {"error": "estimated must be ISO datetime string"}, 400

        db.session.commit()

        return {
            "message": "Order updated successfully",
            "order": serialize_order(order)
        }, 200

    def delete(self, order_id):
        """
        Delete an order
        """
        order = Order.query.get_or_404(order_id)

        db.session.delete(order)
        db.session.commit()

        return {"message": "Order deleted successfully"}, 204

