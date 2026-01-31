
import jwt
from datetime import datetime, timedelta
from flask import current_app
from models import Owner, Customer

DEFAULT_SECRET_KEY = "12345"

def generate_token(user_id, role):
    payload = {
        "id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }

    token = jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return token


def decode_token (token) :
    try:

        payload = jwt.decode ( 
            token,
            current_app.config["SECRET_KEY"],
            algorithms = [ "HS256" ]
        )
    
    except jwt.ExpiredSignatureError :
        return None
    
    except jwt.InvalidTokenError :
        return None
    

    if payload ["role"] == "owner" :
        return Owner.query.get ( payload ["id"] )

    elif payload ["role"] == "customer" :
        return Customer.query.get ( payload ["id"] )
    
    return None