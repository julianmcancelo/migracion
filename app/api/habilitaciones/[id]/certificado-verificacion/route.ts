import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const habilitacionId = parseInt(params.id)
    if (isNaN(habilitacionId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Obtener habilitación completa
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacionId },
      include: {
        habilitaciones_personas: {
          include: {
            persona: true,
          },
        },
        habilitaciones_vehiculos: {
          include: {
            vehiculo: true,
          },
        },
      },
    })

    if (!habilitacion) {
      return NextResponse.json(
        { error: 'Habilitación no encontrada' },
        { status: 404 }
      )
    }

    // Validar que sea transporte escolar
    if (habilitacion.tipo_transporte !== 'Escolar') {
      return NextResponse.json(
        { error: 'Este certificado es solo para transporte escolar' },
        { status: 400 }
      )
    }

    // Buscar titular
    const titular = habilitacion.habilitaciones_personas.find(
      (hp) => hp.rol === 'TITULAR'
    )

    // Buscar conductor/chofer
    const conductor = habilitacion.habilitaciones_personas.find(
      (hp) => hp.rol === 'CHOFER' || hp.rol === 'CONDUCTOR'
    )

    // Buscar vehículo
    const vehiculoRel = habilitacion.habilitaciones_vehiculos[0]
    const vehiculo = vehiculoRel?.vehiculo

    if (!titular || !titular.persona || !vehiculo) {
      return NextResponse.json(
        { error: 'Faltan datos necesarios (titular o vehículo)' },
        { status: 400 }
      )
    }

    // Preparar datos
    const titularDomicilio = titular.persona.domicilio_calle
      ? `${titular.persona.domicilio_calle} ${titular.persona.domicilio_nro || ''}, ${titular.persona.domicilio_localidad || ''}`
      : 'N/A'

    const datos = {
      expediente: habilitacion.expte || 'S/N',
      licencia: habilitacion.nro_licencia || 'S/N',
      tipoHabilitacion: 'HABILITACIÓN',
      tipoTransporte: 'Escolar',
      
      titularNombre: titular.persona.nombre || 'N/A',
      titularDNI: titular.persona.dni || 'N/A',
      titularDomicilio,
      
      conductorNombre: conductor?.persona?.nombre || undefined,
      conductorDNI: conductor?.persona?.dni || undefined,
      
      dominio: vehiculo.dominio || 'N/A',
      marca: vehiculo.marca || 'N/A',
      modelo: vehiculo.modelo || 'N/A',
      inscripcion: vehiculo.inscripcion_inicial
        ? typeof vehiculo.inscripcion_inicial === 'string'
          ? vehiculo.inscripcion_inicial
          : new Date(vehiculo.inscripcion_inicial).toLocaleDateString('es-AR')
        : 'N/A',
    }

    // Retornar datos JSON (el PDF se genera en el cliente)
    return NextResponse.json({ success: true, data: datos })
  } catch (error) {
    console.error('Error al obtener datos del certificado:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos del certificado' },
      { status: 500 }
    )
  }
}
