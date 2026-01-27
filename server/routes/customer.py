from flask import request
from flask_restful import Resource
from server.models import db, Customer, Order, Item, check_password, hash_password, password_hashed
# from flask_cors import cross_origin



# Customer registration
class CustomerSignUp(Resource):


    def post(self):

        data = request.get_json()

        if not data.get("name") or not data.get("email") or not data.get("password"):
            return {"message": "Name, email, and password are required."}, 400

        if Customer.query.filter_by(email=data["email"]).first():
            return {"message": "Email already exists."}, 400

        customer = Customer(

            name=data["name"],
            email=data["email"],
            password_hashed=hash_password(data["password"])
        )

        db.session.add(customer)
        db.session.commit()

        return {"message": "Customer created successfully."}, 201


# Customer login
class CustomerLogin(Resource):

    pass


# View list of all outlets
class ListOutlets(Resource):

    pass


# View menu of a specific outlet
class OutletMenu(Resource):

    pass


# Place an order
class CreateOrder(Resource):

    pass


# List the customer's orders
class CustomerOrders(Resource):

    pass


# Book a table at the food court
class CustomerTableBooking(Resource):

    pass


# To be moved to app.py

api.add_resource(CustomerSignUp, "/api/customer/signup")
api.add_resource(CustomerLogin, "/api/customer/login")
api.add_resource(ListOutlets, "/api/customer/outlets")
api.add_resource(OutletMenu, "/api/customer/outlet/<int:outlet_id>/menu")
api.add_resource(CreateOrder, "/api/customer/order")
api.add_resource(CustomerOrders, "/api/customer/orders")
api.add_resource(CustomerTableBooking, "/api/customer/book-table")