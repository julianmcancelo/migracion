'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
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
    const [isScanning, setIsScanning] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const regionId = 'qr-reader-region';

    useEffect(() => {
        // Inicializar scanner
        const initScanner = async () => {
            try {
                const formatsToSupport = [
                    Html5QrcodeSupportedFormats.QR_CODE,
                ];

                // Listar cámaras primero para ser más robustos
                const devices = await Html5Qrcode.getCameras();
                if (!devices || devices.length === 0) {
                    throw new Error('No se encontraron cámaras.');
                }

                // Intentar encontrar cámara trasera
                const backCamera = devices.find(device =>
                    device.label.toLowerCase().includes('back') ||
                    device.label.toLowerCase().includes('trasera') ||
                    device.label.toLowerCase().includes('environment')
                );

                const cameraId = backCamera ? backCamera.id : devices[0].id;

                const scanner = new Html5Qrcode(regionId, {
                    formatsToSupport,
                    verbose: false
                });

                scannerRef.current = scanner;

                await scanner.start(
                    cameraId, // Usar ID específico en lugar de constraint genérico
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        if (scannerRef.current) {
                            scannerRef.current.stop().then(() => {
                                scannerRef.current?.clear();
                                onScanSuccess(decodedText);
                            }).catch(console.error);
                        }
                    },
                    (errorMessage) => {
                        // Ignorar errores de frame
                    }
                );

                setIsScanning(true);
            } catch (err: any) {
                console.error('Error iniciando cámara:', err);
                let errorMessage = 'No se pudo acceder a la cámara.';

                // Manejar si el error es un string
                if (typeof err === 'string') {
                    errorMessage = err;
                } else if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
                    errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso.';
                } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
                    errorMessage = 'No se encontró ninguna cámara.';
                } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
                    errorMessage = 'La cámara está en uso o no es accesible.';
                } else if (err?.message) {
                    errorMessage = err.message;
                }

                setCameraError(errorMessage);
            }
        };

        // Pequeño delay para asegurar que el DOM está listo
        const timer = setTimeout(() => {
            initScanner();
        }, 100);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                }).catch(console.error);
            }
        };
    }, [onScanSuccess]);

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
            <div className="flex-1 relative flex items-center justify-center bg-black">
                {cameraError ? (
                    <div className="text-white text-center p-6 max-w-sm">
                        <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Camera className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="mb-4 font-medium">{cameraError}</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-white text-black rounded-full font-bold"
                        >
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <>
                        <div id={regionId} className="w-full h-full object-cover" />

                        {/* Overlay Guide */}
                        {!cameraError && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
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
                        )}

                        {/* Loading State */}
                        {!isScanning && !cameraError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                                <div className="text-center">
                                    <RefreshCw className="w-10 h-10 text-[#0093D2] animate-spin mx-auto mb-4" />
                                    <p className="text-white">Iniciando cámara...</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style jsx global>{`
        #qr-reader-region video {
          object-fit: cover;
          width: 100% !important;
          height: 100% !important;
        }
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
