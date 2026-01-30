from flask import request
from flask_restful import Resource
from models import db, Outlet, Owner, MenuOutletItem, Item
from auth.permissions import require_owner


# View list of all outlets
class ListOutlets(Resource):

    def get(self):

        outlets = Outlet.query.all()
        outlet_list = [{
            "name": outlet.name,
            "cuisine": outlet.category_name
        } for outlet in outlets]

        return {"outlets": outlet_list}, 200
    
    # Create a new outlet - Owner-only route
    def post (self) :

        owner = require_owner()

        if not owner :

            return { "message" : "Unauthorized" }, 401
        
        data = request.get_json()

        outlet = Outlet (
            name = data["name"],
            category_name = data["category_name"],
            owner_id = owner.id
        )

        db.session.add ( outlet )
        db.session.commit()

        # return { f"message" : "Outlet {outlet.name} created successfully" }, 201
        return {
            "id" : outlet.id,
            "name" : outlet.name,
            "category_name" : outlet.category_name,
            "owner_id" : outlet.owner_id
        }, 201


# View a specific outlet details
class OutletResource(Resource):

    def get(self, outlet_id):

        outlet = Outlet.query.get(outlet_id)
        if not outlet:
            return {"message": "Outlet not found."}, 404
        
        return {
            "id": outlet.id,
            "name": outlet.name,
            "category_name": outlet.category_name,
            "owner_id": outlet.owner_id
        }, 200
    

    # Update a specific outlet - Owner-only route
    def patch(self, outlet_id) :

        owner = require_owner()

        if not owner:

            return {"message": "Unauthorized"}, 401

        outlet = Outlet.query.get(outlet_id)

        if outlet.owner_id != owner.id:

            return {"message": "Unauthorized. Not registered owner."}, 403

        data = request.get_json()

        outlet.name = data.get( "name", outlet.name )
        outlet.category_name = data.get("category_name", outlet.category_name )

        db.session.commit()

        # return { "message" : "Outlet updated successfully." }, 200
        return {
            "id" : outlet.id,
            "name" : outlet.name,
            "category_name" : outlet.category_name
        }, 200


    # Delete an outlet - Owner-only route
    def delete (self, outlet_id) :

        owner = require_owner()

        if not owner :

            return { "message" : "Unauthorized" }, 401
        
        outlet = Outlet.query.get ( outlet_id)

        # Check whether it is the right outlet owner
        if outlet.owner_id != owner.id :

            return { "message" : "Unauthorized. Not registered owner."}, 401
        
        db.session.delete ( outlet )
        db.session.commit()

        return { "message" : f"Outlet {outlet.name} deleted successfully."}, 200




# View the menu of a specific outlet
class OutletMenu(Resource):

    def get(self, outlet_id):

        outlet = Outlet.query.get(outlet_id)
        if not outlet:
            return {"message": "Outlet not found."}, 404
        
        # MenuOutletItem entries for this outlet
        menu_links = MenuOutletItem.query.filter_by(outlet_id=outlet.id).all()
        menu = [{
            "item_name": link.item.name,
            "price": link.item.price,
            "image": link.item.image
        } for link in menu_links]

        return {"outlet": outlet.name, "menu": menu}, 200
    