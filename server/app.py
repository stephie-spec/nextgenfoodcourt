from flask import Flask
from flask_restful import Api

from config import Config
from extensions import db, migrate
from models import *

from routes.owner import OwnerListResource, OwnerResource
from routes.order import order_bp

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

    app.register_blueprint(order_bp)
    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5555)
