import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dataParam = searchParams.get('data');

    if (!dataParam) {
        return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    try {
        const data = JSON.parse(decodeURIComponent(dataParam));
        // t: tipo (o=oblea, i=inspeccion), id: id_oblea/inspeccion, h: habilitacion_id (opcional/fallback)
        const { t, id, h } = data;

        if (!t || (!id && !h)) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        let redirectUrl = '/inspector-movil';

        if (t === 'o') {
            // Oblea
            // Si tenemos habilitacion_id directo (h), lo usamos
            if (h) {
                redirectUrl = `/inspector-movil/obleas/colocar?id=${h}`;
            }
            // Si no, intentamos buscar por ID de oblea
            else if (id) {
                const oblea = await prisma.obleas.findUnique({
                    where: { id: Number(id) },
                    select: { habilitacion_id: true }
                });
                if (oblea) {
                    redirectUrl = `/inspector-movil/obleas/colocar?id=${oblea.habilitacion_id}`;
                } else {
                    return NextResponse.json({ error: 'Oblea no encontrada' }, { status: 404 });
                }
            }
        } else if (t === 'i') {
            // Inspeccion
            if (id) {
                const inspeccion = await prisma.inspecciones.findUnique({
                    where: { id: Number(id) },
                    select: { habilitacion_id: true }
                });
                if (inspeccion) {
                    // Redirigir a verificación (detalle)
                    redirectUrl = `/inspector-movil/verificacion?id=${inspeccion.habilitacion_id}`;
                } else {
                    return NextResponse.json({ error: 'Inspección no encontrada' }, { status: 404 });
                }
            } else if (h) {
                // Fallback si solo tenemos habilitacion_id para inspeccion (raro, pero posible)
                redirectUrl = `/inspector-movil/verificacion?id=${h}`;
            }
        } else {
            return NextResponse.json({ error: 'Tipo desconocido' }, { status: 400 });
        }

        return NextResponse.json({ redirectUrl });

    } catch (error) {
        console.error('Error resolviendo QR:', error);
        return NextResponse.json({ error: 'Error procesando datos' }, { status: 500 });
    }
}
