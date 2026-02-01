
from flask import request
from auth.jwt import decode_token
from models import Owner, Customer

def get_current_user () :

    bearer = request.headers.get ( "Authorization" )

    if not bearer or not bearer.startswith ( "Bearer " ) :
        return None
    
    token = bearer.split ( " " )[ 1 ]

    return decode_token ( token )


def require_owner () :

    user = get_current_user ()

    if not isinstance ( user, Owner ) :
        return None
    
    return user

def require_customer() :

    user = get_current_user ()

    if not isinstance ( user, Customer ) :
        return None
    
    return user