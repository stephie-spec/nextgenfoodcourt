
const API_BASE = 'http://localhost:5555';

export async function toggleFavourite(itemId, token) {
  if (!itemId) {
    throw new Error("Invalid itemId passed to toggleFavourite");
  }

  const res = await fetch (
    `${API_BASE}/api/items/${itemId}/favourite`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Toggle failed: ${res.status} ${text}`);
  }

  return res.json();
}


export async function getCustomerFavourites(token) {

    const res = await fetch (
        `${ API_BASE }/api/customer/favourites`,
        {
            headers : {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if ( !res.ok ) {
        throw new Error ( "Failed to fetch favourites" );
    }

    return res.json();
}