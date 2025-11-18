# 📚 Ejemplos de Uso - Módulo de Inspecciones

## 🔍 Consultas SQL Útiles

### Ver últimas inspecciones
```sql
SELECT 
  i.id,
  i.nro_licencia,
  i.tipo_transporte,
  i.nombre_inspector,
  i.fecha_inspeccion,
  COUNT(DISTINCT id_det.id) as total_items,
  COUNT(DISTINCT id_fot.id) as total_fotos
FROM inspecciones i
LEFT JOIN inspeccion_detalles id_det ON i.id = id_det.inspeccion_id
LEFT JOIN inspeccion_fotos id_fot ON i.id = id_fot.inspeccion_id
GROUP BY i.id
ORDER BY i.fecha_inspeccion DESC
LIMIT 10;
```

### Ver detalles de una inspección específica
```sql
SELECT 
  id.nombre_item,
  id.estado,
  id.observacion,
  CASE WHEN id.foto_path IS NOT NULL THEN 'Sí' ELSE 'No' END as tiene_foto
FROM inspeccion_detalles id
WHERE id.inspeccion_id = 1
ORDER BY id.nombre_item;
```

### Estadísticas por tipo de transporte
```sql
SELECT 
  tipo_transporte,
  COUNT(*) as total_inspecciones,
  AVG(
    (SELECT COUNT(*) 
     FROM inspeccion_detalles 
     WHERE inspeccion_id = i.id AND estado = 'bien')
  ) as promedio_items_bien
FROM inspecciones i
GROUP BY tipo_transporte;
```

### Inspecciones con ítems en mal estado
```sql
SELECT DISTINCT
  i.nro_licencia,
  i.tipo_transporte,
  i.fecha_inspeccion,
  id.nombre_item,
  id.estado,
  id.observacion
FROM inspecciones i
INNER JOIN inspeccion_detalles id ON i.id = id.inspeccion_id
WHERE id.estado = 'mal'
ORDER BY i.fecha_inspeccion DESC;
```

## 🎨 Componentes Personalizados

### Botón de Acción Flotante
```tsx
// components/inspector/FloatingActionButton.tsx
'use client';

import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
}

export default function FloatingActionButton({ 
  onClick, 
  icon = <Plus className="w-6 h-6" />,
  label = 'Nueva Acción'
}: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-95 z-50"
      aria-label={label}
    >
      {icon}
    </button>
  );
}
```

### Toast de Notificación
```tsx
// components/inspector/Toast.tsx
'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
  };

  return (
    <div className={`fixed top-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in`}>
      {icons[type]}
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        ×
      </button>
    </div>
  );
}
```

### Modal de Confirmación
```tsx
// components/inspector/ConfirmDialog.tsx
'use client';

import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-100 p-2 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🔧 Utilidades

### Comprimir Imagen Base64
```typescript
// lib/image-utils.ts

export async function compressBase64Image(
  base64: string,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto del canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = reject;
    img.src = base64;
  });
}
```

### Validar Base64
```typescript
// lib/validation-utils.ts

export function isValidBase64(str: string): boolean {
  try {
    const matches = str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return false;
    }
    // Intentar decodificar
    atob(matches[2]);
    return true;
  } catch {
    return false;
  }
}

export function getBase64Size(base64: string): number {
  const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return 0;
  }
  const base64Content = matches[2];
  return Math.round((base64Content.length * 3) / 4);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
```

### Geolocalización
```typescript
// lib/geolocation-utils.ts

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export async function getCurrentLocation(): Promise<Coordinates | null> {
  if (!navigator.geolocation) {
    console.warn('Geolocalización no disponible');
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.warn('Error al obtener ubicación:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
```

## 📊 Hooks Personalizados

### useInspectionForm
```typescript
// hooks/useInspectionForm.ts
'use client';

import { useState, useCallback } from 'react';
import type { InspectionItem } from '@/lib/inspection-config';

export function useInspectionForm(initialItems: InspectionItem[]) {
  const [items, setItems] = useState(initialItems);

  const updateItemState = useCallback((itemId: string, estado: 'bien' | 'regular' | 'mal') => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, estado } : item
      )
    );
  }, []);

  const updateItemObservation = useCallback((itemId: string, observacion: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, observacion } : item
      )
    );
  }, []);

  const updateItemPhoto = useCallback((itemId: string, foto: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, foto } : item
      )
    );
  }, []);

  const isComplete = useCallback(() => {
    return items.every((item) => item.estado !== null);
  }, [items]);

  const getStats = useCallback(() => {
    const total = items.length;
    const completed = items.filter((item) => item.estado !== null).length;
    const bien = items.filter((item) => item.estado === 'bien').length;
    const regular = items.filter((item) => item.estado === 'regular').length;
    const mal = items.filter((item) => item.estado === 'mal').length;

    return { total, completed, bien, regular, mal };
  }, [items]);

  return {
    items,
    updateItemState,
    updateItemObservation,
    updateItemPhoto,
    isComplete,
    getStats,
  };
}
```

### usePhotoCapture
```typescript
// hooks/usePhotoCapture.ts
'use client';

import { useState, useCallback } from 'react';
import { compressBase64Image } from '@/lib/image-utils';

export function usePhotoCapture() {
  const [isProcessing, setIsProcessing] = useState(false);

  const capturePhoto = useCallback(async (
    file: File,
    compress: boolean = true
  ): Promise<string> => {
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      if (compress) {
        const compressed = await compressBase64Image(base64);
        setIsProcessing(false);
        return compressed;
      }

      setIsProcessing(false);
      return base64;
    } catch (error) {
      setIsProcessing(false);
      throw error;
    }
  }, []);

  return { capturePhoto, isProcessing };
}
```

## 🧪 Tests de Ejemplo

### Test del Componente CameraCapture
```typescript
// __tests__/components/CameraCapture.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import CameraCapture from '@/components/inspector/CameraCapture';

describe('CameraCapture', () => {
  it('debe renderizar el botón de captura', () => {
    const mockOnCapture = jest.fn();
    render(
      <CameraCapture
        label="Test Photo"
        onCapture={mockOnCapture}
      />
    );

    expect(screen.getByText('Tomar Foto')).toBeInTheDocument();
  });

  it('debe mostrar la imagen cuando hay una foto', () => {
    const mockOnCapture = jest.fn();
    const testBase64 = 'data:image/png;base64,test';

    render(
      <CameraCapture
        label="Test Photo"
        currentPhoto={testBase64}
        onCapture={mockOnCapture}
      />
    );

    const img = screen.getByAltText('Test Photo');
    expect(img).toBeInTheDocument();
  });
});
```

## 🎯 Mejores Prácticas

### 1. Manejo de Errores
```typescript
try {
  const response = await fetch('/api/inspecciones/guardar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(result.message || 'Error desconocido');
  }

  // Éxito
  console.log('Inspección guardada:', result.data);
} catch (error) {
  console.error('Error al guardar:', error);
  // Mostrar mensaje al usuario
  alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
}
```

### 2. Validación de Formularios
```typescript
function validateInspectionData(data: any): string[] {
  const errors: string[] = [];

  if (!data.habilitacion_id) {
    errors.push('ID de habilitación es requerido');
  }

  if (!data.firma_inspector) {
    errors.push('Firma del inspector es obligatoria');
  }

  if (data.items.some((item: any) => item.estado === null)) {
    errors.push('Todos los ítems deben ser calificados');
  }

  return errors;
}
```

### 3. Optimización de Rendimiento
```typescript
// Usar memo para componentes pesados
const MemoizedInspectionCard = React.memo(InspectionCard);

// Lazy loading de imágenes
const LazyImage = dynamic(() => import('@/components/LazyImage'), {
  loading: () => <div className="animate-pulse bg-gray-200" />,
});

// Debounce para búsquedas
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value: string) => {
    // Realizar búsqueda
  },
  500
);
```

---

**¡Estos ejemplos te ayudarán a extender y personalizar el módulo!** 🚀
