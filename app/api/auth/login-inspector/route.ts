import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/login-inspector
 * Login exclusivo para inspectores con legajo y contraseña
 */
export async function POST(request: NextRequest) {
  try {
    const { legajo, password } = await request.json();

    // Validaciones básicas
    if (!legajo || !password) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Legajo y contraseña son obligatorios',
        },
        { status: 400 }
      );
    }

    // Buscar inspector en la base de datos
    const inspector = await prisma.admin.findFirst({
      where: {
        legajo: legajo.toString(),
        rol: 'inspector', // Solo inspectores pueden usar esta app
      },
      select: {
        id: true,
        legajo: true,
        nombre: true,
        email: true,
        password: true,
        rol: true,
      },
    });

    if (!inspector) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Legajo no encontrado o no tiene permisos de inspector',
        },
        { status: 401 }
      );
    }

    // Verificar contraseña
    if (!inspector.password) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Usuario sin contraseña configurada',
        },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, inspector.password);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Contraseña incorrecta',
        },
        { status: 401 }
      );
    }

    // Generar token simple (en producción usar JWT)
    const token = Buffer.from(
      JSON.stringify({
        id: inspector.id,
        legajo: inspector.legajo,
        timestamp: Date.now(),
      })
    ).toString('base64');

    // Retornar datos del inspector sin la contraseña
    return NextResponse.json({
      status: 'success',
      message: 'Login exitoso',
      data: {
        token,
        inspector: {
          id: inspector.id,
          legajo: inspector.legajo,
          nombre: inspector.nombre,
          email: inspector.email,
          rol: inspector.rol,
        },
      },
    });
  } catch (error) {
    console.error('Error en login de inspector:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error al procesar el login',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
