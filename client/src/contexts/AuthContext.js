import { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useRouter } from 'next/router';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const storedToken = Cookies.get('token');
    const storedUser = Cookies.get('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid cookies
        Cookies.remove('token');
        Cookies.remove('user');
      }
    }
    setLoading(false);
    setInitialized(true);
  }, []);

  const login = async (email, password) => {
    try {
      const sampleUsers = {
        'john@example.com': { password: 'password123', name: 'John Doe', role: 'customer', id: 1 },
        'jane@example.com': { password: 'password123', name: 'Jane Smith', role: 'customer', id: 2 },
        'customer@foodcourt.com': { password: 'food123', name: 'Demo Customer', role: 'customer', id: 3 },
        'owner@burgerparadise.com': { password: 'owner123', name: 'Burger Paradise Owner', role: 'owner', id: 4 },
        'pizza@mozzie.com': { password: 'pizza123', name: 'Mozzie Pizzeria', role: 'owner', id: 5 },
        'owner@foodcourt.com': { password: 'owner123', name: 'Demo Restaurant Owner', role: 'owner', id: 6 },
      };

      // Check if it's a sample user
      if (sampleUsers[email] && sampleUsers[email].password === password) {
        const sampleUser = sampleUsers[email];
        const fakeToken = `sample_token_${Date.now()}`;
        
        // Set cookies
        Cookies.set('token', fakeToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(sampleUser), { expires: 7 });
        
        // Set state
        setToken(fakeToken);
        setUser(sampleUser);
        
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${fakeToken}`;
        
        return { success: true, user: sampleUser };
      }

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      const { access_token, user } = response.data;
      
      // Set cookies
      Cookies.set('token', access_token, { expires: 7 });
      Cookies.set('user', JSON.stringify(user), { expires: 7 });
      
      // Set state
      setToken(access_token);
      setUser(user);
      
      // Set axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Use sample credentials.' 
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const demoUser = {
        id: Date.now(),
        name,
        email,
        role,
        created_at: new Date().toISOString()
      };
      
      Cookies.set('token', `demo_token_${Date.now()}`, { expires: 7 });
      Cookies.set('user', JSON.stringify(demoUser), { expires: 7 });
      
      setUser(demoUser);
      
      return { success: true, user: demoUser };
      
      // const response = await axios.post('http://localhost:5000/api/auth/register', {
      //   name,
      //   email,
      //   password,
      //   role
      // });
      // return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      loading,
      initialized,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};