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

  // Get all orders (requires owner token)
  getOrders: () => {
    const token = localStorage.getItem('auth_token');
    
    return fetch(`${API_BASE}/api/orders`, {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    })
      .then(res => {
        if (!res.ok) {
          console.log('Orders API failed:', res.status);
          if (res.status === 401) {
            console.error('Unauthorized: Owner token required');
          }
          return [];
        }
        return res.json();
      })
      .then(data => {
        console.log('Orders API Response:', data);
        
        if (Array.isArray(data)) {
          return data.map(order => ({
            id: order.id || `ORD-${Math.random().toString(36).substr(2, 9)}`,
            created_at: order.created_at || new Date().toISOString(),
            estimated_status: order.status || 'pending',
            total: order.total || (order.quantity || 1) * 12.99,
            items: order.items || [{ 
              name: 'Menu Item', 
              quantity: order.quantity || 1, 
              price: 12.99 
            }],
            outlet: {
              id: order.outlet_id || 1,
              name: order.outlet_name || 'Food Court Outlet',
              category_name: order.outlet_category || 'Cuisine'
            },
            outlet_name: order.outlet_name || 'Food Court Outlet',
            customer_name: order.customer_name || 'Customer',
            delivery_time: '25-35 mins'
          }));
        }
        
        if (data && Array.isArray(data.orders)) {
          return data.orders.map(order => ({
            id: order.id,
            created_at: order.created_at,
            estimated_status: order.status,
            total: order.total || 0,
            items: order.items || [],
            outlet: order.outlet || {},
            customer_name: order.customer_name,
          }));
        }
        
        return [];
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        return []; 
      });
  },

  // Get orders for current customer 
  getCustomerOrders: () => {
    const token = localStorage.getItem('auth_token');
    
    return fetch(`${API_BASE}/api/orders`, {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    })
      .then(res => {
        if (!res.ok) {
          console.log('Customer Orders API failed:', res.status);
          if (res.status === 401) {
            console.error('Unauthorized: Customer not logged in');
          }
          return [];
        }
        return res.json();
      })
      .then(data => {
        console.log('Customer Orders API Response:', data);
        
        let ordersArray = Array.isArray(data) ? data : (data.orders || []);
        
        return ordersArray.map(order => ({
          id: order.id || `ORD-${Math.random().toString(36).substr(2, 9)}`,
          created_at: order.created_at || new Date().toISOString(),
          estimated_status: order.status || 'pending',
          total: order.total || (order.quantity || 1) * 12.99,
          items: order.items || [{ 
            name: 'Menu Item', 
            quantity: order.quantity || 1, 
            price: 12.99 
          }],
          outlet: {
            id: order.outlet_id || 1,
            name: order.outlet_name || 'Food Court Outlet',
            category_name: order.outlet_category || 'Cuisine'
          },
          outlet_name: order.outlet_name || 'Food Court Outlet',
          customer_name: order.customer_name || 'Customer',
          delivery_time: '25-35 mins'
        }));
      })
      .catch(error => {
        console.error('Error fetching customer orders:', error);
        return [];
      });
  },

  // Get owner's outlets (OWNER ONLY)
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
      .then(data => {
        return data; 
      })
      .catch(error => {
        console.error('Error fetching owner outlets:', error);
        return [];
      });
  },

  // Get current user role
  getUserRole: () => {
    return localStorage.getItem('user_role');
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('auth_token');
  }
};