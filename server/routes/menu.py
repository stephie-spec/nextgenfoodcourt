import os
import uuid
from werkzeug.utils import secure_filename
from flask_restful import Resource
from flask import request

from extensions import db
from models import MenuOutletItem, Outlet, Item


# Configuration for file uploads
UPLOAD_FOLDER = '../photos' 
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def allowed_file(filename):
    """Check if file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_item_image(file, item_name):
    """
    Save item image with unique filename
    Returns: filename if successful, None if failed
    """
    if file and allowed_file(file.filename):
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE:
            return None
        
        # Generate unique filename to avoid collisions
        original_name = secure_filename(file.filename)
        extension = original_name.rsplit('.', 1)[1].lower() if '.' in original_name else 'jpg'
        
        # Create safe item name for filename
        safe_item_name = "".join(c if c.isalnum() else "_" for c in item_name.lower())
        unique_id = str(uuid.uuid4())[:8]  # Short unique ID
        filename = f"item_{safe_item_name}_{unique_id}.{extension}"
        
        # Ensure upload folder exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Save file
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        print(f"Saved item image: {filename} to {filepath}")
        return filename
    return None



class MenuListResource(Resource):
    def get(self):
        """
        Get all menu items (outlet ↔ item) with full item details
        """
        try:
            menu_items = MenuOutletItem.query.all()
            if not menu_items:
                return {"message": "No menu items found"}, 404

            result = []
            for menu in menu_items:
                if not menu.outlet or not menu.item:
                    continue  # Skip incomplete menu items
                
                result.append({
                    "id": menu.id,
                    "outlet_id": menu.outlet_id,
                    "outlet_name": menu.outlet.name,
                    "item_id": menu.item_id,
                    "item_name": menu.item.name,
                    "image": menu.item.image if menu.item.image and menu.item.image.strip() else "default-food.jpg",  
                    "description": menu.item.description or "", 
                    "image_path": menu.item.image if menu.item.image and menu.item.image.strip() else "default-food.jpg",
                    "price": float(menu.item.price) if menu.item.price else 0.0,
                    "category": menu.item.category_name or "Uncategorized",
                    "is_available": menu.item.is_available if menu.item.is_available is not None else True,
                })
            
            return result, 200
        except Exception as e:
            print(f"Error in MenuListResource.get(): {str(e)}")
            return {"error": "Internal Server Error", "message": str(e)}, 500

    def post(self):
        """
        Add new item + link it to an outlet's menu (handles multipart/form-data)
        """
        # Handle form data (multipart/form-data)
        name = request.form.get('name')
        price_str = request.form.get('price')
        description = request.form.get ( 'description' )
        category = request.form.get('category')
        is_available_str = request.form.get('is_available')
        outlet_id_str = request.form.get('outlet_id')
        image_file = request.files.get('image')

        if not name or not price_str or not outlet_id_str:
            return {"error": "name, price, and outlet_id are required"}, 400

        try:
            price = float(price_str)
            outlet_id = int(outlet_id_str)
            is_available = is_available_str.lower() == 'true' if is_available_str else True
        except ValueError:
            return {"error": "Invalid price or outlet_id format"}, 400

        outlet = Outlet.query.get(outlet_id)
        if not outlet:
            return {"error": "Outlet not found"}, 404

        # Handle image upload 
        image_filename = "default-food.jpg"
        if image_file and image_file.filename:
            saved_filename = save_item_image(image_file, name)
            if saved_filename:
                image_filename = saved_filename
            else:
                return {"error": "Invalid image file format. Allowed: png, jpg, jpeg, gif, webp"}, 400


        # Create new Item
        new_item = Item(
            name=name,
            price=price,
            description = description,
            category_name=category,
            is_available=is_available,
            image=image_filename
        )

        db.session.add(new_item)
        db.session.flush()  # Get new_item.id

        # Link to outlet
        existing_link = MenuOutletItem.query.filter_by(
            outlet_id=outlet_id,
            item_id=new_item.id
        ).first()

        if existing_link:
            db.session.rollback()
            return {"error": "Item already exists in this outlet menu"}, 409

        menu_link = MenuOutletItem(
            outlet_id=outlet_id,
            item_id=new_item.id
        )

        db.session.add(menu_link)
        db.session.commit()

        return {
            "message": "Item created and added to menu",
            "item_id": new_item.id,
            "menu_id": menu_link.id,
            "image_url": f"/uploads/{image_filename}"  
        }, 201


class MenuResource(Resource):
    def get(self, menu_id):
        """
        Get single menu record
        """
        menu = MenuOutletItem.query.get_or_404(menu_id)

        return {
            "id": menu.id,
            "outlet_id": menu.outlet_id,
            "outlet_name": menu.outlet.name,
            "item_id": menu.item_id,
            "item_name": menu.item.name,
            "image": menu.item.image if menu.item and menu.item.image and menu.item.image.strip() else "default-food.jpg",  
            "description" : menu.item.description if menu.item else None,
            "image_path": menu.item.image if menu.item and menu.item.image and menu.item.image.strip() else "default-food.jpg",
            "price": menu.item.price
        }, 200

    def put(self, menu_id):
        """
        Update an existing menu item
        """
        menu = MenuOutletItem.query.get_or_404(menu_id)
        item = Item.query.get_or_404(menu.item_id)
        
        # Handle form data
        name = request.form.get('name')
        price_str = request.form.get('price')
        category = request.form.get('category')
        is_available_str = request.form.get('is_available')
        image_file = request.files.get('image')
        
        # Update item fields if provided
        if name:
            item.name = name
        
        if price_str:
            try:
                item.price = float(price_str)
            except ValueError:
                return {"error": "Invalid price format"}, 400
        
        if category:
            item.category_name = category
        
        if is_available_str:
            item.is_available = is_available_str.lower() == 'true'
        
        # Handle image upload if new image is provided
        if image_file and image_file.filename:
            saved_filename = save_item_image(image_file, item.name)
            if saved_filename:
                item.image = saved_filename
            else:
                return {"error": "Invalid image file format. Allowed: png, jpg, jpeg, gif, webp"}, 400
        
        db.session.commit()
        
        return {
            "message": "Item updated successfully",
            "item_id": item.id,
            "menu_id": menu.id,
            "image": item.image
        }, 200


    def delete(self, menu_id):
        """
        Remove item from menu
        """
        menu = MenuOutletItem.query.get_or_404(menu_id)

        db.session.delete(menu)
        db.session.commit()

        return {"message": "Menu item removed"}, 204
