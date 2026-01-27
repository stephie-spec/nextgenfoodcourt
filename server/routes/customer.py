from flask import request
from flask_restful import Resource
from server.models import db, Customer, Order, Item, check_password, hash_password, password_hashed
# from flask_cors import cross_origin


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

    
class CustomerLogin(Resource):

    pass

