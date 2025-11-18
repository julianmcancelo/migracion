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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calcular nuevas dimensiones (máximo 800px para reducir tamaño)
          let width = img.width;
          let height = img.height;
          const maxSize = 800; // Reducido de 1200 a 800
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Dibujar imagen redimensionada
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convertir a Base64 con calidad más baja (0.5 = 50%)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
          
          console.log(`📸 Imagen comprimida: ${(compressedBase64.length / 1024).toFixed(0)}KB`);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      // Comprimir imagen antes de enviar
      const compressedBase64 = await compressImage(file);
      onCapture(compressedBase64);
    } catch (error) {
      alert('Error al procesar la imagen');
    } finally {
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
