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
