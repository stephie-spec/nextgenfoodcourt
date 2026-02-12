'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import Navbar from '@/components/navbar';

export default function ScanQRPage() {
  const [scanResult, setScanResult] = useState('');
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef(null);
  const elementId = 'qr-reader';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => undefined);
      }
      scannerRef.current?.clear().catch(() => undefined);
    };
  }, []);

  const startScan = async () => {
    setScanError('');
    setScanResult('');

    try {
      const config = { fps: 10, qrbox: 250 };
      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          setScanResult(decodedText);
          setIsScanning(false);
          scannerRef.current.stop().catch(() => undefined);
        },
        (error) => {
          if (error?.includes('NotFoundException')) {
            return;
          }
          setScanError(error);
        }
      );
      setIsScanning(true);
    } catch (error) {
      setScanError(error?.message || 'Unable to access camera.');
    }
  };

  const stopScan = async () => {
    try {
      await scannerRef.current.stop();
      setIsScanning(false);
    } catch (error) {
      setScanError(error?.message || 'Failed to stop scanner.');
    }
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    setScanResult(manualInput.trim());
  };

  const isUrl = scanResult?.startsWith('http');

  const copyToClipboard = async () => {
    if (!scanResult) {
      return;
    }
    await navigator.clipboard.writeText(scanResult);
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
              <Camera className="w-5 h-5" />
              <span className="text-sm">Scan QR Code</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">Scan Your Order QR</h1>
            <p className="text-red-100">Use your camera or paste a code below</p>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div id={elementId} className="w-full min-h-[260px]" />
              </div>

              <div className="flex gap-3">
                {!isScanning ? (
                  <button
                    type="button"
                    onClick={startScan}
                    className="flex-1 h-11 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90"
                  >
                    Start Scanning
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopScan}
                    className="flex-1 h-11 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/90"
                  >
                    Stop Scanning
                  </button>
                )}
              </div>

              {scanError && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <h2 className="text-lg font-semibold">Manual Entry</h2>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(event) => setManualInput(event.target.value)}
                  placeholder="Paste or type code..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90"
                >
                  Submit Code
                </button>
              </form>

              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Scan Result</h3>
                </div>
                {scanResult ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 break-all">{scanResult}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-secondary text-foreground rounded-lg hover:bg-secondary/90"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      {isUrl && (
                        <a
                          href={scanResult}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                        >
                          Open Link
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No scan yet.</p>
                )}
              </div>

              <div className="text-xs text-gray-500">
                Tip: If camera permissions are blocked, allow access in your browser settings.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
