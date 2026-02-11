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

  // Get orders for owner's outlets
  getOrders: (token, ownerId) => {
    console.log('Getting owner orders with token:', token ? 'Exists' : 'Missing');
    console.log('Owner ID:', ownerId);

    if (!token || !ownerId) {
      console.log('Missing token or owner ID');
      return Promise.resolve([]);
    }

    return fetch(`${API_BASE}/api/orders/owner/${ownerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    })
      .then(res => {
        console.log('Owner orders response status:', res.status);
        if (!res.ok) {
          console.log('Owner orders API failed:', res.status);
          return [];
        }
        return res.json();
      })
      .then(data => {
        console.log('Owner orders raw data:', data);

        const orders = Array.isArray(data) ? data : (data.orders || []);

        console.log(`Found ${orders.length} orders for owner`);

        return orders.map(order => ({
          id: order.id,
          created_at: order.created_at,
          estimated_status: order.status || 'pending',
          total: order.total || 0,
          items: order.items || [],
          outlet: {
            id: order.outlet_id || null,
            name: order.outlet_name || 'Unknown Outlet',
            category_name: order.outlet_category || '—'
          },
          outlet_name: order.outlet_name || 'Unknown Outlet',
          customer_name: order.customer_name || 'Customer',
          customer_id: order.customer_id,
          delivery_time: '25-35 mins'
        }));
      })
      .catch(error => {
        console.error('Error fetching owner orders:', error);
        return [];
      });
  },

  // Get orders for current customer
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

    console.log('Getting owner outlets with token:', token ? 'Exists' : 'Missing');

    if (!token) {
      console.log('Missing authentication token');
      return Promise.resolve([]);
    }

    // Use the new dedicated endpoint
    return fetch(`${API_BASE}/api/owner/outlets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        console.log('Owner outlets response status:', res.status);

        if (res.status === 401) {
          console.error('Unauthorized - token might be invalid or expired');
          return { outlets: [] };
        }

        if (!res.ok) {
          console.error('Owner Outlets API failed:', res.status, res.statusText);
          return { outlets: [] };
        }

        return res.json();
      })
      .then(data => {
        console.log('Owner outlets data:', data);

        // Get outlets array from response
        const ownerOutlets = data.outlets || [];

        console.log(`Found ${ownerOutlets.length} outlets for owner`);

        // Format outlets like the existing getOutlets function
        return ownerOutlets.map((outlet, index) => ({
          id: outlet.id || index + 1,
          name: outlet.name || `Outlet ${index + 1}`,
          category_name: outlet.category_name || 'African Cuisine',
          description: `Authentic ${outlet.category_name || 'African'} cuisine prepared by expert chefs.`,
          rating: outlet.rating ?? 0,
          reviews: outlet.reviews ?? 0,
          isOpen: outlet.isOpen !== undefined ? outlet.isOpen : true,
          isFavorite: outlet.isFavorite ?? false,
          today_orders: outlet.today_orders ?? 0,
          today_revenue: outlet.today_revenue ?? 0,
          total_orders: outlet.total_orders ?? 0,
          tags: [outlet.category_name || 'African', 'Traditional', 'Authentic'],
          image_path: outlet.image_path || 'default-food.jpg',
          owner_id: outlet.owner_id // Keep the owner_id
        }));
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