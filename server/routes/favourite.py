
from flask import request
from flask_restful import Resource
from models import db, Item, CustomerFavourite, MenuOutletItem, Outlet
from auth.permissions import require_customer
from sqlalchemy import func # SQLAlchemy function imports - to be removed later



class CustomerFavourites ( Resource ) :

    # Get all favourite items for the customer logged in
    def get ( self) :

        customer = require_customer ()

        if not customer :
            return { "message" : "Unauthorized" }, 401
        
        favourites = CustomerFavourite.query.filter_by ( customer_id = customer.id ).all()

        favourite_items = [
            {
                "id" : fav.item.id,
                "name" : fav.item.name,
                "description" : fav.item.description,
                "image" : fav.item.image,
                "image_path" : fav.item.image,
                "price" : fav.item.price,
                "is_available" : fav.item.is_available,
                "favourites_count" : fav.item.favourites,
                "is_favorite" : True
            }
            for fav in favourites ]
            
        return { "Your Favourites" : favourite_items }, 200


class FavouriteButton ( Resource ) :

    # Customer-only route to (un)favourite an item
    def post ( self, item_id ) :

        customer = require_customer ()

        if not customer :
            return { "message" : "Unauthorized" }, 401
        
        item = Item.query.get ( item_id )

        if not item :
            return { "message" : "Item not found" }, 404
        
        current_fav = CustomerFavourite.query.filter_by ( customer_id = customer.id, item_id = item_id ).first()

        # Removing a favourite
        if current_fav :

            db.session.delete ( current_fav )
            item.favourites = item.favourites - 1 if item.favourites > 0 else 0
            db.session.commit()

            return { 
                "message": f"Removed {item.name} from favourites",
                "favourited": False,
                "favourite_count": item.favourites
            }, 200
        
        # Adding a new favourite
        new_fav = CustomerFavourite ( customer_id = customer.id, item_id = item_id )
        db.session.add ( new_fav )
        item.favourites = item.favourites + 1
        db.session.commit()

        return { 
            "message": f"Added {item.name} to favourites",
            "favourited": True,
            "favourite_count": item.favourites
        }, 201



# Get the top 4 favourited items by customers
class TopFavourites(Resource):

    def get(self):
        top_items = (
            db.session.query(
                Item,
                func.count(CustomerFavourite.id).label("favourite_count")
            )
            .join(CustomerFavourite)
            .group_by(Item.id)
            .order_by(func.count(CustomerFavourite.id).desc())
            .limit(4) # Only four top items to show in homepage
            .all()
        )

        customer = require_customer()
        favorite_ids = set()
        if customer:
            favorite_ids = {
                fav.item_id
                for fav in CustomerFavourite.query.filter_by(customer_id=customer.id).all()
            }

        response = []
        for item, favourite_count in top_items:
            menu_link = MenuOutletItem.query.filter_by(item_id=item.id).first()
            outlet = Outlet.query.get(menu_link.outlet_id) if menu_link else None

            response.append(
                {
                    "id": item.id,
                    "name": item.name,
                    "price": item.price,
                    "image": item.image,
                    "image_path": item.image,
                    "favourite_count": favourite_count,
                    "is_favorite": item.id in favorite_ids,
                    "outlet_id": menu_link.outlet_id if menu_link else None,
                    "outlet_name": outlet.name if outlet else None
                }
            )

        return response, 200

    
