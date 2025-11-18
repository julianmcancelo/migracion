'use client';

import { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import Image from 'next/image';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  currentPhoto?: string | null;
  label: string;
}

export default function CameraCapture({
  onCapture,
  currentPhoto,
  label,
}: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      // Convertir a Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onCapture(base64);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        alert('Error al procesar la imagen');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Error al capturar la foto');
      setIsProcessing(false);
    }

    // Limpiar el input para permitir seleccionar la misma foto nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onCapture('');
  };

  return (
    <div className="w-full">
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      
      {currentPhoto ? (
        <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={currentPhoto}
            alt={label}
            fill
            className="object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
            aria-label="Eliminar foto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 hover:border-blue-400 transition-colors disabled:opacity-50"
        >
          <Camera className="w-8 h-8 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            {isProcessing ? 'Procesando...' : 'Tomar Foto'}
          </span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
