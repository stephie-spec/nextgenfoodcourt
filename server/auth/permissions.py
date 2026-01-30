
from flask import request


def get_current_user () :

    token = request.headers.get ( "Authorization" )

    if not token :
        return None
    
    from auth.jwt import decode_token

    return decode_token ( token )


def require_owner () :

    user = get_current_user ()

    if not user or user.__class__.__name__ != "Owner" :
        return None
    
    return user

def require_customer() :

    user = get_current_user ()

    if not user or user.__class__.__name__ != "Customer" :
        return None
    
    return user