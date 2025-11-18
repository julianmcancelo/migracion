'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, User, Truck, RefreshCw, AlertCircle } from 'lucide-react';

interface Habilitacion {
  id: number;
  nro_licencia: string;
  estado: string;
  tipo_transporte: string;
  expte: string;
}

interface Titular {
  nombre: string;
  dni: string;
  email?: string;
}

interface Vehiculo {
  dominio: string;
  marca: string;
  modelo: string;
}

interface Turno {
  fecha: string;
  hora: string;
  estado: string;
}

interface Tramite {
  habilitacion: Habilitacion;
  titular: Titular | null;
  vehiculo: Vehiculo | null;
  turno: Turno | null;
}

export default function TramitesPage() {
  const router = useRouter();
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('TODAS');

  const fetchTramites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/inspecciones/tramites-pendientes');
      const result = await response.json();
      
      if (result.status === 'success') {
        setTramites(result.data || []);
        setLastUpdate(new Date());
      } else {
        throw new Error(result.message || 'Error al cargar trámites');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTramites();
    
    // Auto-actualizar cada 30 segundos
    const interval = setInterval(() => {
      console.log('🔄 Auto-actualizando trámites...');
      fetchTramites();
    }, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  const handleSelectTramite = (tramite: Tramite) => {
    sessionStorage.setItem('tramite_actual', JSON.stringify(tramite));
    router.push(`/inspector-movil/verificacion?id=${tramite.habilitacion.id}`);
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'Escolar'
      ? 'bg-orange-50 text-orange-700 border-orange-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';
  };

  // Obtener fechas únicas disponibles
  const fechasDisponibles = Array.from(
    new Set(
      tramites
        .map(t => t.turno?.fecha)
        .filter(f => f)
    )
  ).sort();

  // Filtrar trámites por fecha seleccionada
  const tramitesFiltrados = fechaSeleccionada === 'TODAS' 
    ? tramites 
    : tramites.filter(t => t.turno?.fecha === fechaSeleccionada);

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const groupedTramites = tramitesFiltrados.reduce((acc, tramite) => {
    const fecha = tramite.turno?.fecha || 'Sin fecha';
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(tramite);
    return acc;
  }, {} as Record<string, Tramite[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-[#0093D2] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando trámites...</p>
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
            onClick={fetchTramites}
            className="bg-[#0093D2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#007AB8] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (tramites.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Todo al día</h2>
          <p className="text-gray-600 mb-6">
            No hay trámites pendientes de inspección.
          </p>
          <button
            onClick={fetchTramites}
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
          <h1 className="text-2xl font-bold text-center">Inspecciones</h1>
          <p className="text-sm text-white/80 mt-1 text-center">
            Selecciona un trámite para comenzar
          </p>
        </div>
      </div>

      {/* Barra de actualización */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-[120px] z-10 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            {lastUpdate && (
              <span>
                Actualizado: {lastUpdate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <button
            onClick={fetchTramites}
            disabled={isLoading}
            className="flex items-center gap-2 bg-[#0093D2] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#007AB8] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
        
        {/* Selector de fecha */}
        {fechasDisponibles.length > 0 && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0093D2] focus:border-transparent"
            >
              <option value="TODAS">Todas las fechas ({tramites.length})</option>
              {fechasDisponibles.map(fecha => {
                if (!fecha) return null;
                const count = tramites.filter(t => t.turno?.fecha === fecha).length;
                return (
                  <option key={fecha} value={fecha}>
                    {formatFecha(fecha)} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        {Object.entries(groupedTramites).map(([fecha, tramitesDelDia]) => (
          <div key={fecha} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                {fecha !== 'Sin fecha' ? formatFecha(fecha) : 'Sin fecha asignada'}
              </h2>
            </div>

            {tramitesDelDia.map((tramite) => (
              <button
                key={tramite.habilitacion.id}
                onClick={() => handleSelectTramite(tramite)}
                className="w-full bg-white rounded-xl shadow-sm border border-gray-200 mb-3 overflow-hidden hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex">
                  <div
                    className={`w-1.5 ${
                      tramite.habilitacion.estado === 'EN_TRAMITE'
                        ? 'bg-yellow-500'
                        : tramite.habilitacion.estado === 'HABILITADO'
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          Licencia: {tramite.habilitacion.nro_licencia || 'N/A'}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${getTipoColor(
                          tramite.habilitacion.tipo_transporte
                        )}`}
                      >
                        {tramite.habilitacion.tipo_transporte || 'N/A'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {tramite.titular?.nombre || 'Sin titular'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Truck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {tramite.vehiculo
                            ? `${tramite.vehiculo.marca} ${tramite.vehiculo.modelo}`.trim()
                            : 'Sin vehículo'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded tracking-wider">
                        {tramite.vehiculo?.dominio || 'S/D'}
                      </div>
                      {tramite.turno && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Turno:</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {tramite.turno.hora.substring(0, 5)} hs
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>

      <button
        onClick={fetchTramites}
        className="fixed bottom-6 right-6 bg-[#0093D2] text-white p-4 rounded-full shadow-lg hover:bg-[#007AB8] transition-colors active:scale-95"
        aria-label="Actualizar"
      >
        <RefreshCw className="w-6 h-6" />
      </button>
    </div>
  );
}
