
import jwt
from flask import current_app
from models import Onwer, Customer


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