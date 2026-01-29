import { createContext, useState, useContext } from 'react';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {

  const sampleUsers = {
  'john@example.com': { password: 'password123', name: 'John Doe', role: 'customer', id: 1 },
  'jane@example.com': { password: 'password123', name: 'Jane Smith', role: 'customer', id: 2 },
  'customer@foodcourt.com': { password: 'food123', name: 'Demo Customer', role: 'customer', id: 3 },
  'owner@burgerparadise.com': { password: 'owner123', name: 'Burger Paradise Owner', role: 'owner', id: 4 },
  'pizza@mozzie.com': { password: 'pizza123', name: 'Mozzie Pizzeria', role: 'owner', id: 5 },
  'owner@foodcourt.com': { password: 'owner123', name: 'Demo Restaurant Owner', role: 'owner', id: 6 },
};

  if (sampleUsers[email] && sampleUsers[email].password === password) {
    const user = sampleUsers[email];
    setUser(user);
    return { success: true, user };
  }
  
  return { success: false, error: 'Invalid credentials' };
};

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};