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