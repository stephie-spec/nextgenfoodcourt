import os
from dotenv import load_dotenv
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
from routes.order import OrderListResource, OrderResource, CustomerOrderResource, OwnerOrderResource, OrderTrackResource
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
from routes.qr_code import QRCodeResource, OrderQRCodeResource, PaymentQRCodeResource, HomePageQRResource

load_dotenv()

def create_app():
    app = Flask(__name__, static_url_path='/uploads', static_folder=os.path.abspath('../photos'))
    
    # app.config['SQLALCHEMY_DATABASE_URI'] = ("postgresql+psycopg2://otiende:12345678@localhost:5432/nextgen_food_court_db")

    database_url = os.environ.get("RENDER_DATABASE_URL")  
    
    if not database_url:
        # Fallback to local PostgreSQL
        database_url = os.environ.get("DATABASE_URL")

    # CONFIG
    app.config["SECRET_KEY"] = "super-secret-key-change-me"
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "12345")
    app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024 

    CORS(app, supports_credentials=True,
    origins=["http://localhost:3000", os.environ.get("FRONTEND_URL", "")],
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
    api.add_resource(OrderTrackResource, "/api/orders/track/<string:tracking_code>")
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


    # QR Code generation endpoints
    api.add_resource(QRCodeResource, "/api/qr/generate")
    api.add_resource(OrderQRCodeResource, "/api/qr/order/<int:order_id>")
    api.add_resource(PaymentQRCodeResource, "/api/qr/payment")
    api.add_resource(HomePageQRResource, "/api/qr/homepage")

    return app


app = create_app()
if __name__ == "__main__":
    app.run(debug=True, port=5555)




# CREATE DATABASE nextgen_food_court_db;
# CREATE USER otiende WITH PASSWORD '12345678';
# GRANT ALL PRIVILEGES ON DATABASE nextgen_food_court_db TO otiende;
# GRANT ALL ON SCHEMA public TO otiende;
# ALTER SCHEMA public OWNER TO otiende;
# ALTER DATABASE nextgen_food_court_db OWNER TO otiende;