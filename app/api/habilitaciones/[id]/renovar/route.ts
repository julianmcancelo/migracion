import { NextRequest, NextResponse } from 'next/server'
import { verificarSesion } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notificarAdmins } from '@/lib/notificaciones'

/**
 * POST - Renovar una habilitación para el año siguiente
 * Body: { 
 *   nuevoExpediente: string (requerido, nuevo número de expediente)
 *   cambiarDatos?: boolean (si true, permite editar datos en el siguiente paso)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await verificarSesion()
    if (!usuario) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const habilitacionId = parseInt(params.id)
    const body = await request.json()
    const { nuevoExpediente, cambiarDatos = false } = body

    // Validar expediente
    if (!nuevoExpediente) {
      return NextResponse.json(
        { error: 'El número de expediente es requerido' },
        { status: 400 }
      )
    }

    // 1. Obtener habilitación actual completa
    const habActual = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacionId },
      include: {
        habilitaciones_personas: {
          include: {
            persona: true,
          },
        },
        habilitaciones_vehiculos: {
          where: { activo: true },
          include: {
            vehiculo: true,
          },
        },
      },
    })

    if (!habActual) {
      return NextResponse.json(
        { error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que no haya sido renovada ya
    if (habActual.fue_renovada) {
      return NextResponse.json(
        { error: 'Esta habilitación ya fue renovada' },
        { status: 400 }
      )
    }

    // 2. Validar documentos vigentes
    const validacion = await validarDocumentosVigentes(habActual)
    if (!validacion.ok && !cambiarDatos) {
      return NextResponse.json(
        {
          error: 'Documentos vencidos',
          faltantes: validacion.faltantes,
          advertencia: true,
        },
        { status: 400 }
      )
    }

    // 3. Calcular nuevo año y número de licencia
    const añoActual = new Date().getFullYear()
    const numeroLicencia = habActual.nro_licencia?.split('/')[0] || habActual.nro_licencia
    const nuevaLicencia = `${numeroLicencia}/${añoActual}`

    // 4. Crear nueva habilitación (renovación)
    const habNueva = await prisma.habilitaciones_generales.create({
      data: {
        anio: añoActual,
        nro_licencia: nuevaLicencia,
        expte: nuevoExpediente,
        tipo: habActual.tipo,
        tipo_transporte: habActual.tipo_transporte,
        vigencia_inicio: new Date(añoActual, 0, 1), // 1 de enero
        vigencia_fin: new Date(añoActual, 11, 31), // 31 de diciembre
        estado: 'EN_TRAMITE',
        oblea_colocada: false,
        observaciones: `Renovación de habilitación ${habActual.nro_licencia}`,
        es_renovacion: true,
        renovacion_de_id: habActual.id,
        fecha_renovacion: new Date(),
        establecimiento_id: habActual.establecimiento_id,
        remiseria_id: habActual.remiseria_id,
      },
    })

    // 5. Copiar personas asociadas
    if (habActual.habilitaciones_personas.length > 0) {
      const personasData = habActual.habilitaciones_personas.map((hp) => ({
        habilitacion_id: habNueva.id,
        persona_id: hp.persona_id,
        rol: hp.rol,
        licencia_categoria: hp.licencia_categoria,
      }))

      await prisma.habilitaciones_personas.createMany({
        data: personasData,
      })
    }

    // 6. Copiar vehículos activos
    if (habActual.habilitaciones_vehiculos.length > 0) {
      const vehiculosData = habActual.habilitaciones_vehiculos
        .filter((hv) => hv.activo)
        .map((hv) => ({
          habilitacion_id: habNueva.id,
          vehiculo_id: hv.vehiculo_id,
          activo: true,
          fecha_alta: new Date(),
        }))

      if (vehiculosData.length > 0) {
        await prisma.habilitaciones_vehiculos.createMany({
          data: vehiculosData,
        })
      }
    }

    // 7. Marcar la habilitación anterior como renovada
    await prisma.habilitaciones_generales.update({
      where: { id: habilitacionId },
      data: {
        fue_renovada: true,
        renovada_en_id: habNueva.id,
      },
    })

    // 8. Crear novedad/historial
    await prisma.habilitaciones_novedades.create({
      data: {
        habilitacion_id: habActual.id,
        tipo_novedad: 'RENOVACION',
        entidad_afectada: 'habilitacion',
        descripcion: `Habilitación renovada para el año ${añoActual}. Nueva licencia: ${nuevaLicencia}`,
        usuario_id: usuario.id,
        usuario_nombre: usuario.nombre,
        datos_nuevos: JSON.stringify({
          nueva_habilitacion_id: habNueva.id,
          nueva_licencia: nuevaLicencia,
          nuevo_expediente: nuevoExpediente,
        }),
      },
    })

    // 9. Notificar a administradores
    const titular = habActual.habilitaciones_personas.find((hp) => hp.rol === 'TITULAR')
    const nombreTitular = titular?.persona?.nombre || 'Titular desconocido'

    await notificarAdmins({
      tipo: 'renovacion_creada',
      titulo: 'Renovación de habilitación',
      mensaje: `${nombreTitular} - Lic. ${nuevaLicencia} renovada (Expte: ${nuevoExpediente})`,
      icono: '🔄',
      url: `/habilitaciones/${habNueva.id}`,
      metadata: {
        habilitacion_anterior_id: habActual.id,
        habilitacion_nueva_id: habNueva.id,
        licencia_anterior: habActual.nro_licencia,
        licencia_nueva: nuevaLicencia,
      },
    })

    return NextResponse.json({
      success: true,
      mensaje: 'Habilitación renovada exitosamente',
      habilitacion_anterior: {
        id: habActual.id,
        licencia: habActual.nro_licencia,
      },
      habilitacion_nueva: {
        id: habNueva.id,
        licencia: nuevaLicencia,
        expediente: nuevoExpediente,
      },
      advertencias: validacion.faltantes.length > 0 ? validacion.faltantes : null,
    })
  } catch (error) {
    console.error('Error al renovar habilitación:', error)
    return NextResponse.json(
      { error: 'Error al renovar la habilitación' },
      { status: 500 }
    )
  }
}

/**
 * Validar que los documentos de la habilitación estén vigentes
 */
async function validarDocumentosVigentes(habilitacion: any) {
  const hoy = new Date()
  const faltantes: string[] = []

  // Validar vehículos activos
  for (const hv of habilitacion.habilitaciones_vehiculos) {
    if (!hv.activo) continue

    const vehiculo = hv.vehiculo

    // VTV
    if (vehiculo.Vencimiento_VTV) {
      const vencimientoVTV = new Date(vehiculo.Vencimiento_VTV)
      if (vencimientoVTV < hoy) {
        faltantes.push(
          `VTV vencida del vehículo ${vehiculo.dominio} (venció el ${vencimientoVTV.toLocaleDateString()})`
        )
      }
    } else {
      faltantes.push(`Falta fecha de vencimiento VTV del vehículo ${vehiculo.dominio}`)
    }

    // Póliza de seguro
    if (vehiculo.Vencimiento_Poliza) {
      const vencimientoPoliza = new Date(vehiculo.Vencimiento_Poliza)
      if (vencimientoPoliza < hoy) {
        faltantes.push(
          `Póliza de seguro vencida del vehículo ${vehiculo.dominio} (venció el ${vencimientoPoliza.toLocaleDateString()})`
        )
      }
    } else {
      faltantes.push(`Falta fecha de vencimiento de póliza del vehículo ${vehiculo.dominio}`)
    }
  }

  // TODO: Validar otros documentos (licencias de conducir, certificados, etc.)

  return {
    ok: faltantes.length === 0,
    faltantes,
  }
}
