'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
import { showToast } from '@/lib/toast';


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

// function to get auth token
function getAuthToken() {
  if (typeof window === 'undefined') return null;

  // multiple token storage locations
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
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteOutletModal, setShowDeleteOutletModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, name: '' });
  const [editingItem, setEditingItem] = useState(null);

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
    image_preview: '',
    image: ''
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
            .map(entry => {
              // Construct proper image URL
              let imageUrl = 'https://placehold.co/400';

              if (entry.image || entry.items?.image) {
                const imageFilename = entry.image || entry.items?.image;
                if (imageFilename.startsWith('http')) {
                  imageUrl = imageFilename;
                } else if (imageFilename !== 'default-food.jpg') {
                  imageUrl = `${API_BASE}/uploads/${imageFilename}`;
                } else {
                  imageUrl = `${API_BASE}/uploads/${imageFilename}`;
                }
              }

              return {
                id: entry.id,
                item_id: entry.items?.item_id || entry.item_id,
                name: entry.items?.item_name || entry.item_name || 'Unnamed Item',
                price: Number(entry.items?.price || entry.price || 0),
                category: entry.items?.category || entry.category || 'Main Course',
                is_available: entry.items?.is_available ?? entry.is_available ?? true,
                image: imageUrl,
                image_filename: entry.image || entry.items?.image || 'default-food.jpg'
              };
            });

          setMenuItems(thisOutletItems);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load outlet data', 'error');
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
          .map(entry => {
            let imageUrl = 'https://placehold.co/400';

            if (entry.image || entry.items?.image) {
              const imageFilename = entry.image || entry.items?.image;
              if (imageFilename.startsWith('http')) {
                imageUrl = imageFilename;
              } else if (imageFilename !== 'default-food.jpg') {
                imageUrl = `${API_BASE}/uploads/${imageFilename}`;
              } else {
                imageUrl = `${API_BASE}/uploads/${imageFilename}`;
              }
            }

            return {
              id: entry.id,
              item_id: entry.items?.item_id || entry.item_id,
              name: entry.items?.item_name || entry.item_name || 'Unnamed Item',
              price: Number(entry.items?.price || entry.price || 0),
              category: entry.items?.category || entry.category || 'Main Course',
              is_available: entry.items?.is_available ?? entry.is_available ?? true,
              image: imageUrl,
              image_filename: entry.image || entry.items?.image || 'default-food.jpg'
            };
          });

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
        showToast("You must be logged in to update an outlet", 'error');
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
        showToast('Outlet updated successfully!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Update failed:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to update outlet');
      }
    } catch (error) {
      console.error('Error updating outlet:', error);
      showToast(`Failed to update outlet: ${error.message}`, 'error');
    }
  };

  // Handle image upload
  const handleImageUpload = (file, type = 'outlet') => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size too large. Please choose an image under 5MB.', 'error');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast("Invalid file type. Please upload PNG, JPEG, GIF, or WebP images.", 'error');
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
          image_file: file,
          image: file.name
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
        showToast("You must be logged in to add menu items", 'error');
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
          image_preview: '',
          image: ''
        });

        setShowAddItemModal(false);
        showToast('Menu item added successfully!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add menu item');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      showToast(`Failed to add menu item: ${error.message}`, 'error');
    }
  };

  // Edit menu item
  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewMenuItem({
      name: item.name || '',
      price: item.price?.toString() || '',
      category: item.category || 'Main Course',
      is_available: item.is_available ?? true,
      image: item.image || '',
      image_preview: item.image || '',
      image_file: null
    });
    setShowEditItemModal(true);
  };

  // Update menu item
  const handleUpdateItem = async (e) => {
    e.preventDefault();

    if (!editingItem) return;

    try {
      const token = getAuthToken();

      if (!token) {
        showToast("You must be logged in to update menu items", 'error');
        return;
      }

      const formData = new FormData();
      formData.append('name', newMenuItem.name);
      formData.append('price', parseFloat(newMenuItem.price));
      formData.append('is_available', newMenuItem.is_available);
      formData.append('category', newMenuItem.category);
      formData.append('outlet_id', parseInt(outletId));

      if (newMenuItem.image_file) {
        formData.append('image', newMenuItem.image_file);
      }

      const response = await fetch(`${API_BASE}/api/menu/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
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
          image: '',
          image_preview: '',
          image_file: null
        });
        setEditingItem(null);
        setShowEditItemModal(false);
        showToast('Menu item updated successfully!', 'success');
      } else {
        throw new Error('Failed to update menu item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      showToast('Failed to update menu item. Please try again.', 'error');
    }
  };

  const handleDeleteClick = (menuId, itemName) => {
    setItemToDelete({ id: menuId, name: itemName });   // ← rename to menuId for clarity
    setShowDeleteModal(true);
  };

  const handleDeleteMenuItem = async () => {   // ← no need for params anymore
    if (!itemToDelete.id) return;

    try {
      const token = getAuthToken();
      if (!token) {
        showToast("You must be logged in to delete menu items", 'error');
        return;
      }

      console.log('Deleting menu entry with ID:', itemToDelete.id);

      const response = await fetch(`${API_BASE}/api/menu/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMenuItems(prevItems => prevItems.filter(item => item.menu_id !== itemToDelete.id));
        showToast('Menu item deleted successfully!', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete failed:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showToast(`Failed to delete menu item: ${error.message}`, 'error');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete({ id: null, name: '' });
    }
  };

  const handleDeleteOutletClick = () => {
    setShowDeleteOutletModal(true);
  };

  // Delete outlet
  const handleDeleteOutlet = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        showToast("You must be logged in to delete outlets", 'error');
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
        showToast('Outlet deleted successfully!', 'success');
        router.push('/dashboard/owner');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete failed:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to delete outlet');
      }
    } catch (error) {
      console.error('Error deleting outlet:', error);
      showToast(`Failed to delete outlet: ${error.message}`, 'error');
    } finally {
      setShowDeleteOutletModal(false);
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
            <Link
              href="/dashboard/owner"
              className="inline-flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole="owner">
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto pt-16 px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/owner"
                className="inline-flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">{outlet.name}</h1>
                <p className="text-gray-600 mt-1">{outlet.category_name}</p>
              </div>
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
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${editedOutlet.image_preview
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
                        onClick={handleDeleteOutletClick}
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

            {/* Menu Items - Updated Format */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Menu Items ({menuItems.length})</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage your outlet's menu</p>
                  </div>
                  <button
                    onClick={() => setShowAddItemModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                {menuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No Menu Items Found</h3>
                    <p className="text-gray-500 mt-2 mb-4">Get started by adding your first item</p>
                    <button
                      onClick={() => setShowAddItemModal(true)}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Your First Item
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Mobile: Cards view */}
                    <div className="md:hidden space-y-3">
                      {menuItems.map(item => (
                        <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                          <div className="flex gap-3">
                            {/* Item Image */}
                            <div className="flex-shrink-0">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={item.image || 'https://placehold.co/400'}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'https://placehold.co/400';
                                  }}
                                />
                                {/* Availability badge */}
                                <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${item.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
                              </div>
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              {/* Header */}
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                                <span className="font-bold text-gray-900 ml-2">Ksh. {item.price?.toFixed(2) || '0.00'}</span>
                              </div>

                              {/* Category */}
                              <div className="mb-2">
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                  {item.category}
                                </span>
                              </div>

                              {/* Availability and Actions */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${item.is_available
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                  }`}>
                                  {item.is_available ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      Available
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3" />
                                      Out of Stock
                                    </>
                                  )}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditItem(item)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(item.id, item.name)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop: Table view */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Item</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Availability</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {menuItems.map(item => (
                            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 group">
                              {/* Item column */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img
                                      src={item.image || 'https://placehold.co/400'}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = 'https://placehold.co/400';
                                      }}
                                    />
                                    <div className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${item.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
                                  </div>
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-4 px-4">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {item.category}
                                </span>
                              </td>

                              {/* Price */}
                              <td className="py-4 px-4">
                                <p className="font-bold text-gray-900">Ksh. {item.price?.toFixed(2) || '0.00'}</p>
                              </td>

                              {/* Availability */}
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 w-fit ${item.is_available
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                  }`}>
                                  {item.is_available ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      Available
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3" />
                                      Out of Stock
                                    </>
                                  )}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditItem(item)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span className="sr-only">Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(item.id, item.name)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="sr-only">Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Item Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              onClick={() => setShowAddItemModal(false)}
              className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px]"
            />

            <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-200 animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Add Menu Item</h2>
                    <p className="text-sm text-gray-500 mt-1">to {outlet.name}</p>
                  </div>
                  <button
                    onClick={() => setShowAddItemModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="text-xl text-gray-500 hover:text-gray-700">✕</span>
                  </button>
                </div>

                <form onSubmit={handleAddMenuItem} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                      placeholder="e.g., Jollof Rice"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (Ksh)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newMenuItem.price}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={newMenuItem.category}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="Main Course">Main Course</option>
                        <option value="Side Dish">Side Dish</option>
                        <option value="Appetizer">Appetizer</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Beverage">Beverage</option>
                      </select>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Image
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${newMenuItem.image_preview || newMenuItem.image
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      onClick={() => document.getElementById('itemFileInput').click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-primary', 'bg-primary/5');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        if (!newMenuItem.image_preview && !newMenuItem.image) {
                          e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          handleImageUpload(file, "item");
                        }
                      }}
                    >
                      <input
                        id="itemFileInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleImageUpload(file, "item");
                        }}
                      />

                      {newMenuItem.image_preview || newMenuItem.image ? (
                        <div className="space-y-2">
                          <div className="relative w-32 h-32 mx-auto">
                            <img
                              src={newMenuItem.image_preview || newMenuItem.image}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewMenuItem({
                                  ...newMenuItem,
                                  image: '',
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
                          <div className="text-gray-400 mx-auto w-12 h-12">
                            <Upload className="w-full h-full" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Drag & drop an image here
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              or click to browse (PNG, JPG, JPEG, GIF, WEBP up to 5MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_available"
                      checked={newMenuItem.is_available}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, is_available: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="is_available" className="text-sm text-gray-700">
                      Available for ordering
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddItemModal(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
                    >
                      Add Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Item Modal */}
        {showEditItemModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Menu Item</h2>
                <button
                  onClick={() => {
                    setShowEditItemModal(false);
                    setEditingItem(null);
                    setNewMenuItem({
                      name: '',
                      price: '',
                      category: 'Main Course',
                      is_available: true,
                      image: '',
                      image_preview: '',
                      image_file: null
                    });
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateItem}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                    <input
                      type="text"
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Ksh) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newMenuItem.category}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Main Course">Main Course</option>
                      <option value="Appetizer">Appetizer</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Beverage">Beverage</option>
                      <option value="Side Dish">Side Dish</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit_is_available"
                      checked={newMenuItem.is_available}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, is_available: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="edit_is_available" className="text-sm font-medium text-gray-700">
                      Available for order
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
                    <div className="mt-1 flex items-center gap-4">
                      {newMenuItem.image_preview ? (
                        <div className="relative">
                          <img
                            src={newMenuItem.image_preview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setNewMenuItem({ ...newMenuItem, image_preview: '', image_file: null })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleImageUpload(file, 'item');
                          }}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditItemModal(false);
                      setEditingItem(null);
                      setNewMenuItem({
                        name: '',
                        price: '',
                        category: 'Main Course',
                        is_available: true,
                        image: '',
                        image_preview: '',
                        image_file: null
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-center text-gray-700">
                  Are you sure you want to delete
                </p>
                <p className="text-center font-bold text-gray-900 text-lg mt-1">
                  "{itemToDelete.name || 'this item'}"?
                </p>
                <p className="text-center text-sm text-gray-500 mt-2">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMenuItem}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteOutletModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowDeleteOutletModal(false)}
            />

            <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete {outlet?.name}?</h3>
                <p className="text-gray-600">This will permanently delete the outlet and all its menu items.</p>
                <p className="text-sm text-red-600 font-medium mt-2">This action cannot be undone.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteOutletModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOutlet}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AuthGuard>
  );
}