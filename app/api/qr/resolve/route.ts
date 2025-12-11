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
        const { t, id } = data;

        if (!t || !id) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        let redirectUrl = '/inspector-movil';

        if (t === 'o') {
            // Oblea
            const oblea = await prisma.obleas.findUnique({
                where: { id: Number(id) },
                select: { habilitacion_id: true }
            });
            if (oblea) {
                redirectUrl = `/inspector-movil/obleas/colocar?id=${oblea.habilitacion_id}`;
            } else {
                return NextResponse.json({ error: 'Oblea no encontrada' }, { status: 404 });
            }
        } else if (t === 'i') {
            // Inspeccion
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
        } else {
            return NextResponse.json({ error: 'Tipo desconocido' }, { status: 400 });
        }

        return NextResponse.json({ redirectUrl });

    } catch (error) {
        console.error('Error resolviendo QR:', error);
        return NextResponse.json({ error: 'Error procesando datos' }, { status: 500 });
    }
}
