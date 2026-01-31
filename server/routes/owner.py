from flask_restful import Resource
from flask import request
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, Owner
from auth.permissions import require_owner
from auth.jwt import generate_token

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

class OwnerListResource(Resource):
    def get(self):
        owners = Owner.query.all()
        return [
            {
                "id": owner.id,
                "name": owner.name,
                "email": owner.email
            }
            for owner in owners
        ], 200

    def post(self):
        data = request.get_json()

        if not data:
            return {"error": "No input data provided"}, 400
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        if not name or not email or not password:
            return {"error": "name, email, and password are required"}, 400
        if Owner.query.filter_by(email=data.get("email")).first():
            return {"error": "Email already exists"}, 400

        hashed_password = generate_password_hash(password)

        owner = Owner(
            name=data["name"],
            email=data["email"],
            password_hashed=hashed_password
        )

        db.session.add(owner)
        db.session.commit()

        return {
            "id": owner.id,
            "name": owner.name,
            "email": owner.email
        }, 201


class OwnerResource(Resource):
    def get(self, owner_id):
        owner = Owner.query.get_or_404(owner_id)
        return {
            "id": owner.id,
            "name": owner.name,
            "email": owner.email
        }, 200

    def put(self, owner_id):
        owner = Owner.query.get_or_404(owner_id)
        data = request.get_json()

        if not data:
            return {"error": "Request body is required"}, 400
        owner.name = data.get("name", owner.name)
        owner.email = data.get("email", owner.email)
        if "password" in data:
            owner.password_hashed = generate_password_hash(data["password"])

        db.session.commit()

        return {"message": "Owner updated successfully"}, 200

    def delete(self, owner_id):
        owner = Owner.query.get_or_404(owner_id)

        db.session.delete(owner)
        db.session.commit()

        return {"message": "Owner deleted successfully"}, 204
class OwnerAccountResource(Resource):

    def get(self):
        owner = require_owner()
        if not owner:
            return {"message": "Unauthorized"}, 401

        return {
            "id": owner.id,
            "name": owner.name,
            "email": owner.email
        }, 200

    def put(self):
        owner = require_owner()
        if not owner:
            return {"message": "Unauthorized"}, 401

        data = request.get_json()
        owner.name = data.get("name", owner.name)
        owner.email = data.get("email", owner.email)

        if "password" in data:
            owner.password_hashed = generate_password_hash(data["password"])

        db.session.commit()

        return {
            "id": owner.id,
            "name": owner.name,
            "email": owner.email
        }, 200

    def delete(self):
        owner = require_owner()
        if not owner:
            return {"message": "Unauthorized"}, 401

        db.session.delete(owner)
        db.session.commit()

        return {"message": "Account deleted successfully"}, 200