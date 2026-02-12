import os
from flask import Flask
from flask_restful import Api
from flask_migrate import Migrate
from flask_cors import CORS

from extensions import db
from models import *   
from routes.owner import (
    OwnerLoginResource,
    OwnerSignUp,
    OwnerDetails,
    OwnerOutletResource
)
from routes.order import OrderListResource, OrderResource, CustomerOrderResource, OwnerOrderResource
from routes.item import ItemListResource, ItemResource
from routes.menu import MenuListResource, MenuResource
from routes.customer import CustomerLoginResource, CustomerDetails, CustomerSignUp
from routes.outlet import ListOutlets, OutletResource, OutletMenu, OwnerOutletsResource
from routes.testimonial import TestimonialListResource, TestimonialResource
from routes.table_booking import (
    TableBookingListResource,
    TableBookingResource,
    AvailableTablesResource,
    CustomerTableBookingsResource
)
from routes.favourite import CustomerFavourites, FavouriteButton, TopFavourites

def create_app():
    app = Flask(__name__, static_url_path='/uploads', static_folder=os.path.abspath('../photos'))

    # CONFIG
    app.config["SECRET_KEY"] = "super-secret-key-change-me"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = "12345"
    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024 

    CORS(app, supports_credentials=True,
    origins=["http://localhost:3000"],
    allow_headers=["Content-Type", "Authorization"])
    # INIT EXTENSIONS
    db.init_app(app)
    Migrate(app, db)

    api = Api(app)

    # ROUTES
    api.add_resource(OwnerSignUp, '/api/owner/signup')
    api.add_resource(OwnerLoginResource, '/api/owner/login')
    api.add_resource(OwnerDetails, '/api/owner/details')
    api.add_resource(OwnerOutletResource, '/api/owner/<int:owner_id>/outlets')
    api.add_resource(OrderListResource, "/api/orders")
    api.add_resource(OrderResource, "/api/orders/<int:order_id>")
    api.add_resource(CustomerOrderResource, "/api/orders/customer/<int:customer_id>")
    api.add_resource(OwnerOrderResource, "/api/orders/owner/<int:owner_id>")
    api.add_resource(ItemListResource, "/items")
    api.add_resource(ItemResource, "/items/<int:item_id>")
    api.add_resource(MenuListResource, "/api/menu")
    api.add_resource(MenuResource, "/api/menu/<int:menu_id>")
    api.add_resource(CustomerLoginResource, "/api/customer/login")
    api.add_resource(CustomerDetails, "/api/customer/details")
    api.add_resource(CustomerSignUp, "/api/customer/signup")
    api.add_resource(ListOutlets, "/api/outlets")
    api.add_resource(OwnerOutletsResource, "/api/owner/outlets")
    api.add_resource(OutletResource, "/api/outlets/<int:outlet_id>")
    api.add_resource(OutletMenu, "/api/outlet/<int:outlet_id>/menu")
    api.add_resource(TestimonialListResource, '/api/testimonials')
    api.add_resource(TestimonialResource, '/api/testimonials/<string:testimonial_id>')
    api.add_resource(CustomerFavourites, "/api/customer/favourites")
    api.add_resource(FavouriteButton, "/api/items/<int:item_id>/favourite")
    api.add_resource(TopFavourites, "/api/items/top_favourites")

    api.add_resource(TableBookingListResource, "/api/table-bookings")
    api.add_resource(TableBookingResource, "/api/table-bookings/<int:booking_id>")
    api.add_resource(AvailableTablesResource, "/api/table-bookings/available-tables")
    api.add_resource(CustomerTableBookingsResource, '/api/customer/<int:customer_id>/table-bookings')


    return app


app = create_app()
if __name__ == "__main__":
    app.run(debug=True, port=5555)
