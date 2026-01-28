from flask_restful import Resource
from flask import request

from models import Owner
from extensions import db


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

        if Owner.query.filter_by(email=data.get("email")).first():
            return {"error": "Email already exists"}, 400

        owner = Owner(
            name=data["name"],
            email=data["email"],
            password_hashed=data["password_hashed"]
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

        owner.name = data.get("name", owner.name)
        owner.email = data.get("email", owner.email)

        db.session.commit()

        return {"message": "Owner updated successfully"}, 200

    def delete(self, owner_id):
        owner = Owner.query.get_or_404(owner_id)

        db.session.delete(owner)
        db.session.commit()

        return {"message": "Owner deleted successfully"}, 204
