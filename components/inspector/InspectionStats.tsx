'use client';

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { InspectionItem } from '@/lib/inspection-config';

interface InspectionStatsProps {
  items: InspectionItem[];
}

export default function InspectionStats({ items }: InspectionStatsProps) {
  const total = items.length;
  const completed = items.filter((item) => item.estado !== null).length;
  const bien = items.filter((item) => item.estado === 'bien').length;
  const regular = items.filter((item) => item.estado === 'regular').length;
  const mal = items.filter((item) => item.estado === 'mal').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Progreso de Inspección</h3>
        <span className="text-sm font-bold text-blue-600">
          {completed}/{total}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Estadísticas */}
      {completed > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 bg-green-50 rounded-lg p-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-green-600 font-semibold">Bien</p>
              <p className="text-lg font-bold text-green-700">{bien}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-yellow-50 rounded-lg p-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-yellow-600 font-semibold">Regular</p>
              <p className="text-lg font-bold text-yellow-700">{regular}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-red-50 rounded-lg p-2">
            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-red-600 font-semibold">Mal</p>
              <p className="text-lg font-bold text-red-700">{mal}</p>
            </div>
          </div>
        </div>
      )}

      {completed === 0 && (
        <p className="text-sm text-gray-500 text-center">
          Comienza a calificar los ítems
        </p>
      )}
    </div>
  );
}
