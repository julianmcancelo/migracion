'use client';

import { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { X, Camera, AlertTriangle, CheckCircle } from 'lucide-react';

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
    const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied' | 'error'>('checking');
    const [debugInfo, setDebugInfo] = useState<string>('');
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        checkPermissions();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const checkPermissions = async () => {
        setPermissionStatus('checking');
        setDebugInfo('Iniciando chequeo de cámara...');

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setPermissionStatus('error');
            setDebugInfo('Tu navegador no soporta acceso a cámaras (getUserMedia no existe).');
            return;
        }

        try {
            setDebugInfo(prev => prev + '\nSolicitando permisos...');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            setPermissionStatus('granted');
            setDebugInfo(prev => prev + '\n¡Permiso concedido! Cámara activa.');
            setStream(mediaStream); // Mantener stream vivo para que el scanner lo tome rápido o para mostrarlo

        } catch (err: any) {
            console.error('Error de permisos:', err);
            setPermissionStatus('denied');
            setDebugInfo(prev => prev + `\nError: ${err.name} - ${err.message}`);
        }
    };

    const handleResult = (result: any, error: any) => {
        if (result) {
            onScanSuccess(result?.text);
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

            {/* Content */}
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">

                {permissionStatus === 'checking' && (
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Verificando cámara...</p>
                        <pre className="mt-4 text-xs text-gray-500 max-w-xs mx-auto text-left bg-gray-900 p-2 rounded">
                            {debugInfo}
                        </pre>
                    </div>
                )}

                {permissionStatus === 'denied' && (
                    <div className="text-white text-center p-6 max-w-sm">
                        <div className="bg-red-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="mb-2 font-bold text-lg text-red-400">Acceso Bloqueado</p>
                        <p className="mb-4 text-sm text-gray-300">
                            El navegador bloqueó la cámara.
                        </p>

                        <div className="bg-gray-900 p-3 rounded-lg mb-6 text-left">
                            <p className="text-xs text-gray-400 font-mono break-all">
                                {debugInfo}
                            </p>
                        </div>

                        <div className="text-sm text-gray-300 mb-6 space-y-2 text-left bg-gray-800/50 p-4 rounded-lg">
                            <p className="font-bold text-white">Cómo desbloquear:</p>
                            <ol className="list-decimal pl-4 space-y-1">
                                <li>Toca el ícono 🔒 o ⚙️ en la barra de URL.</li>
                                <li>Ve a <strong>Permisos</strong> o <strong>Configuración del sitio</strong>.</li>
                                <li>Busca <strong>Cámara</strong> y selecciona <strong>Permitir</strong>.</li>
                                <li>Toca el botón &quot;Reintentar&quot; abajo.</li>
                            </ol>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-6 py-3 bg-[#0093D2] text-white rounded-xl font-bold active:scale-95 transition-transform"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {permissionStatus === 'error' && (
                    <div className="text-white text-center p-6">
                        <p className="text-red-500 font-bold">Error de Dispositivo</p>
                        <p className="text-sm text-gray-400 mt-2">{debugInfo}</p>
                    </div>
                )}

                {permissionStatus === 'granted' && (
                    <div className="w-full h-full relative">
                        {/* Usamos key para forzar remontaje si es necesario */}
                        <QrReader
                            key="scanner-active"
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
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0093D2] shadow-[0_0_10px_#0093D2] animate-[scan_2s_infinite]"></div>
                            </div>
                            <p className="absolute bottom-20 text-white/80 text-sm font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                                Cámara activa - Apunta al QR
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
