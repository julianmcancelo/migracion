import pdfMake from 'pdfmake/build/pdfmake';

// Configurar fuentes manualmente
const vfs = {
  'Roboto-Regular.ttf': 'data:font/ttf;base64,...', // pdfMake usa fuentes embebidas
};

// Por ahora usar las fuentes por defecto de pdfMake
if (typeof window === 'undefined') {
  // En servidor, usar fuentes básicas
  (pdfMake as any).fonts = {
    Roboto: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique'
    }
  };
}

interface DatosInspeccion {
  inspeccion: {
    id: number
    fecha: Date
    inspector: string
    nro_licencia: string
    nro_expediente?: string
    tipo_habilitacion?: string
    tipo_transporte: string | null
    resultado: string | null
    firma_inspector: string | null
    firma_contribuyente: string | null
  }
  titular: {
    nombre: string
    dni?: string
    domicilio?: string
  }
  conductor?: {
    nombre: string
    dni?: string
  }
  vehiculo: {
    dominio: string
    marca: string
    modelo: string
    ano: string
    chasis: string
    inscripcion_inicial?: string
  }
  items: Array<{
    nombre: string
    categoria?: string
    estado: string
    observacion: string
    foto_path?: string
  }>
  fotos: Array<{
    tipo: string
    path: string
  }>
}

/**
 * Genera un PDF de inspección vehicular usando pdfMake
 */
export async function generarPDFInspeccionPdfMake(datos: DatosInspeccion): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      console.log('📄 Generando PDF con pdfMake...');

      // Preparar tabla de items
      const tableBody: any[] = [
        [
          { text: 'Descripción', style: 'tableHeader' },
          { text: 'Bien', style: 'tableHeader', alignment: 'center' },
          { text: 'Regular', style: 'tableHeader', alignment: 'center' },
          { text: 'Mal', style: 'tableHeader', alignment: 'center' },
          { text: 'Observaciones', style: 'tableHeader' },
        ],
      ];

      datos.items.forEach((item) => {
        const estado = String(item.estado || '').toUpperCase();
        tableBody.push([
          { text: item.nombre.replace(/_/g, ' '), fontSize: 8 },
          { text: estado === 'BIEN' ? 'X' : '', alignment: 'center', fontSize: 8 },
          { text: estado === 'REGULAR' ? 'X' : '', alignment: 'center', fontSize: 8 },
          { text: estado === 'MAL' ? 'X' : '', alignment: 'center', fontSize: 8 },
          { text: item.observacion || '', fontSize: 7 },
        ]);
      });

      // Preparar fotos
      const fotosContent: any[] = [];
      const todasLasFotos = [...datos.fotos];
      
      // Agregar fotos de items
      datos.items.forEach(item => {
        if (item.foto_path && item.foto_path.startsWith('data:image')) {
          todasLasFotos.push({
            tipo: `Evidencia: ${item.nombre}`,
            path: item.foto_path,
          });
        }
      });

      console.log(`📸 Total de fotos: ${todasLasFotos.length}`);

      // Agregar fotos en grupos de 2 por fila
      for (let i = 0; i < todasLasFotos.length; i += 2) {
        const fila: any[] = [];
        
        for (let j = 0; j < 2 && i + j < todasLasFotos.length; j++) {
          const foto = todasLasFotos[i + j];
          if (foto.path && foto.path.startsWith('data:image')) {
            fila.push({
              stack: [
                {
                  image: foto.path,
                  width: 240,
                  height: 180,
                },
                {
                  text: foto.tipo,
                  fontSize: 9,
                  bold: true,
                  margin: [0, 5, 0, 0],
                  alignment: 'center',
                },
              ],
              margin: [0, 0, 10, 15],
            });
          }
        }
        
        if (fila.length > 0) {
          fotosContent.push({
            columns: fila,
            columnGap: 10,
          });
        }
      }

      // Definición del documento
      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        header: (currentPage: number, pageCount: number) => {
          return {
            columns: [
              {
                text: 'Municipalidad de Lanús',
                fontSize: 10,
                bold: true,
                margin: [40, 20, 0, 0],
              },
              {
                text: `Página ${currentPage} de ${pageCount}`,
                fontSize: 9,
                alignment: 'right',
                margin: [0, 20, 40, 0],
              },
            ],
          };
        },
        content: [
          // Título
          {
            text: 'CERTIFICADO DE VERIFICACIÓN VEHICULAR',
            fontSize: 16,
            bold: true,
            alignment: 'center',
            color: '#8B2332',
            margin: [0, 0, 0, 20],
          },

          // Información principal
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: `Expediente N°: ${datos.inspeccion.nro_expediente || 'S/N'}`, fontSize: 10 },
                  { text: `Tipo: ${datos.inspeccion.tipo_habilitacion || 'Inicial'}`, fontSize: 10, margin: [0, 5, 0, 0] },
                ],
              },
              {
                width: '50%',
                stack: [
                  { text: `Licencia N°: ${datos.inspeccion.nro_licencia}`, fontSize: 10, bold: true },
                  { text: `Transporte: ${datos.inspeccion.tipo_transporte || 'Escolar'}`, fontSize: 10, margin: [0, 5, 0, 0] },
                ],
              },
            ],
            margin: [0, 0, 0, 15],
          },

          // Titular
          {
            text: 'TITULAR',
            fontSize: 12,
            bold: true,
            color: '#8B2332',
            margin: [0, 0, 0, 5],
          },
          {
            text: `Nombre: ${datos.titular.nombre}`,
            fontSize: 10,
            margin: [0, 0, 0, 3],
          },
          {
            text: `DNI: ${datos.titular.dni || '---'}     Domicilio: ${datos.titular.domicilio || 'No especificado'}`,
            fontSize: 10,
            margin: [0, 0, 0, 15],
          },

          // Vehículo
          {
            text: 'VEHÍCULO',
            fontSize: 12,
            bold: true,
            color: '#8B2332',
            margin: [0, 0, 0, 5],
          },
          {
            columns: [
              { text: `Dominio: ${datos.vehiculo.dominio}`, fontSize: 10, width: '33%' },
              { text: `Marca: ${datos.vehiculo.marca}`, fontSize: 10, width: '33%' },
              { text: `Modelo: ${datos.vehiculo.modelo}`, fontSize: 10, width: '34%' },
            ],
            margin: [0, 0, 0, 15],
          },

          // Tabla de items
          {
            text: 'DETALLES Y OBSERVACIONES DEL VEHÍCULO',
            fontSize: 12,
            bold: true,
            color: '#8B2332',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 40, 40, 40, 100],
              body: tableBody,
            },
            layout: {
              fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f0f0f0' : null),
            },
            margin: [0, 0, 0, 20],
          },

          // Resultado
          {
            text: `RESULTADO: ${datos.inspeccion.resultado || 'PENDIENTE'}`,
            fontSize: 14,
            bold: true,
            alignment: 'center',
            color: datos.inspeccion.resultado === 'APROBADO' ? '#4CAF50' : datos.inspeccion.resultado === 'RECHAZADO' ? '#F44336' : '#FF9800',
            margin: [0, 0, 0, 20],
          },

          // Firmas
          {
            text: 'FIRMAS DIGITALES',
            fontSize: 12,
            bold: true,
            color: '#8B2332',
            margin: [0, 0, 0, 10],
          },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'INSPECTOR', fontSize: 10, bold: true, alignment: 'center' },
                  datos.inspeccion.firma_inspector && datos.inspeccion.firma_inspector.startsWith('data:image')
                    ? { image: datos.inspeccion.firma_inspector, width: 150, height: 50, alignment: 'center', margin: [0, 10, 0, 10] }
                    : { text: '(Firma digital registrada)', fontSize: 8, italics: true, alignment: 'center', margin: [0, 20, 0, 20] },
                  { text: datos.inspeccion.inspector, fontSize: 9, alignment: 'center' },
                  { text: 'Inspector Municipal', fontSize: 8, color: '#666', alignment: 'center' },
                ],
              },
              {
                width: '50%',
                stack: [
                  { text: 'CONTRIBUYENTE', fontSize: 10, bold: true, alignment: 'center' },
                  datos.inspeccion.firma_contribuyente && datos.inspeccion.firma_contribuyente.startsWith('data:image')
                    ? { image: datos.inspeccion.firma_contribuyente, width: 150, height: 50, alignment: 'center', margin: [0, 10, 0, 10] }
                    : { text: '(Firma no registrada)', fontSize: 8, italics: true, alignment: 'center', margin: [0, 20, 0, 20] },
                  { text: datos.titular.nombre, fontSize: 9, alignment: 'center' },
                  { text: 'Titular del Vehículo', fontSize: 8, color: '#666', alignment: 'center' },
                ],
              },
            ],
            margin: [0, 0, 0, 30],
          },

          // Fotos (si hay)
          ...(fotosContent.length > 0
            ? [
                { text: '', pageBreak: 'before' },
                {
                  text: 'EVIDENCIA FOTOGRÁFICA',
                  fontSize: 14,
                  bold: true,
                  color: '#8B2332',
                  margin: [0, 0, 0, 20],
                },
                ...fotosContent,
              ]
            : []),
        ],
        styles: {
          tableHeader: {
            bold: true,
            fontSize: 9,
            color: 'black',
            fillColor: '#f0f0f0',
          },
        },
        defaultStyle: {
          font: 'Roboto',
        },
      };

      // Generar PDF
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      
      pdfDocGenerator.getBuffer((buffer: Buffer) => {
        console.log('✅ PDF generado con pdfMake');
        resolve(buffer);
      });
    } catch (error) {
      console.error('❌ Error al generar PDF con pdfMake:', error);
      reject(error);
    }
  });
}
