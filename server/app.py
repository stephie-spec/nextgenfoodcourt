from flask import Flask
from flask_restful import Api
from flask_migrate import Migrate

from extensions import db
from models import *   # keeping this ONLY to match your original

from routes.owner import OwnerListResource, OwnerResource
from routes.order import OrderListResource, OrderResource


def create_app():
    app = Flask(__name__)

    # CONFIG
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # INIT EXTENSIONS
    db.init_app(app)
    Migrate(app, db)

    api = Api(app)

    # ROUTES
    api.add_resource(OwnerListResource, "/owners")
    api.add_resource(OwnerResource, "/owners/<int:owner_id>")
    api.add_resource(OrderListResource, "/orders")
    api.add_resource(OrderResource, "/orders/<int:order_id>")

    return app


app = create_app()
if __name__ == "__main__":
    app.run(debug=True, port=5555)
