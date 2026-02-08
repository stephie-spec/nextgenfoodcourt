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
  X,
  CheckCircle,
  XCircle,
  Edit,
  Pencil
} from 'lucide-react';

const API_BASE = 'http://localhost:5555';

// function to get outlet image URL
const getOutletImage = (imagePath) => {
  const finalImage = imagePath || 'default-outlet.jpg';
  return `${API_BASE}/uploads/${finalImage.replace(/^\/+/, '')}`;
};
//function to get menu item image URL

const getMenuItemImage = (imagePath) => {
  if (!imagePath) return 'https://placehold.co/400';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  if (imagePath === 'default-food.jpg') {
    return `${API_BASE}/uploads/default-food.jpg`;
  }
  
  return `${API_BASE}/uploads/${imagePath.replace(/^\/+/, '')}`;
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

  // Add menu item - SENDS FORMDATA
  const handleAddMenuItem = async (e) => {
    e.preventDefault();

    try {
      const token = getAuthToken();

      if (!token) {
        alert("You must be logged in to add menu items");
        return;
      }
      
      const formData = new FormData();
      formData.append('name', newMenuItem.name);
      formData.append('price', parseFloat(newMenuItem.price));
      formData.append('category', newMenuItem.category);
      formData.append('is_available', newMenuItem.is_available);
      formData.append('outlet_id', parseInt(outletId));

      if (newMenuItem.image_file) {
        formData.append('image', newMenuItem.image_file);
      }

      const response = await fetch(`${API_BASE}/api/menu`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        await refreshMenuItems();

        setNewMenuItem({
          name: '',
          price: '',
          category: 'Main Course',
          is_available: true,
          image_file: null,
          image_preview: ''
        });

        setShowAddItemModal(false);
        alert('Menu item added successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add menu item');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert(`Failed to add menu item: ${error.message}`);
    }
  };

  // Delete menu item
  const handleDeleteMenuItem = async (itemId, itemName) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      const token = getAuthToken();

      if (!token) {
        alert("You must be logged in to delete menu items");
        return;
      }
      
      console.log('Deleting menu item with token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${API_BASE}/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await refreshMenuItems();
        alert('Menu item deleted successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete failed:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert(`Failed to delete menu item: ${error.message}`);
    }
  };
// Delete outlet
  const handleDeleteOutlet = async () => {
    if (!confirm(`Are you sure you want to delete "${outlet.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = getAuthToken();

      if (!token) {
        alert("You must be logged in to delete outlets");
        return;
      }
      
      console.log('Deleting outlet with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_BASE}/api/outlets/${outletId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Outlet deleted successfully!');
        router.push('/dashboard/owner');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete failed:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to delete outlet');
      }
    } catch (error) {
      console.error('Error deleting outlet:', error);
      alert(`Failed to delete outlet: ${error.message}`);
    }
  };

  if (!router.isReady || !outletId) {
    return null;
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="owner">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!outlet) {
    return (
      <AuthGuard requiredRole="owner">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Outlet not found</p>
            <button
              onClick={() => router.push('/dashboard/owner')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="owner">
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard/owner')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">{outlet.name}</h1>
              <p className="text-gray-600 mt-1">{outlet.category_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Outlet Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
                <div className="flex justify-between mb-6">
                  <h2 className="text-xl font-bold">Details</h2>
                  {!isEditingOutlet && (
                    <button
                      onClick={() => setIsEditingOutlet(true)}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isEditingOutlet ? (
                  <form onSubmit={handleUpdateOutlet} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        value={editedOutlet.name}
                        onChange={(e) => setEditedOutlet({ ...editedOutlet, name: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <input
                        type="text"
                        value={editedOutlet.category_name}
                        onChange={(e) => setEditedOutlet({ ...editedOutlet, category_name: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Image</label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                          editedOutlet.image_preview 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                        onClick={() => document.getElementById('outletImg').click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-primary', 'bg-primary/5');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          if (!editedOutlet.image_preview) {
                            e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            handleImageUpload(file, 'outlet');
                          }
                        }}
                      >
                        <input
                          id="outletImg"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImageUpload(file, 'outlet');
                          }}
                        />

                        {editedOutlet.image_preview ? (
                          <div className="space-y-2">
                            <div className="relative w-32 h-32 mx-auto">
                              <img
                                src={editedOutlet.image_preview}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditedOutlet({
                                    ...editedOutlet,
                                    image_preview: '',
                                    image_file: null
                                  });
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="text-sm text-gray-600">
                              Click or drag to change image
                            </p>
                          </div>
                        ) : outlet.image_path ? (
                          <img
                            src={getOutletImage(outlet.image_path)}
                            alt={outlet.name}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => e.target.src = getOutletImage(null)}
                          />
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Drag & drop an image here
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                or click to browse (PNG, JPG up to 5MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Saved as: {editedOutlet.name || outlet.name}.jpg
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingOutlet(false);
                          setEditedOutlet({
                            name: outlet.name,
                            category_name: outlet.category_name,
                            image_file: null,
                            image_preview: ''
                          });
                        }}
                        className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {outlet.image_path && (
                      <img
                        src={getOutletImage(outlet.image_path)}
                        alt={outlet.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => e.target.src = getOutletImage(null)}
                      />
                    )}

                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-semibold">{outlet.name}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-semibold">{outlet.category_name}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Menu Items</p>
                      <p className="font-semibold">{menuItems.length}</p>
                    </div>

                    <div className="pt-4 border-t">
                      <button
                        onClick={handleDeleteOutlet}
                        className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Outlet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Menu Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Menu Items</h2>
                    <p className="text-sm text-gray-600">{menuItems.length} items</p>
                  </div>
                  <button
                    onClick={() => setShowAddItemModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {menuItems.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No Items Yet</h3>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add First Item
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {menuItems.map(item => (
                      <div key={item.id} className="border rounded-lg p-4 hover:border-gray-300">
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                                {item.category}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                item.is_available 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.is_available ? 'Available' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold">Ksh. {item.price.toFixed(2)}</p>
                            <button 
                              onClick={() => handleDeleteMenuItem(item.id, item.name)}
                              className="text-red-500 hover:text-red-700 text-sm mt-2"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Item Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
              <div className="p-6">
                <div className="flex justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Add Menu Item</h2>
                    <p className="text-sm text-gray-500">to {outlet.name}</p>
                  </div>
                  <button
                    onClick={() => setShowAddItemModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddMenuItem} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      required
                      placeholder="e.g., Jollof Rice"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newMenuItem.price}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={newMenuItem.category}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="Main Course">Main Course</option>
                        <option value="Side Dish">Side Dish</option>
                        <option value="Appetizer">Appetizer</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Beverage">Beverage</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Image (Optional)</label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        newMenuItem.image_preview 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onClick={() => document.getElementById('itemImg').click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-primary', 'bg-primary/5');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        if (!newMenuItem.image_preview) {
                          e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          handleImageUpload(file, 'item');
                        }
                      }}
                    >
                      <input
                        id="itemImg"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleImageUpload(file, 'item');
                        }}
                      />

                      {newMenuItem.image_preview ? (
                        <div className="space-y-2">
                          <div className="relative w-24 h-24 mx-auto">
                            <img
                              src={newMenuItem.image_preview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewMenuItem({
                                  ...newMenuItem,
                                  image_preview: '',
                                  image_file: null
                                });
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">
                            Click or drag to change image
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Drag & drop an image here
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              or click to browse (PNG, JPG up to 5MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="available"
                      checked={newMenuItem.is_available}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, is_available: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="available" className="text-sm">Available for ordering</label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddItemModal(false)}
                      className="flex-1 py-3 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Add Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}