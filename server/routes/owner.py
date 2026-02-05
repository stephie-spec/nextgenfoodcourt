from flask_restful import Resource
from flask import request
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, Owner, Outlet
from auth.permissions import require_owner
from auth.jwt import generate_token
import re


# Owner registration
class OwnerSignUp(Resource):

    def post(self):
        data = request.get_json()

        if not data.get("name") or not data.get("email") or not data.get("password"):
            return {"message": "Name, email, and password are required."}, 400

        # # Email format validation
        # email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        # if not re.match(email_regex, data["email"]):
        #     return {"message": "Invalid email format."}, 400
        
        # # Password strength validation
        # if len(data["password"]) < 8:
        #     return {"message": "Password must be at least 8 characters long."}, 400

        if Owner.query.filter_by(email=data["email"]).first():
            return {"message": "Email already exists."}, 400
        
        hashed_password = generate_password_hash(data["password"])

        owner = Owner(
            name=data["name"],
            email=data["email"],
            password_hashed=hashed_password
        )

        db.session.add(owner)
        db.session.commit()
        token = generate_token(owner.id, "owner")

        return {
            "token": token,
            "owner": {
                "id": owner.id,
                "name": owner.name,
                "email": owner.email
            }
        }, 201

class OwnerLoginResource(Resource):

    def post(self):
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return {"message": "Email and password required."}, 400
        
        owner = Owner.query.filter_by(email=email).first()

        if not owner or not check_password_hash(owner.password_hashed, password):
            return {"message": "Wrong email or password."}, 401
        
        token = generate_token(owner.id, "owner")

        return {
            "token": token,
            "owner": {
                "id": owner.id,
                "name": owner.name,
                "email": owner.email
            }
        }, 200


class OwnerDetails(Resource):

    def get(self):
        owner = require_owner()

        if not owner:
            return {"message": "Unauthorized"}, 401
        
        return {
            "id": owner.id,
            "name": owner.name,
            "email": owner.email
        }, 200
    
    # Updating owner details
    def put(self):
        owner = require_owner()

        if not owner:
            return {"error": "Unauthorized"}, 401
        
        data = request.get_json()

        # # Email format validation if email is being updated
        # if data.get("email") and data["email"] != owner.email:
        #     email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        #     if not re.match(email_regex, data["email"]):
        #         return {"message": "Invalid email format."}, 400
            
            # Check if new email already exists
        if Owner.query.filter_by(email=data["email"]).first():
                return {"message": "Email already exists."}, 400

        # # Password strength validation if password is being updated
        # if data.get("password"):
        #     if len(data["password"]) < 8:
        #         return {"message": "Password must be at least 8 characters long."}, 400

        owner.name = data.get("name", owner.name)
        owner.email = data.get("email", owner.email)

        if data.get("password"):
            owner.password_hashed = generate_password_hash(data["password"])
        
        db.session.commit()

        return {
            "id": owner.id,
            "name": owner.name,
            "email": owner.email
        }, 200
    
    # Delete owner account
    def delete(self):
        owner = require_owner()

        if not owner:
            return {"error": "Unauthorized"}, 401
        
        db.session.delete(owner)
        db.session.commit()

        return {"message": "Account deleted successfully"}, 200


class OwnerOutletResource(Resource):
    def get(self, owner_id):
        if not Owner.query.get(owner_id):
            return {"error": "Owner not found"}, 404
        
        outlets = Outlet.query.filter_by(owner_id=owner_id).all()
        return [{
            "id": outlet.id,
            "name": outlet.name,
            "category_name": outlet.category_name,
            "owner_id": outlet.owner_id,
            "image_path": outlet.image_path
        } for outlet in outlets], 200