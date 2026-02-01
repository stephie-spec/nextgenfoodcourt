export function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`http://localhost:5555${endpoint}`, {
    ...options,
    headers
  }).then(response => response.json());
}

export const api = {
  // Customer
  customerLogin: (email, password) => 
    fetchApi('/api/customer/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  customerSignup: (name, email, password) =>
    fetchApi('/api/customer/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),
  
  customerDetails: () => fetchApi('/api/customer/details'),
  
  // Owner
  ownerLogin: (email, password) =>
    fetchApi('/owners/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  
  ownerSignup: (name, email, password) =>
    fetchApi('/owners', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),
  
  ownerOutlets: () => fetchApi('/owners'),
  
  // Data
  outlets: () => fetchApi('/api/outlets'),
  outletMenu: (outletId) => fetchApi(`/api/outlet/${outletId}/menu`),
  orders: () => fetchApi('/orders'),
  menuItems: () => fetchApi('/menu'),
  items: () => fetchApi('/items')
};