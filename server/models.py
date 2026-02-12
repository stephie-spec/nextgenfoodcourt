from datetime import datetime
import enum
import uuid
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Enum, UniqueConstraint

# db = SQLAlchemy()
from extensions import db

class OrderStatus(enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"

class BookingStatus(enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    checked_in = "checked-in"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no-show"

class Testimonial(db.Model):
    __tablename__ = "testimonials"
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    outlet_id = db.Column(db.Integer, db.ForeignKey("outlets.id"), nullable=False)
    customer_name = db.Column(db.String(120), nullable=False)
    avatar = db.Column(db.String(255))  # Avatar image path
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    review_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    outlet = db.relationship("Outlet", back_populates="testimonials")
    
    def __repr__(self):
        return f"<Testimonial {self.customer_name} - {self.rating}★>"

class Owner(db.Model):
    __tablename__ = "owner"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hashed = db.Column(db.String(255), nullable=False)

    outlets = db.relationship(
        "Outlet",
        back_populates="owner",
        cascade="all, delete-orphan",
        lazy=True
    )
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
        back_populates="customer",
        cascade="all, delete-orphan",
        lazy=True
    )

    favourites = db.relationship (
        "CustomerFavourite",
        back_populates= "customer",
        cascade= "all, delete-orphan",
        lazy= True
    
    )
    def __repr__(self):
        return f"<Customer {self.email}>"

class Outlet(db.Model):
    __tablename__ = "outlets"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    category_name = db.Column(db.String(120))
    owner_id = db.Column(db.Integer, db.ForeignKey("owner.id"), nullable=False)
    image_path = db.Column(db.String(255), nullable=True)
    
    owner = db.relationship(
        "Owner",
        back_populates="outlets"
        
    )
    testimonials = db.relationship(
        "Testimonial",
        back_populates="outlet",
        cascade="all, delete-orphan",
        lazy=True
    )
    menu_items = db.relationship(
        "MenuOutletItem",
        back_populates="outlet",
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
    description = db.Column ( db.String ( 255 ))
    category_name = db.Column ( db.String ( 120 ) )
    is_available = db.Column(db.Boolean, default=True)
    favourites = db.Column (db.Integer, default=0, nullable=False)

    menu_links = db.relationship(
        "MenuOutletItem",
        back_populates="item",
        cascade="all, delete-orphan",
        lazy=True
    )

    customer_favourites = db.relationship (
        "CustomerFavourite",
        back_populates= "item",
        cascade= "all, delete-orphan",
        lazy= True
    )

    def __repr__(self):
        return f"<Item {self.name}>"

class MenuOutletItem(db.Model):
    __tablename__ = "menu_outlet_items"

    id = db.Column(db.Integer, primary_key=True)
    outlet_id = db.Column(db.Integer, db.ForeignKey("outlets.id"), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey("items.id"), nullable=False)

    outlet = db.relationship(
        "Outlet",
        back_populates="menu_items"
    )

    item = db.relationship(
        "Item",
        back_populates="menu_links"
    )

    orders = db.relationship(
        "Order",
        back_populates="menu_outlet_item",
        lazy=True
    )

    __table_args__ = (
        UniqueConstraint("outlet_id", "item_id", name="unique_outlet_item"),
    )

    def __repr__(self):
        return f"<MenuOutletItem outlet={self.outlet_id} item={self.item_id}>"

class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    menu_outlet_item_id = db.Column(
        db.Integer,
        db.ForeignKey("menu_outlet_items.id"),
        nullable=False
    )
    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("customer.id"),
        nullable=False
    )
    quantity = db.Column(db.Integer, nullable=False)
    status = db.Column(Enum(OrderStatus), default=OrderStatus.pending)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    estimated = db.Column(db.DateTime)

    customer = db.relationship(
        "Customer",
        back_populates="orders"
    )

    menu_outlet_item = db.relationship(
        "MenuOutletItem",
        back_populates="orders"
    )

    table_booking = db.relationship(
        "TableBooking",
        back_populates="order",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Order {self.id}>"

class TableBooking(db.Model):
    __tablename__ = "table_bookings"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(
        db.Integer,
        db.ForeignKey("orders.id"),
        unique=True,
        nullable=False
    )
    table_number = db.Column(db.Integer, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    duration = db.Column(db.Interval)
    status = db.Column(Enum(BookingStatus), default=BookingStatus.pending)
    booking_date = db.Column(db.DateTime)
    special_requests = db.Column(db.Text, nullable=True)

    order = db.relationship(
        "Order",
        back_populates="table_booking"
    )

    def __repr__(self):
        return f"<TableBooking table={self.table_number}>"

class CustomerFavourite(db.Model):

    __tablename__ = "customer_favourites"

    id = db.Column ( db.Integer, primary_key=True )
    customer_id = db.Column ( db.Integer, db.ForeignKey("customer.id"), nullable=False )
    item_id = db.Column ( db.Integer, db.ForeignKey("items.id"), nullable=False )

    __table_args__ = (
        UniqueConstraint("customer_id", "item_id", name="unique_customer_item_favourite"),
    )

    customer = db.relationship (
        "Customer",
        back_populates= "favourites"
    )

    item = db.relationship (
        "Item",
        back_populates= "customer_favourites"
    )

    def __repr__(self):
        return f"<CustomerFavourite customer={self.customer_id} item={self.item_id}>"