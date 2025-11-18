/**
 * EJEMPLO DE MIDDLEWARE PARA PROTEGER RUTAS DE INSPECTOR
 * 
 * Este archivo muestra cómo implementar la protección de rutas
 * para el módulo de inspecciones.
 * 
 * Para usar este middleware:
 * 1. Renombrar a middleware.ts en la raíz del proyecto
 * 2. Adaptar la lógica de autenticación según tu sistema
 * 3. Descomentar y ajustar según necesidades
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener el pathname de la URL
  const pathname = request.nextUrl.pathname;

  // Verificar si la ruta es del módulo de inspector
  if (pathname.startsWith('/inspector-movil')) {
    // Obtener el token de autenticación (ajustar según tu implementación)
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // Redirigir al login si no hay token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // TODO: Verificar el token y el rol del usuario
    // Ejemplo con JWT:
    /*
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar que el usuario sea inspector
      if (decoded.rol !== 'inspector') {
        return NextResponse.redirect(new URL('/no-autorizado', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    */

    // Si todo está OK, continuar con la petición
    return NextResponse.next();
  }

  // Para otras rutas, continuar normalmente
  return NextResponse.next();
}

// Configurar qué rutas debe interceptar el middleware
export const config = {
  matcher: [
    '/inspector-movil/:path*',
    '/api/inspecciones/:path*',
  ],
};

/**
 * EJEMPLO DE HOOK PARA OBTENER DATOS DEL INSPECTOR AUTENTICADO
 * 
 * Crear en: hooks/useInspector.ts
 */

/*
'use client';

import { useEffect, useState } from 'react';

interface Inspector {
  id: number;
  nombre: string;
  legajo: string;
  email: string;
}

export function useInspector() {
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInspector() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.status === 'success' && data.user.rol === 'inspector') {
          setInspector(data.user);
        }
      } catch (error) {
        console.error('Error al obtener datos del inspector:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInspector();
  }, []);

  return { inspector, isLoading };
}
*/

/**
 * EJEMPLO DE USO EN EL FORMULARIO
 * 
 * En: app/inspector-movil/formulario/page.tsx
 */

/*
import { useInspector } from '@/hooks/useInspector';

export default function FormularioInspeccionPage() {
  const { inspector, isLoading } = useInspector();

  // ... resto del código

  const handleSubmit = async () => {
    const payload = {
      // ... otros datos
      nombre_inspector: inspector?.nombre || 'Inspector',
      legajo_inspector: inspector?.legajo,
      // ...
    };

    // Guardar inspección
  };
}
*/
