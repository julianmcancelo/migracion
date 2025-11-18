import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/inspecciones/tramites-pendientes
 * Obtiene los trámites con turnos asignados que están pendientes de inspección
 */
export async function GET() {
  try {
    console.log('🔍 Buscando trámites pendientes...');
    
    // Primero obtener turnos pendientes/confirmados
    const turnosPendientes = await prisma.turnos.findMany({
      where: {
        estado: {
          in: ['PENDIENTE', 'CONFIRMADO'],
        },
      },
      orderBy: {
        fecha: 'asc',
      },
    });

    console.log(`📋 Encontrados ${turnosPendientes.length} turnos pendientes/confirmados`);
    
    if (turnosPendientes.length > 0) {
      console.log('📅 Primeros 3 turnos:', turnosPendientes.slice(0, 3).map(t => ({
        id: t.id,
        fecha: t.fecha,
        estado: t.estado,
        habilitacion_id: t.habilitacion_id
      })));
    }

    // Obtener habilitaciones de esos turnos (IDs únicos)
    const habilitacionIds = Array.from(new Set(turnosPendientes.map(t => t.habilitacion_id)));
    
    console.log(`🔑 IDs de habilitaciones a buscar: ${habilitacionIds.join(', ')}`);
    
    // Primero obtener TODAS las habilitaciones para ver sus estados
    const todasLasHabilitaciones = await prisma.habilitaciones_generales.findMany({
      where: {
        id: {
          in: habilitacionIds,
        },
      },
    });
    
    console.log(`📊 Estados de todas las habilitaciones:`, todasLasHabilitaciones.map(h => ({
      id: h.id,
      nro_licencia: h.nro_licencia,
      estado: h.estado,
      is_deleted: h.is_deleted
    })));
    
    // Ahora filtrar solo las válidas (no eliminadas)
    const habilitaciones = await prisma.habilitaciones_generales.findMany({
      where: {
        id: {
          in: habilitacionIds,
        },
        is_deleted: false,
        // Removido el filtro de estado para mostrar todas
      },
    });

    console.log(`🏢 Encontradas ${habilitaciones.length} habilitaciones válidas`);
    
    if (habilitaciones.length > 0) {
      console.log('🔑 Primeras 3 habilitaciones:', habilitaciones.slice(0, 3).map(h => ({
        id: h.id,
        nro_licencia: h.nro_licencia,
        estado: h.estado,
        tipo_transporte: h.tipo_transporte
      })));
    }

    // Obtener datos relacionados manualmente
    const tramitesFormateados = await Promise.all(
      habilitaciones.map(async (hab) => {
        // Obtener titular
        const habPersona = await prisma.habilitaciones_personas.findFirst({
          where: {
            habilitacion_id: hab.id,
            rol: 'TITULAR',
          },
          include: {
            persona: true,
          },
        });

        // Obtener vehículo
        const habVehiculo = await prisma.habilitaciones_vehiculos.findFirst({
          where: {
            habilitacion_id: hab.id,
            activo: true,
          },
          include: {
            vehiculo: true,
          },
        });

        // Obtener turno más próximo
        const turno = turnosPendientes.find(t => t.habilitacion_id === hab.id);

        return {
          habilitacion: {
            id: hab.id,
            nro_licencia: hab.nro_licencia,
            estado: hab.estado,
            tipo_transporte: hab.tipo_transporte,
            expte: hab.expte,
          },
          titular: habPersona?.persona
            ? {
                nombre: habPersona.persona.nombre,
                dni: habPersona.persona.dni,
                email: habPersona.persona.email,
              }
            : null,
          vehiculo: habVehiculo?.vehiculo
            ? {
                dominio: habVehiculo.vehiculo.dominio,
                marca: habVehiculo.vehiculo.marca,
                modelo: habVehiculo.vehiculo.modelo,
              }
            : null,
          turno: turno
            ? {
                fecha: turno.fecha.toISOString().split('T')[0],
                hora: turno.hora.toISOString().split('T')[1].substring(0, 5),
                estado: turno.estado,
              }
            : null,
        };
      })
    );

    console.log(`✅ Retornando ${tramitesFormateados.length} trámites formateados`);

    return NextResponse.json({
      status: 'success',
      data: tramitesFormateados,
    });
  } catch (error) {
    console.error('Error al obtener trámites pendientes:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error al obtener los trámites pendientes',
      },
      { status: 500 }
    );
  }
}
