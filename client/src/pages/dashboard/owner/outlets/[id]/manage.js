'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/navbar';
import AuthGuard from '@/components/AuthGuard';
import { useSession } from 'next-auth/react';
import { 
  Store, 
  Package, 
  Upload, 
  Plus, 
  Edit2, 
  Trash2,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';

const API_BASE = 'http://localhost:5555';

// Helper function to get outlet image URL
const getOutletImage = (imagePath) => {
  const finalImage = imagePath || 'default-outlet.jpg';
  return `${API_BASE}/uploads/${finalImage.replace(/^\/+/, '')}`;
};
// FIXED: Helper function to get auth token
function getAuthToken() {
  if (typeof window === 'undefined') return null;
  
  // Try multiple token storage locations
  let token = localStorage.getItem('token');
  
  if (!token) {
    token = localStorage.getItem('auth_token');
  }
  
  if (!token) {
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        token = parsed.token;
      }
    } catch (e) {
      console.log('Error parsing auth data:', e);
    }
  }
  
  console.log('getAuthToken result:', token ? 'Token found' : 'No token found');
  return token;
}
export default function OutletManage() {
  const router = useRouter();
  const { id: outletId } = router.query;

  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [outlet, setOutlet] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isEditingOutlet, setIsEditingOutlet] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const [editedOutlet, setEditedOutlet] = useState({
    name: '',
    category_name: '',
    image_file: null,
    image_preview: ''
  });

  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    is_available: true,
    image_file: null,
    image_preview: ''
  });

  // Fetch outlet data and menu items
  useEffect(() => {
    if (!outletId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();

        console.log('Fetching outlet with token:', token ? 'Present' : 'Missing');

        const outletRes = await fetch(`${API_BASE}/api/outlets/${outletId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!outletRes.ok) throw new Error('Failed to fetch outlet');

        const outletData = await outletRes.json();
        setOutlet(outletData);
        setEditedOutlet({
          name: outletData.name,
          category_name: outletData.category_name,
          image_file: null,
          image_preview: ''
        });

        const menuRes = await fetch(`${API_BASE}/api/menu`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (menuRes.ok) {
          const allMenuData = await menuRes.json();
          
          const thisOutletItems = allMenuData
            .filter(entry => {
              const itemOutletId = entry.outlet_id || entry.items?.outlet_id;
              return itemOutletId === parseInt(outletId);
            })
            .map(entry => ({
              id: entry.items?.item_id || entry.item_id,
              name: entry.items?.item_name || entry.item_name || 'Unnamed Item',
              price: Number(entry.items?.price || entry.price || 0),
              category: entry.items?.category || entry.category || 'Main Course',
              is_available: entry.items?.is_available ?? entry.is_available ?? true,
            }));
          
          setMenuItems(thisOutletItems);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load outlet data');
        setLoading(false);
      }
    };

    fetchData();
  }, [outletId]);

  // Refresh menu items
  const refreshMenuItems = async () => {
    try {
      const token = getAuthToken();
      
      const menuRes = await fetch(`${API_BASE}/api/menu`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (menuRes.ok) {
        const allMenuData = await menuRes.json();
        
        const thisOutletItems = allMenuData
          .filter(entry => {
            const itemOutletId = entry.outlet_id || entry.items?.outlet_id;
            return itemOutletId === parseInt(outletId);
          })
          .map(entry => ({
            id: entry.items?.item_id || entry.item_id,
            name: entry.items?.item_name || entry.item_name || 'Unnamed Item',
            price: Number(entry.items?.price || entry.price || 0),
            category: entry.items?.category || entry.category || 'Main Course',
            is_available: entry.items?.is_available ?? entry.is_available ?? true,
          }));
        
        setMenuItems(thisOutletItems);
      }
    } catch (error) {
      console.error('Error refreshing menu items:', error);
    }
  };
// Update outlet - SENDS FORMDATA
  const handleUpdateOutlet = async (e) => {
    e.preventDefault();

    try {
      const token = getAuthToken();

      if (!token) {
        alert("You must be logged in to update an outlet");
        return;
      }

      console.log('Updating outlet with token:', token ? 'Present' : 'Missing');
      
      const formData = new FormData();
      formData.append('name', editedOutlet.name);
      formData.append('category_name', editedOutlet.category_name);
      
      if (editedOutlet.image_file) {
        formData.append('image', editedOutlet.image_file);
      }

      const response = await fetch(`${API_BASE}/api/outlets/${outletId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const updatedOutlet = await response.json();
        setOutlet(updatedOutlet);
        setIsEditingOutlet(false);
        setEditedOutlet({
          ...editedOutlet,
          image_file: null,
          image_preview: ''
        });
        alert('Outlet updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update failed:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to update outlet');
      }
    } catch (error) {
      console.error('Error updating outlet:', error);
      alert(`Failed to update outlet: ${error.message}`);
    }
  };

  // Handle image upload
  const handleImageUpload = (file, type = 'outlet') => {
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please choose an image under 5MB.');
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      if (type === 'outlet') {
        setEditedOutlet({
          ...editedOutlet,
          image_preview: reader.result,
          image_file: file
        });
      }

      if (type === 'item') {
        setNewMenuItem({
          ...newMenuItem,
          image_preview: reader.result,
          image_file: file
        });
      }
    };

    reader.readAsDataURL(file);
  };
