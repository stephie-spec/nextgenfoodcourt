from flask import request
from flask_restful import Resource
from server.models import db, Customer, Order, Item, check_password, password_hashed
# from flask_cors import cross_origin


class CustomerSignUp(Resource):


    def post(self):

        data = request.get_json()
        customer = Customer(

            name=data['name'],
            email=data['email'],
            password_hashed=data['password_hashed']
        )

        db.session.add(customer)
        db.session.commit()

        return customer.to_dict(), 201

    
