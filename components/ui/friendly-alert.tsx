'use client'

import { AlertCircle, CheckCircle, Info, XCircle, Loader2 } from 'lucide-react'
import { ReactNode } from 'react'

interface FriendlyAlertProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title: string
  message: string
  actions?: ReactNode
  onClose?: () => void
}

/**
 * Alerta amigable con iconos y colores claros
 * Perfecta para mostrar estados del sistema de forma clara
 */
export function FriendlyAlert({ type, title, message, actions, onClose }: FriendlyAlertProps) {
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
    loading: {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-600',
      textColor: 'text-gray-900',
      Icon: Loader2,
    },
  }

  const config = configs[type]
  const Icon = config.Icon

  return (
    <div
      className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor} animate-in fade-in-0 slide-in-from-top-2`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`h-5 w-5 flex-shrink-0 ${config.iconColor} ${
            type === 'loading' ? 'animate-spin' : ''
          }`}
        />
        <div className="flex-1 space-y-1">
          <h3 className={`text-sm font-semibold ${config.textColor}`}>{title}</h3>
          <p className={`text-sm ${config.textColor} opacity-90`}>{message}</p>
          {actions && <div className="mt-3">{actions}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 ${config.iconColor}`}
            aria-label="Cerrar"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Confirmación amigable (reemplaza window.confirm)
 */
interface FriendlyConfirmProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function FriendlyConfirm({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
}: FriendlyConfirmProps) {
  if (!isOpen) return null

  const typeColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in-0">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-in zoom-in-95">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${typeColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Estado de carga amigable
 */
interface LoadingStateProps {
  message?: string
  submessage?: string
}

export function LoadingState({ message = 'Cargando...', submessage }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="mt-4 text-lg font-medium text-gray-900">{message}</p>
      {submessage && <p className="mt-1 text-sm text-gray-600">{submessage}</p>}
    </div>
  )
}

/**
 * Estado vacío amigable
 */
interface EmptyStateProps {
  icon: ReactNode
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-gray-300">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
