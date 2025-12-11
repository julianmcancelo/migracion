'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

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
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Evitar doble inicialización
        if (scannerRef.current) return;

        const scanner = new Html5QrcodeScanner(
            'reader',
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true
            },
      /* verbose= */ false
        );

        scannerRef.current = scanner;

        scanner.render(
            (decodedText) => {
                // Limpiar scanner al éxito para evitar múltiples lecturas
                scanner.clear().catch(console.error);
                onScanSuccess(decodedText);
            },
            (error) => {
                if (onScanFailure) onScanFailure(error);
            }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, [onScanSuccess, onScanFailure]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 p-2 bg-white/50 rounded-full hover:bg-white text-black"
                >
                    ✕
                </button>
                <div className="p-4">
                    <h3 className="text-lg font-bold text-center mb-4">Escanear QR</h3>
                    <div id="reader" className="w-full" />
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Apunta la cámara al código QR de la oblea o inspección
                    </p>
                </div>
            </div>
        </div>
    );
}
