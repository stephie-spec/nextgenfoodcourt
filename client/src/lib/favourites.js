

const API_BASE = 'http://localhost:5555';

export async function toggleFavourite ( itemId, token ) {

    const res = await fetch (

        `${ API_BASE }/api/items/${ itemId }/favourite`,
        {
            method : "POST",
            headers : {
                "Content-Type": "application/json",
                Authorization: token,
            },
        }
    );

    if ( !res.ok) {
        throw new Error ( "Failed to toggle favourite" );
    }

    return res.json();
}


export async function getCustomerFavourites(token) {

    const res = await fetch (
        `${ API_BASE }/api/customer/favourites`,
        {
            headers : {
                Authorization : token,
            },
        }
    );

    if ( !res.ok ) {
        throw new Error ( "Failed to fetch favourites" );
    }

    return res.json();
}