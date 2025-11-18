'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, Lock, LogIn } from 'lucide-react';

export default function InspectorLoginPage() {
  const router = useRouter();
  const [legajo, setLegajo] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login-inspector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ legajo, password }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Guardar datos en localStorage
        localStorage.setItem('inspector_token', result.data.token);
        localStorage.setItem(
          'inspector_data',
          JSON.stringify(result.data.inspector)
        );

        // Redirigir al menú principal
        router.push('/inspector-movil');
      } else {
        setError(result.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0093D2] via-[#007AB8] to-[#005A8C] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 shadow-lg p-4">
            <img
              src="https://www.lanus.gob.ar/logo-200.png"
              alt="Logo Municipio de Lanús"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Inspector Móvil
          </h1>
          <p className="text-blue-100">
            Municipalidad de Lanús
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Legajo */}
            <div>
              <label
                htmlFor="legajo"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Legajo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="legajo"
                  value={legajo}
                  onChange={(e) => setLegajo(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0093D2] focus:border-[#0093D2] text-base"
                  placeholder="Ingrese su legajo"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0093D2] focus:border-[#0093D2] text-base"
                  placeholder="Ingrese su contraseña"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#0093D2] hover:bg-[#007AB8] disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          {/* Info adicional */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Si olvidó su contraseña, contacte al administrador del sistema
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-blue-100">
            Sistema de Inspecciones Vehiculares
          </p>
          <p className="text-xs text-blue-200 mt-1">
            Versión 2.0 - {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
