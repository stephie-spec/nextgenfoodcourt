from flask import request
from flask_restful import Resource
from server.models import db, Customer, check_password, hash_password, password_hashed
from ..auth.permissions import require_customer
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
        )
        customer.set_password(data["password"])

        db.session.add(customer)
        db.session.commit()

        # return {"message": "Customer created successfully."}, 201

        # Returning the created customer details for testing purposes
        return {
            "id" : customer.id,
            "name" : customer.name,
            "email" : customer.email
        }, 201


# Customer login
class CustomerDetails(Resource):

    def get (self) :

        customer = require_customer ()

        if not customer :
            return { "message" : "Unauthorized" }, 401
        
        return {
            "id" : customer.id,
            "name" : customer.name,
            "email" : customer.email
        }, 200
    
    # Updating customer details
    def put (self) :

        customer = require_customer ()

        if not customer :

            return { "error" : "Unauthorized"}, 401
        
        data = request.get_json()
        customer.name = data.get("name", customer.name)
        customer.email = data.get("email", customer.email)
        if data.get("password") :
            customer.set_password ( data["password"] )
        
        db.session.commit()

        # return { "message" : "Details updated successfully"}
        return {
            "id" : customer.id,
            "name" : customer.name,
            "email" : customer.email
        }, 200

# View list of all outlets
class ListOutlets(Resource):

    def get(self):

        outlets = Outlet.query.all()
        outlet_list = [{
            "name": outlet.name,
            "cuisine": outlet.category_name
        } for outlet in outlets]

        return {"outlets": outlet_list}, 200


# View the menu of a specific outlet
class OutletMenu(Resource):

    def get(self, outlet_id):

        outlet = Outlet.query.get(outlet_id)
        if not outlet:
            return {"message": "Outlet not found."}, 404
        
        # MOI -MenuOutletItem
        menu_items = MOI.query.filter_by(outlet_id=outlet.id).all()
        menu = [{
            "item_name": item.name,
            "price": item.price,
            "image": item.image
        } for item in menu_items]

        return {"outlet": outlet.name, "menu": menu}, 200


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
api.add_resource(CustomerDetails, "/api/customer/login")

api.add_resource(ListOutlets, "/api/customer/outlets")
api.add_resource(OutletMenu, "/api/customer/outlet/<int:outlet_id>/menu")
api.add_resource(CreateOrder, "/api/customer/order")
api.add_resource(CustomerOrders, "/api/customer/my_orders")
api.add_resource(CustomerTableBooking, "/api/customer/book-table")