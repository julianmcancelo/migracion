import { NextRequest, NextResponse } from 'next/server'
import { verificarSesion } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notificarAdmins } from '@/lib/notificaciones'

/**
 * POST - Renovar una habilitación para el año siguiente
 * Body: { 
 *   nuevoExpediente: string (requerido, nuevo número de expediente)
 *   copiarTitular?: boolean (default true)
 *   copiarVehiculo?: boolean (default true)
 *   nuevoTitular?: { nombre, apellido, dni, ... } (si copiarTitular = false)
 *   nuevoVehiculo?: { dominio, marca, modelo, ... } (si copiarVehiculo = false)
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
    const { 
      nuevoExpediente, 
      copiarTitular = true, 
      copiarVehiculo = true,
      nuevoTitular,
      nuevoVehiculo
    } = body

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

    // 2. Validar documentos vigentes (solo si se copian datos)
    let validacion = { ok: true, faltantes: [] as string[] }
    if (copiarVehiculo) {
      validacion = await validarDocumentosVigentes(habActual)
    }

    // 3. Calcular nuevo año y número de licencia (SIN año en el número)
    const añoActual = new Date().getFullYear()
    const numeroLicencia = habActual.nro_licencia
    const nuevaLicencia = numeroLicencia // Mantiene el mismo número sin cambios

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

    // 5. Titular: Copiar o crear nuevo
    if (copiarTitular && habActual.habilitaciones_personas.length > 0) {
      // Copiar personas existentes
      const personasData = habActual.habilitaciones_personas.map((hp: any) => ({
        habilitacion_id: habNueva.id,
        persona_id: hp.persona_id,
        rol: hp.rol,
        licencia_categoria: hp.licencia_categoria,
      }))

      await prisma.habilitaciones_personas.createMany({
        data: personasData,
      })
    } else if (!copiarTitular && nuevoTitular) {
      // Crear nueva persona
      const nuevaPersona = await prisma.personas.create({
        data: {
          nombre: nuevoTitular.nombre,
          apellido: nuevoTitular.apellido,
          dni: nuevoTitular.dni,
          fecha_nacimiento: nuevoTitular.fecha_nacimiento || null,
          domicilio: nuevoTitular.domicilio || null,
          telefono: nuevoTitular.telefono || null,
          email: nuevoTitular.email || null,
        },
      })

      // Asociar a la habilitación
      await prisma.habilitaciones_personas.create({
        data: {
          habilitacion_id: habNueva.id,
          persona_id: nuevaPersona.id,
          rol: 'TITULAR',
          licencia_categoria: nuevoTitular.licencia_categoria || null,
        },
      })
    }

    // 6. Vehículo: Copiar o crear nuevo
    if (copiarVehiculo && habActual.habilitaciones_vehiculos.length > 0) {
      // Copiar vehículos existentes
      const vehiculosData = habActual.habilitaciones_vehiculos
        .filter((hv: any) => hv.activo)
        .map((hv: any) => ({
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
    } else if (!copiarVehiculo && nuevoVehiculo) {
      // Crear nuevo vehículo
      const nuevoVeh = await prisma.vehiculos.create({
        data: {
          dominio: nuevoVehiculo.dominio,
          marca: nuevoVehiculo.marca || null,
          modelo: nuevoVehiculo.modelo || null,
          anio: nuevoVehiculo.anio || null,
          tipo: nuevoVehiculo.tipo || null,
          chasis: nuevoVehiculo.chasis || null,
          motor: nuevoVehiculo.motor || null,
          Vencimiento_VTV: nuevoVehiculo.Vencimiento_VTV || null,
          Vencimiento_Poliza: nuevoVehiculo.Vencimiento_Poliza || null,
        },
      })

      // Asociar a la habilitación
      await prisma.habilitaciones_vehiculos.create({
        data: {
          habilitacion_id: habNueva.id,
          vehiculo_id: nuevoVeh.id,
          activo: true,
          fecha_alta: new Date(),
        },
      })
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
