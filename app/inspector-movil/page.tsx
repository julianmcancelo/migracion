'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  LogOut,
  Sun,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface Inspector {
  id: number;
  legajo: string;
  nombre: string;
  email: string;
  rol: string;
}

export default function InspectorMenuPage() {
  const router = useRouter();
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Verificar si hay sesión activa
    const token = localStorage.getItem('inspector_token');
    const inspectorData = localStorage.getItem('inspector_data');

    if (!token || !inspectorData) {
      // No hay sesión, redirigir al login
      router.push('/inspector-movil/login');
      return;
    }

    setInspector(JSON.parse(inspectorData));

    // Actualizar reloj cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('inspector_token');
    localStorage.removeItem('inspector_data');
    router.push('/inspector-movil/login');
  };

  const formatDate = (date: Date) => {
    const days = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return `${days[date.getDay()]}, ${date.getDate()} de ${
      months[date.getMonth()]
    }`;
  };

  if (!inspector) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0093D2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-[#0093D2] to-[#007AB8] text-white px-6 pt-8 pb-6">
        {/* Logo del municipio */}
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <img
              src="https://www.lanus.gob.ar/logo-200.png"
              alt="Logo Municipio de Lanús"
              className="h-12 w-auto"
            />
          </div>
        </div>

        {/* Top row */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Hola, {inspector.nombre.split(' ')[0]}
          </h1>
          <button
            onClick={handleLogout}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Info row */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <div>
            <p className="text-sm font-semibold">{formatDate(currentTime)}</p>
            <p className="text-xs text-blue-100">
              {currentTime.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5" />
            <span className="text-lg font-bold">24°C</span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Panel de Inspector
          </h2>
          <p className="text-gray-600">Selecciona una opción para comenzar</p>
        </div>

        {/* Cards de acciones */}
        <div className="space-y-4">
          {/* Nueva Inspección */}
          <button
            onClick={() => router.push('/inspector-movil/tramites')}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-4"
          >
            <div className="bg-[#E6F7FF] p-3 rounded-xl">
              <FileText className="w-7 h-7 text-[#0093D2]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-gray-900">
                Nueva Inspección
              </h3>
              <p className="text-sm text-gray-600">Comenzar un formulario</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Consultar Historial */}
          <button
            onClick={() => alert('Próximamente: Historial de inspecciones')}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-4"
          >
            <div className="bg-[#E6F7FF] p-3 rounded-xl">
              <Clock className="w-7 h-7 text-[#007AB8]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-gray-900">
                Consultar Historial
              </h3>
              <p className="text-sm text-gray-600">Ver inspecciones pasadas</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Colocación de Obleas */}
          <button
            onClick={() => router.push('/inspector-movil/obleas')}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-4"
          >
            <div className="bg-[#E6F7FF] p-3 rounded-xl">
              <Shield className="w-7 h-7 text-[#0093D2]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-bold text-gray-900">
                Colocación de Obleas
              </h3>
              <p className="text-sm text-gray-600">Registrar obleas colocadas</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Info del inspector */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Información del Inspector
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Legajo:</span>
              <span className="font-semibold text-gray-900">
                {inspector.legajo}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold text-gray-900 text-sm">
                {inspector.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center text-sm text-gray-500">
        <p>Sistema de Inspecciones Vehiculares</p>
        <p className="text-xs mt-1">Versión 2.0 - {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
