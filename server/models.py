from datetime import datetime
import enum

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Enum, UniqueConstraint

db = SQLAlchemy()
class OrderStatus(enum.Enum):
    pending = "pending"
    completed = "completed"


class CuisineCategory(enum.Enum):
    kenyan = "kenyan"
    ethiopian = "ethiopian"
    nigerian = "nigerian"
    indian = "indian"
    chinese = "chinese"
    italian = "italian"
    american = "american"
    other = "other"
class Owner(db.Model):
    __tablename__ = "owner"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hashed = db.Column(db.String(255), nullable=False)

    outlets = db.relationship(
        "Outlet",
        backref="owner",
        cascade="all, delete-orphan",
        lazy=True
    )

    def set_password(self, password):
        self.password_hashed = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hashed, password)

    def __repr__(self):
        return f"<Owner {self.email}>"
class Customer(db.Model):
    __tablename__ = "customer"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hashed = db.Column(db.String(255), nullable=False)

    orders = db.relationship(
        "Order",
        backref="customer",
        cascade="all, delete-orphan",
        lazy=True
    )

    def set_password(self, password):
        self.password_hashed = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hashed, password)

    def __repr__(self):
        return f"<Customer {self.email}>"
class Outlet(db.Model):
    __tablename__ = "outlets"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    category_name = db.Column(Enum(CuisineCategory), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey("owner.id"), nullable=False)

    menu_items = db.relationship(
        "MenuOutletItem",
        backref="outlet",
        cascade="all, delete-orphan",
        lazy=True
    )

    def __repr__(self):
        return f"<Outlet {self.name}>"
class Item(db.Model):
    __tablename__ = "items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    image = db.Column(db.String(255))
    price = db.Column(db.Integer, nullable=False)
    is_available = db.Column(db.Boolean, default=True)

    menu_links = db.relationship(
        "MenuOutletItem",
        backref="item",
        cascade="all, delete-orphan",
        lazy=True
    )

    def __repr__(self):
        return f"<Item {self.name}>"

        class MenuOutletItem(db.Model):
    __tablename__ = "menu_outlet_items"

    id = db.Column(db.Integer, primary_key=True)
    outlet_id = db.Column(db.Integer, db.ForeignKey("outlets.id"), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint("outlet_id", "item_id", name="unique_outlet_item"),
    )

    orders = db.relationship("Order", backref="menu_item", lazy=True)

    def __repr__(self):
        return f"<MenuOutletItem outlet={self.outlet_id} item={self.item_id}>"
