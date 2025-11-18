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
  Search,
  Filter,
  X,
  Bus,
  CarFront,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface Oblea {
  id: number;
  nro_licencia: string;
  nro_resolucion: string | null;
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
  const [obleasFiltradas, setObleasFiltradas] = useState<Oblea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'Escolar' | 'Remis'>('TODOS');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const fetchObleas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/obleas/pendientes');
      const result = await response.json();

      if (result.status === 'success') {
        setObleas(result.data || []);
        setObleasFiltradas(result.data || []);
      } else {
        throw new Error(result.message || 'Error al cargar obleas');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...obleas];

    // Filtro por tipo
    if (filtroTipo !== 'TODOS') {
      resultado = resultado.filter(oblea => oblea.tipo_transporte === filtroTipo);
    }

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(oblea =>
        oblea.nro_licencia.toLowerCase().includes(busquedaLower) ||
        oblea.titular.nombre.toLowerCase().includes(busquedaLower) ||
        oblea.titular.dni.includes(busqueda) ||
        oblea.vehiculo.dominio.toLowerCase().includes(busquedaLower) ||
        oblea.vehiculo.marca.toLowerCase().includes(busquedaLower) ||
        oblea.vehiculo.modelo.toLowerCase().includes(busquedaLower)
      );
    }

    setObleasFiltradas(resultado);
  }, [obleas, filtroTipo, busqueda]);

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

  const contarPorTipo = () => {
    const escolar = obleas.filter(o => o.tipo_transporte === 'Escolar').length;
    const remis = obleas.filter(o => o.tipo_transporte === 'Remis').length;
    return { escolar, remis, total: obleas.length };
  };

  const stats = contarPorTipo();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Mejorado */}
      <div className="bg-gradient-to-r from-[#0093D2] to-[#007AB8] text-white sticky top-0 z-20 shadow-xl">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Obleas Pendientes</h1>
                <p className="text-xs text-blue-100">{stats.total} habilitaciones</p>
              </div>
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="bg-white/20 rounded-full p-2 active:bg-white/30"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFiltroTipo('TODOS')}
              className={`rounded-lg p-2 transition-all ${
                filtroTipo === 'TODOS'
                  ? 'bg-white text-[#0093D2] shadow-md'
                  : 'bg-white/10 text-white'
              }`}
            >
              <p className="text-xs font-medium">Todas</p>
              <p className="text-lg font-bold">{stats.total}</p>
            </button>
            <button
              onClick={() => setFiltroTipo('Escolar')}
              className={`rounded-lg p-2 transition-all ${
                filtroTipo === 'Escolar'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white/10 text-white'
              }`}
            >
              <p className="text-xs font-medium">Escolar</p>
              <p className="text-lg font-bold">{stats.escolar}</p>
            </button>
            <button
              onClick={() => setFiltroTipo('Remis')}
              className={`rounded-lg p-2 transition-all ${
                filtroTipo === 'Remis'
                  ? 'bg-[#0093D2] text-white shadow-md'
                  : 'bg-white/10 text-white'
              }`}
            >
              <p className="text-xs font-medium">Remis</p>
              <p className="text-lg font-bold">{stats.remis}</p>
            </button>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {mostrarFiltros && (
          <div className="bg-white/10 backdrop-blur-sm px-4 py-3 border-t border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Buscar por licencia, titular, dominio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-white/20 text-white placeholder-white/60 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      {obleasFiltradas.length === 0 && obleas.length > 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-white rounded-full p-4 mb-4 shadow-lg">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Sin resultados</h3>
          <p className="text-gray-600 text-center mb-4">
            No se encontraron obleas con los filtros aplicados
          </p>
          <button
            onClick={() => {
              setBusqueda('');
              setFiltroTipo('TODOS');
            }}
            className="bg-[#0093D2] text-white px-6 py-2 rounded-lg font-semibold active:bg-[#007AB8]"
          >
            Limpiar filtros
          </button>
        </div>
      ) : obleas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-green-100 rounded-full p-4 mb-4 shadow-lg">
            <Shield className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Todo al día</h3>
          <p className="text-gray-600 text-center">
            No hay obleas pendientes de colocación
          </p>
        </div>
      ) : (
        <>
          {/* Contador de resultados */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-bold text-[#0093D2]">{obleasFiltradas.length}</span> de{' '}
              <span className="font-bold">{obleas.length}</span> obleas
              {filtroTipo !== 'TODOS' && (
                <span className="ml-2 text-xs bg-blue-50 text-[#0093D2] px-2 py-1 rounded-full font-semibold border border-[#0093D2]/20">
                  {filtroTipo}
                </span>
              )}
            </p>
          </div>

          {/* Lista de obleas */}
          <div className="px-4 pb-4 space-y-3">
            {obleasFiltradas.map((oblea) => (
              <button
                key={oblea.id}
                onClick={() => handleSelectOblea(oblea)}
                className="w-full bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden active:scale-[0.97] transition-all hover:shadow-xl hover:border-[#0093D2]/30"
              >
                {/* Header con tipo y estado */}
                <div className={`px-4 py-3 flex items-center justify-between ${
                  oblea.tipo_transporte === 'Escolar' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                    : 'bg-gradient-to-r from-[#0093D2] to-[#007AB8]'
                }`}>
                  <div className="flex items-center gap-2 text-white">
                    {oblea.tipo_transporte === 'Escolar' ? (
                      <div className="bg-white/20 rounded-full p-1.5">
                        <Bus className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="bg-white/20 rounded-full p-1.5">
                        <CarFront className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold">{oblea.tipo_transporte}</p>
                      <p className="text-xs text-white/80">Lic. {oblea.nro_licencia}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-bold text-white">
                      {oblea.estado || 'Habilitado'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {/* Número de Resolución */}
                  {oblea.nro_resolucion && (
                    <div className="mb-3 flex items-center justify-center">
                      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-lg px-4 py-2 shadow-sm">
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide text-center">
                          N° Resolución
                        </p>
                        <p className="text-lg font-black text-emerald-700 text-center">
                          {oblea.nro_resolucion}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Dominio destacado con diseño mejorado */}
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl blur-sm opacity-50"></div>
                    <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white text-2xl font-black px-5 py-3 rounded-xl tracking-[0.3em] shadow-xl border-2 border-gray-700">
                      {oblea.vehiculo.dominio}
                    </div>
                  </div>

                  {/* Información en grid */}
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {/* Titular */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-200/50">
                      <div className="flex items-center gap-3">
                        <div className="bg-white rounded-full p-2 shadow-sm">
                          <User className="w-5 h-5 text-[#0093D2]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#0093D2] font-bold uppercase tracking-wide">Titular</p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {oblea.titular.nombre}
                          </p>
                          <p className="text-xs text-gray-600">DNI: {oblea.titular.dni}</p>
                        </div>
                      </div>
                    </div>

                    {/* Vehículo */}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-3 border border-purple-200/50">
                      <div className="flex items-center gap-3">
                        <div className="bg-white rounded-full p-2 shadow-sm">
                          <Car className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-purple-600 font-bold uppercase tracking-wide">Vehículo</p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {oblea.vehiculo.marca} {oblea.vehiculo.modelo}
                          </p>
                          {oblea.vehiculo.anio && (
                            <p className="text-xs text-gray-600">Año: {oblea.vehiculo.anio}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Turno */}
                    {oblea.turno && (
                      <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-3 border border-green-200/50">
                        <div className="flex items-center gap-3">
                          <div className="bg-white rounded-full p-2 shadow-sm">
                            <Clock className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-green-600 font-bold uppercase tracking-wide">Turno Programado</p>
                            <p className="text-sm font-bold text-gray-900">
                              {new Date(oblea.turno.fecha).toLocaleDateString('es-AR', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                            <p className="text-xs text-gray-600">Hora: {oblea.turno.hora}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Vigencia */}
                    {oblea.vigencia_fin && (
                      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl p-3 border border-amber-200/50">
                        <div className="flex items-center gap-3">
                          <div className="bg-white rounded-full p-2 shadow-sm">
                            <Calendar className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-amber-600 font-bold uppercase tracking-wide">Vigencia</p>
                            <p className="text-sm font-bold text-gray-900">
                              Hasta {new Date(oblea.vigencia_fin).toLocaleDateString('es-AR', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botón de acción mejorado */}
                  <div className="mt-4">
                    <div className="bg-gradient-to-r from-[#0093D2] to-[#007AB8] rounded-xl p-4 shadow-md">
                      <div className="flex items-center justify-center gap-2 text-white font-bold">
                        <Shield className="w-6 h-6" />
                        <span className="text-base">Colocar Oblea</span>
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Botón flotante de actualizar */}
      <button
        onClick={fetchObleas}
        className="fixed bottom-6 right-6 bg-[#0093D2] text-white p-4 rounded-full shadow-2xl hover:bg-[#007AB8] transition-all active:scale-95 z-10"
        aria-label="Actualizar"
      >
        <RefreshCw className="w-6 h-6" />
      </button>
    </div>
  );
}
