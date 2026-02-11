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
            "image_path": outlet.image_path if outlet.image_path and outlet.image_path.strip() else 'default-food.jpg'
        } for outlet in outlets]

        return {"outlets": outlet_list}, 200
    
    # Create a new outlet - Owner-only route
    def post(self):
        owner = require_owner()
        if not owner:
            return {"message": "Unauthorized"}, 401

        content_type = request.headers.get('Content-Type', '').lower()

        name = None
        category_name = None
        image_filename = "default-food.jpg"

        # Handle multipart/form-data (with or without image)
        if 'multipart/form-data' in content_type:
            name = request.form.get('name')
            category_name = request.form.get('category_name')
            image_file = request.files.get('image')

            if image_file and allowed_file(image_file.filename):
                image_filename = save_outlet_image(image_file, name or "outlet")
                if not image_filename:
                    return {"message": "Invalid image file"}, 400

        # Handle application/json (no image)
        elif 'application/json' in content_type:
            data = request.get_json()
            if not data:
                return {"message": "No data provided"}, 400
            name = data.get("name")
            category_name = data.get("category_name")
            # image can be passed as path if needed, but usually not
            image_filename = data.get("image_path", "default-food.jpg")

        else:
            return {"message": "Unsupported Media Type. Use multipart/form-data or application/json"}, 415

        # Common validation
        if not name or not category_name:
            return {"message": "Name and category_name are required"}, 400

        # Create the outlet
        outlet = Outlet(
            name=name,
            category_name=category_name,
            owner_id=owner.id,
            image_path=image_filename
        )

        db.session.add(outlet)
        db.session.commit()

        return {
            "id": outlet.id,
            "name": outlet.name,
            "category_name": outlet.category_name,
            "owner_id": outlet.owner_id,
            "image_path": outlet.image_path
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

        # Check if request contains files (multipart/form-data)
        if 'image' in request.files:
            # Get data from form
            name = request.form.get('name', outlet.name)
            category_name = request.form.get('category_name', outlet.category_name)
            image_file = request.files['image']
            
            # Save new image and get filename
            image_filename = save_outlet_image(image_file, name)
            
            if image_filename:
                # Delete old image if it's not the default
                if outlet.image_path and outlet.image_path != 'default-outlet.jpg':
                    old_image_path = os.path.join(UPLOAD_FOLDER, outlet.image_path)
                    if os.path.exists(old_image_path):
                        try:
                            os.remove(old_image_path)
                        except Exception as e:
                            print(f"Error deleting old image: {e}")
                
                outlet.image_path = image_filename
                
        else:
            # Get data from JSON
            data = request.get_json()
            name = data.get("name", outlet.name)
            category_name = data.get("category_name", outlet.category_name)
            
            # Only update image_path if explicitly provided in JSON
            if "image_path" in data:
                outlet.image_path = data["image_path"]

        outlet.name = name
        outlet.category_name = category_name
        db.session.commit()

        return {
            "id": outlet.id,
            "name": outlet.name,
            "category_name": outlet.category_name,
            "owner_id": outlet.owner_id,
            "image_path": outlet.image_path if outlet.image_path else 'default-outlet.jpg'
        }, 200
        
    # Delete an outlet - Owner-only route
    def delete (self, outlet_id) :

        owner = require_owner()

        if not owner :

            return { "message" : "Unauthorized" }, 401
        
        outlet = Outlet.query.get ( outlet_id)

        if not outlet:
            return {"message": "Outlet not found"}, 404

        # Check whether it is the right outlet owner
        if outlet.owner_id != owner.id:
            return {"message": "Unauthorized. Not registered owner."}, 403
        
        # Delete image file if it's not the default
        if outlet.image_path and outlet.image_path != 'default-outlet.jpg':
            image_path = os.path.join(UPLOAD_FOLDER, outlet.image_path)
            if os.path.exists(image_path):
                try:
                    os.remove(image_path)
                except Exception as e:
                    print(f"Error deleting image: {e}")
        
        db.session.delete(outlet)
        db.session.commit()

        return {"message": f"Outlet {outlet.name} deleted successfully."}, 200

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
    
class OwnerOutletsResource(Resource):
    """Get outlets for the currently authenticated owner"""
    
    def get(self):
        owner = require_owner()
        
        if not owner:
            return {"message": "Unauthorized"}, 401
        
        # Get all outlets owned by this owner
        outlets = Outlet.query.filter_by(owner_id=owner.id).all()
        
        outlet_list = [{
            "id": outlet.id,
            "name": outlet.name,
            "category_name": outlet.category_name,
            "owner_id": outlet.owner_id,
            "image_path": outlet.image_path if outlet.image_path and outlet.image_path.strip() else 'default-food.jpg'
        } for outlet in outlets]
        
        return {"outlets": outlet_list}, 200