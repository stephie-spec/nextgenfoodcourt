from flask import request
from flask_restful import Resource
from models import db, Outlet, Owner, MenuOutletItem, Item
from auth.permissions import require_owner
from werkzeug.utils import secure_filename
import os

# Configuration for file uploads
UPLOAD_FOLDER = '../photos'  # Relative path to photos folder
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    """Check if file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_outlet_image(file, outlet_name):
    """
    Save outlet image with sanitized outlet name as filename
    Returns: filename if successful, None if failed
    """
    if file and allowed_file(file.filename):
        # Get file extension
        extension = file.filename.rsplit('.', 1)[1].lower()
        
        # Create filename from outlet name
        safe_name = "".join(c if c.isalnum() else "_" for c in outlet_name)
        filename = f"{safe_name}.{extension}"
        
        # Ensure upload folder exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Save file
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        return filename
    return None

# View list of all outlets
class ListOutlets(Resource):

    def get(self):

        outlets = Outlet.query.all()
        outlet_list = [{
            "id": outlet.id,
            "name": outlet.name,
            "category_name": outlet.category_name,
            "owner_id": outlet.owner_id,
            "image_path": outlet.image_path if outlet.image_path and outlet.image_path.strip() else 'default-outlet.jpg'
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
            owner_id = owner.id,
            image_path=data.get("image_path")
        )

        db.session.add ( outlet )
        db.session.commit()

        # return { f"message" : "Outlet {outlet.name} created successfully" }, 201
        return {
            "id" : outlet.id,
            "name" : outlet.name,
            "category_name" : outlet.category_name,
            "owner_id" : outlet.owner_id,
            "image_path": outlet.image_path if outlet.image_path else 'default-outlet.jpg'
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
            "owner_id": outlet.owner_id,
            "image_path": outlet.image_path if outlet.image_path and outlet.image_path.strip() else 'default-outlet.jpg'
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
        outlet.image_path = data.get("image_path", outlet.image_path) 
        db.session.commit()

        # return { "message" : "Outlet updated successfully." }, 200
        return {
            "id" : outlet.id,
            "name" : outlet.name,
            "category_name" : outlet.category_name,
            "owner_id": outlet.owner_id,
            "image_path": outlet.image_path if outlet.image_path else 'default-outlet.jpg'
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
            "id": link.id,  # MenuOutletItem ID needed for bookings
            "item_id": link.item_id,
            "item_name": link.item.name,
            "price": link.item.price,
            "image": link.item.image
        } for link in menu_links]

        return {"outlet": outlet.name, "menu": menu}, 200
    