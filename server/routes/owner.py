from flask_restful import Api, Resource
from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, Owner

owner_bp = Blueprint("owner_bp", __name__)
api = Api(owner_bp)

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
