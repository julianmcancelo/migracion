'use client';

import { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { X, Camera, RefreshCw } from 'lucide-react';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanFailure?: (error: any) => void;
    onClose: () => void;
}

export default function QRScanner({
    onScanSuccess,
    onScanFailure,
    onClose,
}: QRScannerProps) {
    const [error, setError] = useState<string | null>(null);

    const handleResult = (result: any, error: any) => {
        if (result) {
            onScanSuccess(result?.text);
        }

        if (error) {
            // react-qr-reader throws errors constantly when no QR is found
            // we only care about initialization errors usually
            const errorMsg = error?.message || '';
            if (errorMsg.includes('Permission denied')) {
                setError('Permiso de cámara denegado. Por favor, permite el acceso.');
            } else if (errorMsg.includes('Requested device not found')) {
                setError('No se encontró ninguna cámara.');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Escanear QR
                </h3>
                <button
                    onClick={onClose}
                    className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 backdrop-blur-sm"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                {error ? (
                    <div className="text-white text-center p-6 max-w-sm">
                        <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Camera className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="mb-2 font-bold text-lg">Error de Cámara</p>
                        <p className="mb-6 text-sm text-gray-300">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-[#0093D2] text-white rounded-xl font-bold active:scale-95 transition-transform"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        <QrReader
                            onResult={handleResult}
                            constraints={{ facingMode: 'environment' }}
                            className="w-full h-full object-cover"
                            videoContainerStyle={{ paddingTop: 0, height: '100%' }}
                            videoStyle={{ objectFit: 'cover' }}
                        />

                        {/* Overlay Guide */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                            <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#0093D2] -mt-1 -ml-1 rounded-tl-lg"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#0093D2] -mt-1 -mr-1 rounded-tr-lg"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#0093D2] -mb-1 -ml-1 rounded-bl-lg"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#0093D2] -mb-1 -mr-1 rounded-br-lg"></div>

                                {/* Scanning Line Animation */}
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0093D2] shadow-[0_0_10px_#0093D2] animate-[scan_2s_infinite]"></div>
                            </div>
                            <p className="absolute bottom-20 text-white/80 text-sm font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                                Apunta al código QR
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
        </div>
    );
}
