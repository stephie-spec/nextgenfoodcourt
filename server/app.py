from flask import Flask
from flask_restful import Api

from config import Config
from extensions import db, migrate
from models import *

from routes.owner import OwnerListResource, OwnerResource
from routes.order import OrderListResource, OrderResource
from routes.item import ItemListResource, ItemResource
from routes.menu import MenuListResource, MenuResource

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    api = Api(app)

    @app.route("/")
    def index():
        return {"message": "Food Court API is running"}, 200

    api.add_resource(OwnerListResource, "/owners")
    api.add_resource(OwnerResource, "/owners/<int:owner_id>")
    api.add_resource(OrderListResource, "/orders")
    api.add_resource(ItemListResource, "/items")
    api.add_resource(ItemResource, "/items/<int:item_id>")
    api.add_resource(MenuListResource, "/menu")
    api.add_resource(MenuResource, "/menu/<int:menu_id>")

    
    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5555)
