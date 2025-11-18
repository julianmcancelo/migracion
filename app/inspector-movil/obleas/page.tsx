'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  User,
  Car,
  Calendar,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

interface Oblea {
  id: number;
  nro_licencia: string;
  tipo_transporte: string;
  estado: string;
  vigencia_inicio: string | null;
  vigencia_fin: string | null;
  titular: {
    nombre: string;
    dni: string;
    telefono: string | null;
  };
  vehiculo: {
    dominio: string;
    marca: string;
    modelo: string;
    anio: number | null;
  };
  turno: {
    fecha: string;
    hora: string;
  } | null;
}

export default function ObleasPage() {
  const router = useRouter();
  const [obleas, setObleas] = useState<Oblea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObleas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/obleas/pendientes');
      const result = await response.json();

      if (result.status === 'success') {
        setObleas(result.data || []);
      } else {
        throw new Error(result.message || 'Error al cargar obleas');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Verificar sesión
    const token = localStorage.getItem('inspector_token');
    if (!token) {
      router.push('/inspector-movil/login');
      return;
    }

    fetchObleas();
  }, [router]);

  const handleSelectOblea = (oblea: Oblea) => {
    sessionStorage.setItem('oblea_actual', JSON.stringify(oblea));
    router.push(`/inspector-movil/obleas/colocar?id=${oblea.id}`);
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'Escolar'
      ? 'bg-orange-50 text-orange-700 border-orange-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-[#0093D2] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando obleas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error al Cargar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchObleas}
            className="bg-[#0093D2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#007AB8] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (obleas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Todo al día</h2>
          <p className="text-gray-600 mb-6">
            No hay obleas pendientes de colocación.
          </p>
          <button
            onClick={fetchObleas}
            className="bg-[#0093D2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#007AB8] transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0093D2] to-[#007AB8] text-white sticky top-0 z-10 shadow-lg">
        <div className="px-4 py-4">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <div className="bg-white rounded-full p-1.5 shadow-md">
              <img
                src="https://www.lanus.gob.ar/logo-200.png"
                alt="Logo Municipio de Lanús"
                className="h-8 w-auto"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center">Obleas Pendientes</h1>
          <p className="text-sm text-white/80 mt-1 text-center">
            Selecciona una habilitación para colocar oblea
          </p>
        </div>
      </div>

      {/* Lista de obleas */}
      <div className="px-4 pt-4 space-y-3">
        {obleas.map((oblea) => (
          <button
            key={oblea.id}
            onClick={() => handleSelectOblea(oblea)}
            className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex">
              {/* Barra lateral */}
              <div className="w-1.5 bg-[#0093D2]" />

              <div className="flex-1 p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Licencia: {oblea.nro_licencia || 'N/A'}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${getTipoColor(
                      oblea.tipo_transporte
                    )}`}
                  >
                    {oblea.tipo_transporte || 'N/A'}
                  </span>
                </div>

                {/* Información */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{oblea.titular.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Car className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {oblea.vehiculo.marca} {oblea.vehiculo.modelo}
                    </span>
                  </div>
                  {oblea.turno && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>
                        {new Date(oblea.turno.fecha).toLocaleDateString('es-AR')} -{' '}
                        {oblea.turno.hora}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded tracking-wider">
                    {oblea.vehiculo.dominio}
                  </div>
                  <div className="flex items-center gap-1 text-[#0093D2]">
                    <span className="text-sm font-semibold">Colocar oblea</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Botón flotante */}
      <button
        onClick={fetchObleas}
        className="fixed bottom-6 right-6 bg-[#0093D2] text-white p-4 rounded-full shadow-lg hover:bg-[#007AB8] transition-colors active:scale-95"
        aria-label="Actualizar"
      >
        <RefreshCw className="w-6 h-6" />
      </button>
    </div>
  );
}
