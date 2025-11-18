import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Función para convertir imagen a base64
 */
async function imageToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = response.headers.get('content-type') || 'image/jpeg'
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    console.error('Error al convertir imagen a base64:', url, error)
    return null
  }
}

/**
 * GET /api/obleas/[id]/certificado
 * Genera y descarga el certificado de oblea en formato HTML
 * (el navegador lo convierte a PDF con html2pdf.js)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const habilitacionId = parseInt(params.id)

    console.log('🎫 Generando certificado para habilitación ID:', habilitacionId)

    if (isNaN(habilitacionId)) {
      console.error('❌ ID inválido:', params.id)
      return new NextResponse('ID de habilitación inválido', { status: 400 })
    }

    // Cargar datos de la habilitación
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacionId },
    })

    if (!habilitacion) {
      console.error('❌ Habilitación no encontrada:', habilitacionId)
      return new NextResponse('Habilitación no encontrada', { status: 404 })
    }

    console.log('✅ Habilitación encontrada:', habilitacion.nro_licencia)

    // Cargar datos de la oblea
    const oblea = await prisma.obleas.findFirst({
      where: {
        habilitacion_id: habilitacionId,
      },
      orderBy: {
        fecha_colocacion: 'desc',
      },
    })

    console.log('🏷️ Oblea encontrada:', oblea ? 'Sí' : 'No')

    // Cargar datos del titular
    const titular = await prisma.habilitaciones_personas.findFirst({
      where: {
        habilitacion_id: habilitacionId,
        rol: 'TITULAR',
      },
      include: {
        persona: true,
      },
    })

    // Cargar datos del vehículo
    const vehiculo = await prisma.habilitaciones_vehiculos.findFirst({
      where: {
        habilitacion_id: habilitacionId,
      },
      include: {
        vehiculo: true,
      },
    })

    // Convertir firmas a base64 si existen
    let firmaReceptorBase64 = null
    let firmaInspectorBase64 = null
    let fotoObleaBase64 = null

    if (oblea) {
      if (oblea.path_firma_receptor) {
        firmaReceptorBase64 = await imageToBase64(oblea.path_firma_receptor)
      }
      if (oblea.path_firma_inspector) {
        firmaInspectorBase64 = await imageToBase64(oblea.path_firma_inspector)
      }
      if (oblea.path_foto) {
        fotoObleaBase64 = await imageToBase64(oblea.path_foto)
      }
    }

    const fechaHoy = new Date().toLocaleDateString('es-AR')
    const fechaColocacion = oblea?.fecha_colocacion
      ? new Date(oblea.fecha_colocacion).toLocaleDateString('es-AR')
      : fechaHoy

    // Formatear vigencia
    let vigenciaMesAno = 'N/A'
    if (habilitacion.vigencia_fin) {
      const fecha = new Date(habilitacion.vigencia_fin)
      const meses = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ]
      vigenciaMesAno = `${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`
    }

    let vigenciaDesde = 'N/A'
    if (habilitacion.vigencia_inicio) {
      vigenciaDesde = new Date(habilitacion.vigencia_inicio).toLocaleDateString('es-AR')
    }

    // Generar HTML del certificado
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Certificado de Oblea - ${habilitacion.nro_licencia}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Teko:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Roboto', Arial, sans-serif; }
        .font-teko { font-family: 'Teko', sans-serif; }
    </style>
</head>
<body class="bg-gray-800">
    <div id="preloader" class="fixed inset-0 flex flex-col items-center justify-center z-20 transition-opacity duration-300 bg-gray-900 bg-opacity-90">
        <img src="https://www.lanus.gob.ar/logo-200.png" alt="Logo Lanús" class="h-16 mb-6">
        <div class="w-10 h-10 border-4 border-t-white border-r-white border-b-white border-l-blue-400 rounded-full animate-spin"></div>
        <p class="text-white mt-4 text-lg">Generando Certificado de Oblea...</p>
    </div>

    <div class="fixed -left-[9999px] top-0">
        <div id="pdf-content" class="bg-white w-[210mm] h-[297mm] flex flex-col text-gray-900">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.06; z-index: 0;">
                <img src="https://www.lanus.gob.ar/logo-200.png" alt="Marca de Agua" class="h-[120mm]">
            </div>

            <div class="relative z-10 flex flex-col flex-grow p-12">
                <header class="flex justify-between items-center pb-4 border-b-4 border-blue-800">
                    <img src="https://transportelanus.com.ar/logo.png" alt="Logo Lanús" class="h-24">
                    <div class="text-right">
                        <p class="text-lg font-semibold text-gray-700">MUNICIPALIDAD DE LANÚS</p>
                        <p class="text-md text-gray-500">Subsecretaria de Ordenamiento Urbano</p>
                        <p class="text-md text-gray-500">Dirección General de Movilidad y Transporte</p>
                    </div>
                </header>

                <div class="text-center my-8">
                    <h1 class="text-3xl font-bold text-blue-900 tracking-wider">CERTIFICADO DE ENTREGA DE OBLEA</h1>
                    <p class="text-xl font-medium text-gray-600 mt-2">Transporte ${habilitacion.tipo_transporte || 'N/A'}</p>
                </div>

                <main class="flex-grow space-y-6">
                    <p class="text-lg text-center leading-relaxed">
                        Por medio del presente se deja constancia de la entrega de la oblea de habilitación reglamentaria,
                        con fecha de colocación <strong>${fechaColocacion}</strong>, cuyos datos se detallan a continuación:
                    </p>

                    <div class="space-y-5 mt-6 border-t border-b border-gray-200 py-6">
                        <div class="grid grid-cols-3 gap-4 items-center">
                            <h3 class="font-bold text-blue-800 text-md col-span-1">DATOS DEL TITULAR:</h3>
                            <div class="col-span-2 grid grid-cols-2 gap-4 text-md">
                                <p><strong>Nombre:</strong> ${titular?.persona?.nombre || 'N/A'}</p>
                                <p><strong>DNI:</strong> ${titular?.persona?.dni || 'N/A'}</p>
                            </div>
                        </div>
                        <hr>
                        <div class="grid grid-cols-3 gap-4 items-center">
                            <h3 class="font-bold text-blue-800 text-md col-span-1">DATOS DEL VEHÍCULO:</h3>
                            <div class="col-span-2 grid grid-cols-2 gap-4 text-md">
                                <p><strong>Dominio:</strong> <span class="font-mono text-lg bg-gray-200 px-2 py-1 rounded">${vehiculo?.vehiculo?.dominio || 'N/A'}</span></p>
                                <div>
                                    <p><strong>Marca:</strong> ${vehiculo?.vehiculo?.marca || 'N/A'}</p>
                                    <p><strong>Modelo:</strong> ${vehiculo?.vehiculo?.modelo || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div class="grid grid-cols-3 gap-4 items-start">
                            <h3 class="font-bold text-blue-800 text-md col-span-1 pt-1">DATOS DE LA HABILITACIÓN:</h3>
                            <div class="col-span-2 grid grid-cols-2 gap-4 text-md">
                                <p><strong>N° Expediente:</strong> ${habilitacion.expte || 'N/A'}</p>
                                <p><strong>Resolución:</strong> ${habilitacion.resolucion || 'N/A'}</p>
                                <p><strong>Vigencia Desde:</strong> ${vigenciaDesde}</p>
                            </div>
                        </div>
                    </div>

                    <div class="text-center bg-blue-50 p-4 my-6 rounded-lg border-2 border-dashed border-blue-700">
                        <h3 class="text-lg font-bold text-blue-900 uppercase tracking-wider">Licencia de Habilitación N°</h3>
                        <p class="font-teko text-6xl text-blue-900 font-bold tracking-widest my-1">${habilitacion.nro_licencia || 'S/N'}</p>
                        <p class="text-gray-700 text-md">Vigencia hasta <strong>${vigenciaMesAno}</strong>.</p>
                    </div>
                </main>

                <footer class="mt-auto pt-8">
                    <div class="text-xs text-center text-gray-500 mb-6">
                        <p>La oblea deberá ser exhibida en un lugar visible del vehículo en todo momento durante la prestación del servicio. El presente certificado acredita la entrega de la misma, pero no reemplaza la documentación reglamentaria del vehículo (VTV, seguro, etc.).</p>
                    </div>
                    
                    ${fotoObleaBase64 ? `
                    <div class="mb-6 text-center">
                        <p class="text-xs text-gray-600 mb-2"><strong>Evidencia de Colocación:</strong></p>
                        <img src="${fotoObleaBase64}" alt="Foto Oblea" class="mx-auto max-h-32 rounded border-2 border-gray-300" />
                    </div>
                    ` : ''}
                    
                    <div class="grid grid-cols-2 gap-12 text-center text-md text-gray-700">
                        <div>
                            ${firmaReceptorBase64 ? `
                                <img src="${firmaReceptorBase64}" alt="Firma Receptor" class="mx-auto mb-2 max-h-16 border-b-2 border-gray-400" />
                            ` : `
                                <div class="border-b-2 border-gray-400 h-16 mb-2"></div>
                            `}
                            <p class="text-sm">Firma y Aclaración del Receptor</p>
                        </div>
                        <div>
                            ${firmaInspectorBase64 ? `
                                <img src="${firmaInspectorBase64}" alt="Firma Inspector" class="mx-auto mb-2 max-h-16 border-b-2 border-gray-400" />
                            ` : `
                                <div class="border-b-2 border-gray-400 h-16 mb-2"></div>
                            `}
                            <p class="text-sm">Firma y Sello del Agente Municipal</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    </div>

    <script>
        window.onload = function() {
            console.log('🚀 Iniciando generación de certificado...');
            
            // Verificar que html2pdf esté cargado
            if (typeof html2pdf === 'undefined') {
                console.error('❌ html2pdf no está cargado');
                document.getElementById('preloader').innerHTML = '<div class="text-center"><span class="text-red-400 text-xl font-semibold">Error: Librería de PDF no cargada.</span><br><span class="text-sm text-gray-400 mt-2">Recarga la página e intenta nuevamente.</span></div>';
                return;
            }
            
            const element = document.getElementById('pdf-content');
            const preloader = document.getElementById('preloader');
            
            if (!element) {
                console.error('❌ No se encontró el elemento #pdf-content');
                preloader.innerHTML = '<div class="text-center"><span class="text-red-400 text-xl font-semibold">Error interno.</span></div>';
                return;
            }
            
            const opt = {
                margin: 0,
                filename: 'certificado_oblea_${habilitacion.nro_licencia?.replace(/\//g, '-')}.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            console.log('📄 Generando PDF con opciones:', opt);

            html2pdf().set(opt).from(element).save().then(() => {
                console.log('✅ PDF generado exitosamente');
                preloader.innerHTML = '<div class="text-center"><span class="text-green-400 text-xl font-semibold">¡Descarga completa!</span><br><span class="text-sm text-gray-400 mt-2">Ya puedes cerrar esta ventana.</span></div>';
            }).catch((error) => {
                console.error("❌ Error al generar el PDF:", error);
                preloader.innerHTML = '<div class="text-center"><span class="text-red-400 text-xl font-semibold">Error al generar el PDF.</span><br><span class="text-sm text-gray-400 mt-2 block">Error: ' + error.message + '</span><span class="text-sm text-gray-400 mt-2">Intenta nuevamente o contacta a soporte.</span></div>';
            });
        };
    </script>
</body>
</html>
`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error al generar certificado de oblea:', error)
    return new NextResponse('Error al generar el certificado', { status: 500 })
  }
}
