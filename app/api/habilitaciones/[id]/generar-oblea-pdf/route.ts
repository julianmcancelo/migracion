import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/habilitaciones/[id]/generar-oblea-pdf
 * Genera el HTML para crear el PDF de una oblea
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const habilitacionId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const obleaId = searchParams.get('oblea_id')

    if (isNaN(habilitacionId)) {
      return new NextResponse('ID de habilitación inválido', { status: 400 })
    }

    // Obtener la habilitación con toda su información
    const habilitacion = await prisma.habilitaciones_generales.findUnique({
      where: { id: habilitacionId },
      include: {
        habilitaciones_personas: {
          where: { rol: 'TITULAR' },
          include: {
            persona: true,
          },
          take: 1,
        },
        habilitaciones_vehiculos: {
          include: {
            vehiculo: true,
          },
          take: 1,
        },
      },
    })

    if (!habilitacion) {
      return new NextResponse('Habilitación no encontrada', { status: 404 })
    }

    const titular = habilitacion.habilitaciones_personas[0]?.persona
    const vehiculo = habilitacion.habilitaciones_vehiculos[0]?.vehiculo

    // Obtener información de la oblea si se especificó
    let oblea = null
    if (obleaId) {
      oblea = await prisma.oblea_historial.findUnique({
        where: { id: parseInt(obleaId) },
      })
    }

    // Generar HTML con JavaScript embebido para crear el PDF con jsPDF
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificado de Oblea - ${habilitacion.nro_licencia}</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 500px;
    }
    h1 {
      color: #667eea;
      margin-bottom: 1rem;
    }
    .info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 0.5rem;
      margin: 1.5rem 0;
      text-align: left;
    }
    .info p {
      margin: 0.5rem 0;
      color: #495057;
    }
    .info strong {
      color: #212529;
    }
    .loader {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 1rem auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .status {
      color: #28a745;
      font-weight: bold;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📄 Generando Certificado</h1>
    <div class="loader"></div>
    <div class="info">
      <p><strong>Licencia:</strong> ${habilitacion.nro_licencia}</p>
      <p><strong>Titular:</strong> ${titular?.nombre || 'N/A'}</p>
      <p><strong>DNI:</strong> ${titular?.dni || 'N/A'}</p>
      <p><strong>Vehículo:</strong> ${vehiculo?.marca || 'N/A'} ${vehiculo?.modelo || 'N/A'}</p>
      <p><strong>Dominio:</strong> ${vehiculo?.dominio || 'N/A'}</p>
      ${oblea ? `<p><strong>Fecha:</strong> ${new Date(oblea.fecha_solicitud).toLocaleDateString('es-AR')}</p>` : ''}
    </div>
    <p class="status" id="status">Preparando documento...</p>
  </div>

  <script>
    window.jsPDF = window.jspdf.jsPDF;
    
    const datosOblea = {
      habilitacion: {
        nro_licencia: "${habilitacion.nro_licencia}",
        tipo_transporte: "${habilitacion.tipo_transporte}",
        estado: "${habilitacion.estado}",
        expte: "${habilitacion.expte || 'N/A'}",
        resolucion: "${habilitacion.resolucion || 'N/A'}",
        vigencia_desde: "${habilitacion.vigencia_inicio ? new Date(habilitacion.vigencia_inicio).toLocaleDateString('es-AR') : 'N/A'}",
        vigencia_mes_ano: "${habilitacion.vigencia_fin ? new Date(habilitacion.vigencia_fin).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : 'N/A'}"
      },
      titular: {
        nombre: "${titular?.nombre || 'N/A'}",
        dni: "${titular?.dni || 'N/A'}"
      },
      vehiculo: {
        dominio: "${vehiculo?.dominio || 'N/A'}",
        marca: "${vehiculo?.marca || 'N/A'}",
        modelo: "${vehiculo?.modelo || 'N/A'}"
      },
      fecha_emision: "${oblea ? new Date(oblea.fecha_solicitud).toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR')}"
    };

    async function generarPDF() {
      const statusEl = document.getElementById('status');
      statusEl.textContent = 'Generando PDF...';

      try {
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        
        // Colores institucionales
        const azulMunicipal = [30, 64, 175];
        const naranjaOblea = [242, 113, 28];
        const grisTexto = [50, 50, 50];
        
        // HEADER
        pdf.setFillColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2]);
        pdf.rect(0, 0, 210, 35, 'F');
        
        pdf.setFillColor(255, 255, 255);
        pdf.circle(20, 17.5, 8, 'F');
        pdf.setDrawColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2]);
        pdf.setLineWidth(1);
        pdf.circle(20, 17.5, 8);
        
        pdf.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2]);
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'bold');
        pdf.text('LANUS', 20, 18, { align: 'center' });
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MUNICIPALIDAD DE LANUS', 105, 14, { align: 'center' });
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Direccion General de Movilidad y Transporte', 105, 22, { align: 'center' });
        
        pdf.setFontSize(8);
        pdf.text('Fecha: ' + datosOblea.fecha_emision, 195, 30, { align: 'right' });

        // TÍTULO
        pdf.setTextColor(azulMunicipal[0], azulMunicipal[1], azulMunicipal[2]);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CERTIFICADO DE ENTREGA DE OBLEA', 105, 48, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Transporte ' + datosOblea.habilitacion.tipo_transporte, 105, 56, { align: 'center' });

        // TABLA DE DATOS
        let yPos = 68;
        pdf.setFillColor(248, 250, 252);
        pdf.rect(15, yPos, 180, 60, 'F');
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.rect(15, yPos, 180, 60);
        
        pdf.line(15, yPos + 20, 195, yPos + 20);
        pdf.line(15, yPos + 40, 195, yPos + 40);
        
        pdf.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2]);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        
        pdf.text('TITULAR:', 20, yPos + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(datosOblea.titular.nombre, 45, yPos + 8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DNI:', 20, yPos + 15);
        pdf.setFont('helvetica', 'normal');
        pdf.text(datosOblea.titular.dni, 45, yPos + 15);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('VEHICULO:', 20, yPos + 28);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Dom: ' + datosOblea.vehiculo.dominio, 45, yPos + 28);
        pdf.text(datosOblea.vehiculo.marca + ' ' + datosOblea.vehiculo.modelo, 80, yPos + 28);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('HABILITACION:', 20, yPos + 48);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Expte: ' + datosOblea.habilitacion.expte, 45, yPos + 48);
        pdf.text('Res: ' + datosOblea.habilitacion.resolucion, 100, yPos + 48);
        pdf.text('Vigencia: ' + datosOblea.habilitacion.vigencia_desde, 20, yPos + 55);

        // LICENCIA
        yPos += 70;
        pdf.setFillColor(naranjaOblea[0], naranjaOblea[1], naranjaOblea[2]);
        pdf.roundedRect(15, yPos, 180, 32, 2, 2, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('LICENCIA DE HABILITACION', 105, yPos + 10, { align: 'center' });
        
        pdf.setFontSize(24);
        pdf.text(datosOblea.habilitacion.nro_licencia, 105, yPos + 20, { align: 'center' });
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Vigencia hasta ' + datosOblea.habilitacion.vigencia_mes_ano, 105, yPos + 27, { align: 'center' });

        // FIRMAS
        yPos += 42;
        pdf.setTextColor(grisTexto[0], grisTexto[1], grisTexto[2]);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('FIRMAS Y CONFORMIDAD', 105, yPos, { align: 'center' });
        
        yPos += 8;
        
        const firmas = [
          { x: 48, titulo: 'FIRMA DEL INTERESADO', subtitulo: '(Aclaracion y DNI)' },
          { x: 162, titulo: 'FIRMA DEL INSPECTOR', subtitulo: '(Aclaracion y Legajo)' }
        ];
        
        firmas.forEach(firma => {
          pdf.setDrawColor(150, 150, 150);
          pdf.setLineWidth(0.3);
          pdf.rect(firma.x - 32, yPos, 64, 30);
          pdf.line(firma.x - 28, yPos + 20, firma.x + 28, yPos + 20);
          
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.text(firma.titulo, firma.x, yPos + 6, { align: 'center' });
          
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.text(firma.subtitulo, firma.x, yPos + 26, { align: 'center' });
        });

        // FOOTER
        yPos += 38;
        pdf.setFillColor(255, 252, 240);
        pdf.rect(15, yPos, 180, 15, 'F');
        pdf.setDrawColor(255, 193, 7);
        pdf.setLineWidth(0.5);
        pdf.rect(15, yPos, 180, 15);
        
        pdf.setTextColor(133, 77, 14);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('IMPORTANTE:', 20, yPos + 6);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.text('La oblea debe exhibirse en lugar visible del vehiculo.', 50, yPos + 6);
        pdf.text('Documento generado electronicamente - Validez oficial', 50, yPos + 11);

        yPos += 20;
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(7);
        pdf.text('______________________________________', 105, yPos, { align: 'center' });
        pdf.text('Generado: ' + new Date().toLocaleString('es-AR') + ' | Oblea ID: ${obleaId || 'NUEVA'} | www.lanus.gob.ar/transporte', 105, yPos + 4, { align: 'center' });
        
        statusEl.textContent = '✅ Descargando PDF...';
        pdf.save('Certificado_Oblea_' + datosOblea.habilitacion.nro_licencia + '.pdf');
        
        setTimeout(() => {
          statusEl.textContent = '✅ PDF generado exitosamente. Puedes cerrar esta ventana.';
        }, 500);
        
      } catch (error) {
        console.error('Error al generar PDF:', error);
        statusEl.textContent = '❌ Error al generar PDF: ' + error.message;
        statusEl.style.color = '#dc3545';
      }
    }

    // Generar PDF automáticamente al cargar
    setTimeout(generarPDF, 1000);
  </script>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error: any) {
    console.error('Error al generar página de PDF:', error)
    return new NextResponse('Error al generar PDF: ' + error.message, { status: 500 })
  }
}
