'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, QrCode } from 'lucide-react';
import Navbar from '@/components/navbar';

export default function QRCodePage() {
  const qrImageUrl = 'http://localhost:5555/api/qr/homepage';
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = 'nextgen-foodcourt-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="w-5 h-5" />
              <span className="text-sm">Homepage QR Code</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">Scan to Visit Our Website</h1>
            <p className="text-red-100">Point your phone camera at the QR code below</p>
          </div>

          <div className="p-8">
            <div className="max-w-md mx-auto space-y-6">
              <div className="bg-white border-4 border-gray-200 rounded-2xl p-8 flex items-center justify-center">
                <img 
                  src={qrImageUrl} 
                  alt="Homepage QR Code" 
                  className="w-full h-auto max-w-sm"
                />
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-700 font-medium">
                  Scan this QR code with your phone to visit NextGen Food Court
                </p>
                
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download QR Code
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-gray-900">How to scan:</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>Open your phone's camera app</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>Point it at the QR code above</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>Tap the notification to open the website</span>
                  </li>
                </ol>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  URL: <span className="font-mono bg-gray-100 px-2 py-1 rounded">http://localhost:3000</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
