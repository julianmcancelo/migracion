import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones/export
 * Exporta lista de habilitaciones a Excel
 */
export async function GET(request: NextRequest) {
    try {
        // Verificar autenticación
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        // Obtener parámetros de la URL
        const searchParams = request.nextUrl.searchParams
        const tipo = searchParams.get('tipo') || 'Escolar'
        const buscar = searchParams.get('buscar') || ''

        // Validar tipo de transporte según rol
        const tiposPermitidos = session.rol === 'demo' ? ['Demo'] : ['Escolar', 'Remis']
        if (!tiposPermitidos.includes(tipo)) {
            return NextResponse.json({ error: 'Tipo de transporte no permitido' }, { status: 403 })
        }

        // Construir filtros (mismos que en el listado)
        const where: any = {
            tipo_transporte: tipo,
            is_deleted: false,
        }

        if (buscar) {
            where.OR = [
                { nro_licencia: { contains: buscar } },
                { expte: { contains: buscar } },
                {
                    habilitaciones_personas: {
                        some: {
                            OR: [
                                { persona: { nombre: { contains: buscar } } },
                                { persona: { dni: { contains: buscar } } },
                            ],
                        },
                    },
                },
                {
                    habilitaciones_vehiculos: {
                        some: {
                            vehiculo: {
                                OR: [
                                    { dominio: { contains: buscar } },
                                    { marca: { contains: buscar } },
                                ],
                            },
                        },
                    },
                },
            ]
        }

        // Obtener TODAS las habilitaciones (sin paginación)
        const habilitaciones = await prisma.habilitaciones_generales.findMany({
            where,
            orderBy: { id: 'desc' },
            include: {
                habilitaciones_personas: {
                    where: { rol: 'TITULAR' },
                    include: { persona: true },
                    take: 1,
                },
                habilitaciones_vehiculos: {
                    where: { activo: true },
                    include: { vehiculo: true },
                    take: 1,
                },
            },
        })

        // Formatear datos para Excel
        const data = habilitaciones.map((hab: any) => {
            const titular = hab.habilitaciones_personas?.[0]?.persona
            const vehiculo = hab.habilitaciones_vehiculos?.[0]?.vehiculo

            return {
                'ID': hab.id,
                'Licencia': hab.nro_licencia,
                'Expediente': hab.expte,
                'Estado': hab.estado,
                'Tipo': hab.tipo_transporte,
                'Subtipo': hab.tipo || '-',
                'Vigencia Inicio': hab.vigencia_inicio ? new Date(hab.vigencia_inicio).toLocaleDateString('es-AR') : '',
                'Vigencia Fin': hab.vigencia_fin ? new Date(hab.vigencia_fin).toLocaleDateString('es-AR') : '',
                'Titular': titular?.nombre || 'Sin asignar',
                'DNI/CUIT Titular': titular?.dni || titular?.cuit || '',
                'Teléfono': titular?.telefono || '',
                'Email': titular?.email || '',
                'Dominio': vehiculo?.dominio || 'Sin asignar',
                'Marca': vehiculo?.marca || '',
                'Modelo': vehiculo?.modelo || '',
                'Año': vehiculo?.ano || '',
                'Motor': vehiculo?.nro_motor || '',
                'Chasis': vehiculo?.nro_chasis || '',
                'Observaciones': hab.observaciones || '',
            }
        })

        // Crear libro de Excel
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(data)

        // Ajustar ancho de columnas
        const colWidths = [
            { wch: 5 },  // ID
            { wch: 10 }, // Licencia
            { wch: 15 }, // Expediente
            { wch: 12 }, // Estado
            { wch: 10 }, // Tipo
            { wch: 15 }, // Subtipo
            { wch: 12 }, // Vigencia Inicio
            { wch: 12 }, // Vigencia Fin
            { wch: 30 }, // Titular
            { wch: 15 }, // DNI
            { wch: 15 }, // Tel
            { wch: 25 }, // Email
            { wch: 10 }, // Dominio
            { wch: 15 }, // Marca
            { wch: 20 }, // Modelo
            { wch: 6 },  // Año
            { wch: 15 }, // Motor
            { wch: 15 }, // Chasis
            { wch: 30 }, // Obs
        ]
        ws['!cols'] = colWidths

        XLSX.utils.book_append_sheet(wb, ws, 'Habilitaciones')

        // Generar buffer
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

        // Retornar respuesta con archivo
        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="habilitaciones-${tipo.toLowerCase()}-${Date.now()}.xlsx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        })

    } catch (error: any) {
        console.error('Error al exportar habilitaciones:', error)
        return NextResponse.json(
            { error: 'Error al exportar', details: error.message },
            { status: 500 }
        )
    }
}
