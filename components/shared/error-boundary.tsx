'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/**
 * Error Boundary para capturar errores en componentes cliente
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <ComponenteThatMightFail />
 * </ErrorBoundary>
 * ```
 */

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log del error (en producción enviarlo a Sentry)
    console.error('Error capturado por ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Usar fallback personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback por defecto
      return (
        <Card className="mx-auto mt-8 max-w-lg p-6">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold">Algo salió mal</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {this.state.error?.message || 'Ha ocurrido un error inesperado'}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
              <details className="mt-4 w-full rounded-md bg-muted p-4 text-left text-xs">
                <summary className="cursor-pointer font-medium">Stack trace</summary>
                <pre className="mt-2 overflow-auto">{this.state.error.stack}</pre>
              </details>
            )}
            <Button onClick={this.handleReset} className="mt-6">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar nuevamente
            </Button>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}

/**
 * Componente para mostrar errores de forma consistente
 */
interface ErrorMessageProps {
  error: string | Error
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({ error, onRetry, className }: ErrorMessageProps) {
  const message = error instanceof Error ? error.message : error

  return (
    <Card className={className}>
      <div className="flex flex-col items-center p-8 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h3 className="mt-4 text-lg font-semibold">Error</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        )}
      </div>
    </Card>
  )
}

/**
 * Componente para estado vacío
 */
interface EmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Card>
      <div className="flex flex-col items-center p-12 text-center">
        {icon}
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        {action && (
          <Button onClick={action.onClick} className="mt-6">
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  )
}
