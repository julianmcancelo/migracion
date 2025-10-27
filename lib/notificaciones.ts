import { prisma } from '@/lib/db'

interface CrearNotificacionParams {
  usuarioId: number
  tipo: string
  titulo: string
  mensaje: string
  icono?: string
  url?: string | null
  metadata?: any
}

/**
 * Crear una notificación para un usuario
 */
export async function crearNotificacion({
  usuarioId,
  tipo,
  titulo,
  mensaje,
  icono = '🔔',
  url = null,
  metadata = null,
}: CrearNotificacionParams): Promise<number> {
  try {
    const notificacion = await prisma.notificaciones.create({
      data: {
        usuario: {
          connect: { id: usuarioId },
        },
        tipo,
        titulo,
        mensaje,
        icono,
        url,
        metadata: metadata || undefined,
        leida: false,
      },
    })

    return notificacion.id
  } catch (error) {
    console.error('Error al crear notificación:', error)
    throw error
  }
}

/**
 * Notificar a todos los administradores
 */
export async function notificarAdmins({
  tipo,
  titulo,
  mensaje,
  icono = '🔔',
  url = null,
  metadata = null,
}: Omit<CrearNotificacionParams, 'usuarioId'>): Promise<number> {
  try {
    // Obtener todos los usuarios admin activos
    const admins = await prisma.admin.findMany({
      where: {
        rol: 'admin',
      },
      select: {
        id: true,
      },
    })

    if (admins.length === 0) {
      console.warn('No hay administradores activos para notificar')
      return 0
    }

    // Crear notificación para cada admin
    const promises = admins.map((admin) =>
      crearNotificacion({
        usuarioId: admin.id,
        tipo,
        titulo,
        mensaje,
        icono,
        url,
        metadata,
      })
    )

    await Promise.all(promises)
    return admins.length
  } catch (error) {
    console.error('Error al notificar admins:', error)
    throw error
  }
}

/**
 * Crear notificación de nuevo contacto interesado
 */
export async function notificarNuevoContacto(
  email: string,
  origen: string
): Promise<void> {
  try {
    await notificarAdmins({
      tipo: 'contacto_nuevo',
      titulo: 'Nuevo contacto interesado',
      mensaje: `${email} solicitó información desde ${origen}`,
      icono: '📧',
      url: '/dashboard?seccion=contactos',
      metadata: {
        email,
        origen,
      },
    })
  } catch (error) {
    console.error('Error al notificar nuevo contacto:', error)
    // No lanzar error para no bloquear el flujo principal
  }
}
