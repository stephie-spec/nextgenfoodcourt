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
