'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Car, FileText, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';

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

export default function VerificacionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tramite, setTramite] = useState<Tramite | null>(null);

  useEffect(() => {
    // Recuperar el trámite del sessionStorage
    const tramiteStr = sessionStorage.getItem('tramite_actual');
    if (tramiteStr) {
      setTramite(JSON.parse(tramiteStr));
    } else {
      // Si no hay trámite, volver atrás
      router.back();
    }
  }, [router]);

  const handleComenzarInspeccion = () => {
    if (tramite) {
      // Guardar en sessionStorage para el formulario
      sessionStorage.setItem('tramite_inspeccion', JSON.stringify(tramite));
      router.push('/inspector-movil/formulario');
    }
  };

  if (!tramite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Verificación</h1>
            <p className="text-sm text-gray-600">
              {tramite.habilitacion.nro_licencia}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-4 pb-24">
        {/* Card Titular */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-bold text-blue-900">Titular</h2>
          </div>
          <div className="p-4 space-y-3">
            {tramite.titular ? (
              <>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nombre Completo</p>
                  <p className="text-base font-semibold text-gray-900">
                    {tramite.titular.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">DNI</p>
                  <p className="text-base font-semibold text-gray-900">
                    {tramite.titular.dni}
                  </p>
                </div>
                {tramite.titular.email && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm text-gray-700">{tramite.titular.email}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm">Sin información del titular</p>
            )}
          </div>
        </div>

        {/* Card Vehículo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center gap-2">
            <Car className="w-5 h-5 text-green-700" />
            <h2 className="text-base font-bold text-green-900">Vehículo</h2>
          </div>
          <div className="p-4 space-y-3">
            {tramite.vehiculo ? (
              <>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Dominio</p>
                  <div className="inline-block bg-gray-900 text-white text-base font-bold px-4 py-2 rounded tracking-widest">
                    {tramite.vehiculo.dominio}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Marca y Modelo</p>
                  <p className="text-base font-semibold text-gray-900">
                    {`${tramite.vehiculo.marca} ${tramite.vehiculo.modelo}`.trim()}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Sin información del vehículo</p>
            )}
          </div>
        </div>

        {/* Card Habilitación */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-purple-50 px-4 py-3 border-b border-purple-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-700" />
            <h2 className="text-base font-bold text-purple-900">Habilitación</h2>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">N° de Licencia</p>
              <p className="text-base font-semibold text-gray-900">
                {tramite.habilitacion.nro_licencia}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Tipo de Transporte</p>
              <span
                className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${
                  tramite.habilitacion.tipo_transporte === 'Escolar'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {tramite.habilitacion.tipo_transporte}
              </span>
            </div>
            {tramite.habilitacion.expte && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Expediente</p>
                <p className="text-base font-semibold text-gray-900">
                  {tramite.habilitacion.expte}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card Turno */}
        {tramite.turno && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-700" />
              <h2 className="text-base font-bold text-amber-900">
                Turno Asignado
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Fecha</p>
                <p className="text-base font-semibold text-gray-900">
                  {formatFecha(tramite.turno.fecha)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Hora</p>
                <p className="text-base font-semibold text-gray-900">
                  {tramite.turno.hora.substring(0, 5)} hs
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón flotante */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <button
          onClick={handleComenzarInspeccion}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <span>Comenzar Inspección</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
