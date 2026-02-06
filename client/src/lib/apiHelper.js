const API_BASE = 'http://localhost:5555';

export const apiHelper = {
  // Get all outlets (public)
  getOutlets: () => {
    return fetch(`${API_BASE}/api/outlets`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Outlets API Response:', data);
        if (data.outlets && Array.isArray(data.outlets)) {
          return data.outlets.map((outlet, index) => ({
            id: outlet.id || index + 1,
            name: outlet.name || `Outlet ${index + 1}`,
            category_name: outlet.category_name || outlet.cuisine || 'African Cuisine',
            description: outlet.description || `Authentic ${outlet.category_name || outlet.cuisine || 'African'} cuisine prepared by expert chefs.`,
            rating: outlet.rating || (4.5 + (Math.random() * 0.5)).toFixed(1),
            reviews: outlet.reviews || Math.floor(Math.random() * 150) + 50,
            isOpen: outlet.isOpen !== undefined ? outlet.isOpen : true,
            isFavorite: Math.random() > 0.5,
            today_orders: outlet.today_orders || Math.floor(Math.random() * 30) + 5,
            today_revenue: outlet.today_revenue || (Math.random() * 1000) + 500,
            total_orders: outlet.total_orders || Math.floor(Math.random() * 200) + 50,
            tags: outlet.tags || [outlet.category_name || 'African', 'Traditional', 'Authentic'],
            image_path: outlet.image_path || 'default-outlet.jpg'
          }));
        }
        return [];
      })
      .catch(error => {
        console.error('Error fetching outlets:', error);
        return [];
      });
  },

  // Get all orders (for owners - all orders)
  getOrders: () => {
    const token = localStorage.getItem('auth_token');

    // First, test if server is reachable
    console.log('Testing connection to:', `${API_BASE}/api/orders`);

    // Use the simplest possible approach
    return fetch(`${API_BASE}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      mode: 'cors'
    })
      .then(res => {
        console.log('Response received:', {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          url: res.url
        });

        if (!res.ok) {
          // Try to get error details
          return res.text().then(text => {
            console.log('Error response body:', text);
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          });
        }

        return res.json();
      })
      .then(data => {
        console.log('Success - Orders data:', data);
        return Array.isArray(data) ? data : [];
      })
      .catch(error => {
        console.error('Fetch error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });

        // Test if server is even reachable
        fetch(`${API_BASE}/api/outlets`)
          .then(testRes => console.log('Outlets test:', testRes.status))
          .catch(testErr => console.log('Server unreachable:', testErr));

        return [];
      });
  },

  // Get orders for current customer
  // update getCustomerOrders to accept token
  getCustomerOrders: (token, customerId) => {
    console.log('Getting orders with token:', token ? 'Exists' : 'Missing');
    console.log('Customer ID:', customerId);

    if (!token || !customerId) {
      console.log('Missing token or customer ID');
      return Promise.resolve([]);
    }

    return fetch(`${API_BASE}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        console.log('Response status:', res.status);
        if (!res.ok) {
          console.log('API failed:', res.status);
          return [];
        }
        return res.json();
      })
      .then(data => {
        console.log('All orders data:', data);

        // Filter for this customer
        const customerOrders = Array.isArray(data)
          ? data.filter(order => {
            const orderCustomerId = order.customer_id;
            return orderCustomerId && String(orderCustomerId) === String(customerId);
          })
          : [];

        console.log(`Found ${customerOrders.length} orders for customer`);

        return customerOrders.map(order => ({
          id: order.id,
          created_at: order.created_at,
          estimated_status: order.status || 'pending',
          total: order.total || 0,
          items: order.items || [],
          outlet: {
            id: order.outlet_id || 1,
            name: order.outlet_name || 'Food Court Outlet',
            category_name: order.outlet_category || 'Cuisine'
          },
          outlet_name: order.outlet_name || 'Food Court Outlet',
          customer_name: order.customer_name || 'Customer',
          customer_id: order.customer_id,
          delivery_time: '25-35 mins'
        }));
      })
      .catch(error => {
        console.error('Error:', error);
        return [];
      });
  },

  // Get owner's outlets
  getOwnerOutlets: () => {
    const token = localStorage.getItem('auth_token');

    return fetch(`${API_BASE}/api/owner/outlets`, {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    })
      .then(res => {
        if (!res.ok) {
          console.log('Owner Outlets API failed:', res.status);
          return [];
        }
        return res.json();
      })
      .catch(error => {
        console.error('Error fetching owner outlets:', error);
        return [];
      });
  },

  // Helper functions
  getUserRole: () => {
    return localStorage.getItem('user_role');
  },

  getToken: () => {
    return localStorage.getItem('auth_token');
  },

};

// Create an order
export const createOrder = async (orderData, token) => {
  try {
    console.log('Creating order with data:', orderData);

    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(orderData)
    });

    const responseData = await response.json();
    console.log('Order response:', { status: response.status, data: responseData });

    if (!response.ok) {
      throw new Error(responseData.error || `HTTP ${response.status}`);
    }

    return {
      status: response.status,
      data: responseData
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get customer orders
export const getCustomerOrders = async (customerId, token) => {
  try {
    const response = await fetch(`${API_BASE}/api/orders`, {
      method: 'GET',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const orders = await response.json();
    return orders.filter(order => order.customer_id === customerId);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    throw error;
  }
};

// Get menu items for outlet
export const getMenuItems = async (outletId) => {
  try {
    const response = await fetch(`${API_BASE}/api/menu?outlet_id=${outletId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
};