'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  success: (title: string, message: string) => void
  error: (title: string, message: string) => void
  warning: (title: string, message: string) => void
  info: (title: string, message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

/**
 * Provider de notificaciones toast
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto-remover después de la duración especificada
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const success = (title: string, message: string) => {
    showToast({ type: 'success', title, message })
  }

  const error = (title: string, message: string) => {
    showToast({ type: 'error', title, message })
  }

  const warning = (title: string, message: string) => {
    showToast({ type: 'warning', title, message })
  }

  const info = (title: string, message: string) => {
    showToast({ type: 'info', title, message })
  }

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Container de toasts */}
      <div className="pointer-events-none fixed bottom-0 right-0 z-50 flex max-h-screen flex-col gap-3 p-4 sm:p-6">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/**
 * Hook para usar las notificaciones
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return context
}

/**
 * Componente individual de toast
 */
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const configs = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      textColor: 'text-green-900',
      Icon: CheckCircle,
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
      Icon: XCircle,
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900',
      Icon: AlertCircle,
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
      Icon: Info,
    },
  }

  const config = configs[toast.type]
  const Icon = config.Icon

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm animate-in slide-in-from-right-full overflow-hidden rounded-lg border shadow-lg ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
        <div className="flex-1 space-y-0.5">
          <h4 className={`text-sm font-semibold ${config.textColor}`}>{toast.title}</h4>
          <p className={`text-sm ${config.textColor} opacity-90`}>{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 ${config.iconColor}`}
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * Mensajes predefinidos para operaciones comunes
 */
export const toastMessages = {
  // Éxitos
  createSuccess: (entity: string) => ({
    title: '¡Creado exitosamente!',
    message: `El ${entity} se ha creado correctamente y ya está disponible en el sistema.`,
  }),
  updateSuccess: (entity: string) => ({
    title: '¡Actualizado exitosamente!',
    message: `Los cambios en ${entity} se han guardado correctamente.`,
  }),
  deleteSuccess: (entity: string) => ({
    title: '¡Eliminado exitosamente!',
    message: `El ${entity} se ha eliminado del sistema.`,
  }),
  emailSent: {
    title: '¡Email enviado!',
    message: 'El correo electrónico se ha enviado correctamente al destinatario.',
  },
  
  // Errores
  createError: (entity: string) => ({
    title: 'Error al crear',
    message: `No se pudo crear el ${entity}. Por favor, verifica los datos e intenta nuevamente.`,
  }),
  updateError: (entity: string) => ({
    title: 'Error al actualizar',
    message: `No se pudieron guardar los cambios en ${entity}. Intenta nuevamente.`,
  }),
  deleteError: (entity: string) => ({
    title: 'Error al eliminar',
    message: `No se pudo eliminar el ${entity}. Verifica que no tenga registros relacionados.`,
  }),
  networkError: {
    title: 'Error de conexión',
    message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.',
  },
  validationError: {
    title: 'Datos incompletos',
    message: 'Por favor, completa todos los campos obligatorios marcados con * antes de continuar.',
  },

  // Advertencias
  unsavedChanges: {
    title: 'Cambios sin guardar',
    message: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
  },
  duplicateEntry: (field: string) => ({
    title: 'Registro duplicado',
    message: `Ya existe un registro con ese ${field}. Por favor, verifica la información.`,
  }),

  // Info
  loading: (action: string) => ({
    title: 'Procesando...',
    message: `${action}. Por favor espera un momento.`,
  }),
  noResults: {
    title: 'Sin resultados',
    message: 'No se encontraron registros que coincidan con tu búsqueda. Intenta con otros criterios.',
  },
}
