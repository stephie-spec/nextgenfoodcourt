import { createContext, useContext, useState, useEffect } from 'react';

// Create cart context
const CartContext = createContext();

// Cart provider component
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState({});
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Ensure cartItems is an object with numeric or string keys
        // Filter out any invalid entries
        const validCart = {};
        for (const [key, value] of Object.entries(parsed)) {
          // Only store if value is a number (quantity)
          if (typeof value === 'number') {
            validCart[key] = value;
          }
        }
        setCartItems(validCart);
      } catch (e) {
        console.error('Error loading cart from localStorage:', e);
        setCartItems({});
      }
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, mounted]);

  // Calculate total items in cart
  const cartTotalItems = Object.values(cartItems).reduce((sum, qty) => {
    // Ensure qty is a number
    return sum + (typeof qty === 'number' ? qty : 0);
  }, 0);

  // Add item to cart
  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  // Remove item from cart or decrease quantity
  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  // Update item quantity directly
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      const newCart = { ...cartItems };
      delete newCart[itemId];
      setCartItems(newCart);
    } else {
      setCartItems((prev) => ({
        ...prev,
        [itemId]: quantity,
      }));
    }
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems({});
  };

  // Get quantity of specific item
  const getItemQuantity = (itemId) => {
    const qty = cartItems[itemId];
    return typeof qty === 'number' ? qty : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotalItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        mounted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
