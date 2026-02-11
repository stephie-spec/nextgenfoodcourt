from flask import request
from flask_restful import Resource
from models import db, Testimonial, Outlet
from auth.permissions import require_owner
import uuid


class TestimonialListResource(Resource):
    
    def get(self):
        # Get query parameter for filtering by outlet
        outlet_id = request.args.get('outletId')
        
        if outlet_id:
            # Filter by outlet
            testimonials = Testimonial.query.filter_by(outlet_id=outlet_id).all()
        else:
            # Get all testimonials
            testimonials = Testimonial.query.all()
        
        testimonials_list = []
        for testimonial in testimonials:
            testimonials_list.append({
                "id": testimonial.id,
                "outlet_id": testimonial.outlet_id,
                "outlet_name": testimonial.outlet.name,
                "customer_name": testimonial.customer_name,
                "avatar": testimonial.avatar if testimonial.avatar and testimonial.avatar.strip() else 'default-avatar.jpg',
                "rating": testimonial.rating,
                "review_text": testimonial.review_text,
                "created_at": testimonial.created_at.isoformat() if testimonial.created_at else None,
                "updated_at": testimonial.updated_at.isoformat() if testimonial.updated_at else None
            })
        
        return {"testimonials": testimonials_list, "count": len(testimonials_list)}, 200
    
    def post(self):
        data = request.get_json()
        
        if not data:
            return {"error": "No input data provided"}, 400
        
        # Validate required fields
        outlet_id = data.get("outlet_id")
        customer_name = data.get("customer_name")
        rating = data.get("rating")
        review_text = data.get("review_text")
        
        if not all([outlet_id, customer_name, rating, review_text]):
            return {"error": "Missing required fields"}, 400
        
        # Validate rating is between 1-5
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return {"error": "Rating must be between 1 and 5"}, 400
        
        # Check if outlet exists
        outlet = Outlet.query.get(outlet_id)
        if not outlet:
            return {"error": "Outlet not found"}, 404
        
        # Create testimonial
        testimonial = Testimonial(
            id=str(uuid.uuid4()),
            outlet_id=outlet_id,
            customer_name=customer_name,
            avatar=data.get("avatar"),
            rating=rating,
            review_text=review_text
        )
        
        db.session.add(testimonial)
        db.session.commit()
        
        return {
            "id": testimonial.id,
            "outlet_id": testimonial.outlet_id,
            "outlet_name": testimonial.outlet.name,
            "customer_name": testimonial.customer_name,
            "avatar": testimonial.avatar if testimonial.avatar else 'default-avatar.jpg',
            "rating": testimonial.rating,
            "review_text": testimonial.review_text,
            "created_at": testimonial.created_at.isoformat() if testimonial.created_at else None,
            "updated_at": testimonial.updated_at.isoformat() if testimonial.updated_at else None
        }, 201


class TestimonialResource(Resource):
    
    def get(self, testimonial_id):
        testimonial = Testimonial.query.get(testimonial_id)
        
        if not testimonial:
            return {"message": "Testimonial not found"}, 404
        
        return {
            "id": testimonial.id,
            "outlet_id": testimonial.outlet_id,
            "outlet_name": testimonial.outlet.name,
            "customer_name": testimonial.customer_name  if testimonial .outlet else None,
            "avatar": testimonial.avatar if testimonial.avatar and testimonial.avatar.strip() else 'default-avatar.jpg',
            "rating": testimonial.rating,
            "review_text": testimonial.review_text,
            "created_at": testimonial.created_at.isoformat() if testimonial.created_at else None,
            "updated_at": testimonial.updated_at.isoformat() if testimonial.updated_at else None
        }, 200
    
    def patch(self, testimonial_id):
        # Admin only - you can add owner permission check here
        # owner = require_owner()
        # if not owner:
        #     return {"message": "Unauthorized"}, 401
        
        testimonial = Testimonial.query.get(testimonial_id)
        
        if not testimonial:
            return {"message": "Testimonial not found"}, 404
        
        data = request.get_json()
        
        # Update fields if provided
        if "customer_name" in data:
            testimonial.customer_name = data["customer_name"]
        
        if "avatar" in data:
            testimonial.avatar = data["avatar"]
        
        if "rating" in data:
            rating = data["rating"]
            if not isinstance(rating, int) or rating < 1 or rating > 5:
                return {"error": "Rating must be between 1 and 5"}, 400
            testimonial.rating = rating
        
        if "review_text" in data:
            testimonial.review_text = data["review_text"]
        
        db.session.commit()
        
        return {
            "id": testimonial.id,
            "outlet_id": testimonial.outlet_id,
            "outlet_name": testimonial.outlet.name,
            "customer_name": testimonial.customer_name,
            "avatar": testimonial.avatar if testimonial.avatar else 'default-avatar.jpg',
            "rating": testimonial.rating,
            "review_text": testimonial.review_text,
            "created_at": testimonial.created_at.isoformat() if testimonial.created_at else None,
            "updated_at": testimonial.updated_at.isoformat() if testimonial.updated_at else None
        }, 200
    
    def delete(self, testimonial_id):
        # Admin only - you can add owner permission check here
        # owner = require_owner()
        # if not owner:
        #     return {"message": "Unauthorized"}, 401
        
        testimonial = Testimonial.query.get(testimonial_id)
        
        if not testimonial:
            return {"message": "Testimonial not found"}, 404
        
        db.session.delete(testimonial)
        db.session.commit()
        
        return {"message": f"Testimonial from {testimonial.customer_name} deleted successfully"}, 200