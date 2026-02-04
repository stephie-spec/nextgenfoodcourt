
from flask import request
from flask_restful import Resource
from models import db, Customer
from auth.permissions import require_customer
from auth.jwt import generate_token
from werkzeug.security import generate_password_hash, check_password_hash

# from flask_cors import cross_origin

# NOTE: password_hashed is the column name in the Customer model

# Customer registration
class CustomerSignUp(Resource):


    def post(self):

        data = request.get_json()

        if not data.get("name") or not data.get("email") or not data.get("password"):
            return {"message": "Name, email, and password are required."}, 400

        if Customer.query.filter_by(email=data["email"]).first():
            return {"message": "Email already exists."}, 400
        
        hashed_password = generate_password_hash(data["password"])

        customer = Customer(

            name=data["name"],
            email=data["email"],
            password_hashed = hashed_password
        )

        db.session.add(customer)
        db.session.commit()

        # return {"message": "Customer created successfully."}, 201

        # Returning the created customer details for testing purposes
        return {
            "id" : customer.id,
            "name" : customer.name,
            "email" : customer.email
        }, 201



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

            customer.password_hashed = generate_password_hash(data["password"])
            
        
        db.session.commit()

        # return { "message" : "Details updated successfully"}
        return {
            "id" : customer.id,
            "name" : customer.name,
            "email" : customer.email
        }, 200
    

    # Delete customer account
    def delete (self) :

        customer = require_customer()

        if not customer :
            
            return { "error" : "Unauthorized"}, 401
        
        db.session.delete ( customer )
        db.session.commit()

        return { "message" : "Account deleted successfully"}, 200


class CustomerLoginResource(Resource) :

    def post (self) :

        data = request.get_json()

        email = data.get ( "email" )
        password = data.get ( "password" )

        if not email or not password :

            return { "message" : "Email and password required."}, 400
        
        customer = Customer.query.filter_by ( email = email ).first()

        if not customer or not check_password_hash(customer.password_hashed, password):

            return { "message" : "Wrong email or password."}, 401
        
        token = generate_token ( customer.id, "customer" )

        return {
            "token": token,
            "customer": {
                "id": customer.id,
                "name": customer.name,
                "email": customer.email
            }
        }, 200


