/**
 * Configuración de ítems de inspección para dos tipos de transporte DISTINTOS:
 * 
 * 1. TRANSPORTE ESCOLAR: Vehículos para traslado de estudiantes
 *    - Requisitos específicos de seguridad para menores
 *    - Identificación visual obligatoria (pintura naranja/blanca)
 *    - Equipamiento especial (puertas, salidas de emergencia, etc.)
 * 
 * 2. REMIS: Servicio de transporte de pasajeros con chofer
 *    - Vehículos tipo taxi/remis
 *    - Requisitos de seguridad para transporte público
 *    - Mampara divisoria obligatoria
 * 
 * Cada tipo tiene ítems comunes y específicos según su regulación.
 */

export interface InspectionItem {
  id: string;
  nombre: string;
  categoria: string;
  estado: 'bien' | 'regular' | 'mal' | null;
  observacion: string;
  foto: string | null; // Base64
}

type BaseInspectionItem = Omit<InspectionItem, 'estado' | 'observacion' | 'foto'>;

// --- ÍTEMS COMUNES A AMBOS TIPOS DE TRANSPORTE ---
// Estos ítems aplican tanto para Transporte Escolar como para Remis
const commonItems: BaseInspectionItem[] = [
  {
    id: 'carroceria_exterior',
    nombre: 'Estado General de la Carrocería (exterior, paragolpes, vidrios)',
    categoria: 'Carrocería y Estructura',
  },
  {
    id: 'espejos',
    nombre: 'Estado de Espejos Retrovisores (Der. / Izq.)',
    categoria: 'Seguridad Activa',
  },
  {
    id: 'luces',
    nombre: 'Estado y funcionamiento de todas las Luces (Posición, L.Corta, L. Larga, Giros, Balizas, Stop, M. Atrás)',
    categoria: 'Seguridad Activa',
  },
  {
    id: 'cubiertas',
    nombre: 'Cubiertas (Estado General banda de rodamiento y perfil. Del./Tras.)',
    categoria: 'Seguridad Activa',
  },
  {
    id: 'interior_general',
    nombre: 'Estado General del Interior (Estado y Anclaje de Butacas y asiento trasero, Tapicería y Paneles de puerta)',
    categoria: 'Interior y Confort',
  },
  {
    id: 'cinturones',
    nombre: 'Cinturones de Seguridad (en las plazas delanteras y traseras acorde a la configuración del fabricante)',
    categoria: 'Seguridad Pasiva',
  },
  {
    id: 'cabezales',
    nombre: 'Cabezales o Apoya Cabeza (en todos las plazas acorde a la cofiguración del fabricante)',
    categoria: 'Seguridad Pasiva',
  },
  {
    id: 'matafuegos',
    nombre: 'Matafuego Reglamentario (fijado en el interior del habitaculo, con carga y fecha vigente)',
    categoria: 'Equipamiento Obligatorio',
  },
  {
    id: 'kit_emergencia',
    nombre: 'Kit de Emergencias para Primeros Auxilios Completo',
    categoria: 'Equipamiento Obligatorio',
  },
];

// --- ÍTEMS EXCLUSIVOS PARA TRANSPORTE ESCOLAR ---
// Estos ítems SOLO aplican para vehículos de Transporte Escolar
// NO se evalúan en inspecciones de Remis
const escolarItems: BaseInspectionItem[] = [
  {
    id: 'puerta_der',
    nombre: 'Pta. accionada cond. para desc./ asc. (Puerta derecha)',
    categoria: 'Específico Escolar',
  },
  {
    id: 'puerta_izq',
    nombre: 'Pta. accionada cond. para desc./ asc. (Puerta izquierda)',
    categoria: 'Específico Escolar',
  },
  {
    id: 'salida_emergencia',
    nombre: 'Salida de Emer. indep. de la plataf. asc. / desc. (En Caso de Combi - L. Der. y Trasero)',
    categoria: 'Específico Escolar',
  },
  {
    id: 'ventanas',
    nombre: 'Vent. Vidrio Temp. / inastillable (Apertura 10 cm)',
    categoria: 'Específico Escolar',
  },
  {
    id: 'pisos',
    nombre: 'Pisos rec. con mat. Antideslizantes',
    categoria: 'Específico Escolar',
  },
  {
    id: 'banquetas',
    nombre: 'Dimens. de Banquetas (desde el piso 0.40 mts - ancho min 0.45mts Prof. medida horiz. 0.40 mts)',
    categoria: 'Específico Escolar',
  },
  {
    id: 'asientos_escolar',
    nombre: 'Asientos: Fijos, Acolchados, Estructu. metalicas, revestimiento (Caucho o similar)',
    categoria: 'Específico Escolar',
  },
  {
    id: 'pintura',
    nombre: 'Pintura (Carroceria baja y capot naranja Nº 1054 IRAM - carroceria alta, techo y parantes Color blanco)',
    categoria: 'Identificación Visual',
  },
  {
    id: 'leyenda_escolares',
    nombre: 'Leyenda de Escolares o Niños (Tamaño minimo : 0,20 mts)',
    categoria: 'Identificación Visual',
  },
];

// --- ÍTEMS EXCLUSIVOS PARA REMISES ---
// Estos ítems SOLO aplican para vehículos de Remis (transporte de pasajeros)
// NO se evalúan en inspecciones de Transporte Escolar
const remisItems: BaseInspectionItem[] = [
  {
    id: 'mampara_divisoria',
    nombre: 'Mampara Divisoria Transparente entre plazas delanteras y traseras',
    categoria: 'Específico Remis',
  },
];

/**
 * Crea la lista inicial de ítems según el tipo de transporte
 * 
 * @param tipoTransporte - 'Escolar' o 'Remis'
 * @returns Array de ítems de inspección con:
 *   - Ítems comunes (9 ítems para ambos tipos)
 *   - Ítems específicos de Escolar (9 ítems adicionales)
 *   - Ítems específicos de Remis (1 ítem adicional)
 */
export const createInitialItems = (tipoTransporte?: string): InspectionItem[] => {
  let specificItems: BaseInspectionItem[] = [];
  
  if (tipoTransporte === 'Escolar') {
    specificItems = escolarItems;
  } else if (tipoTransporte === 'Remis') {
    specificItems = remisItems;
  }

  return [...commonItems, ...specificItems].map((item) => ({
    ...item,
    estado: null,
    observacion: '',
    foto: null,
  }));
};

/**
 * Agrupa los ítems por categoría
 */
export const groupItemsByCategory = (
  items: InspectionItem[]
): Record<string, InspectionItem[]> => {
  return items.reduce((acc, item) => {
    const { categoria } = item;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(item);
    return acc;
  }, {} as Record<string, InspectionItem[]>);
};
