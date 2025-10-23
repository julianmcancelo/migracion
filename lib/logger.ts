/**
 * Sistema de Logging Centralizado
 *
 * Reemplaza console.log/error directo con logging estructurado
 * - Development: Logs completos en consola
 * - Production: Solo errores críticos, resto silenciado
 *
 * Uso:
 * ```typescript
 * import { logger } from '@/lib/logger'
 *
 * logger.info('Usuario autenticado', { userId: 123 })
 * logger.error('Error al crear habilitación', error)
 * logger.warn('API Key no configurada')
 * logger.debug('Query ejecutada', { query })
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
  stack?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isServer = typeof window === 'undefined'

  /**
   * Formatea una entrada de log para mejor legibilidad
   */
  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data: data || undefined,
      stack: data instanceof Error ? data.stack : undefined,
    }
  }

  /**
   * Log de debugging (solo development)
   */
  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      const log = this.formatLog('debug', message, data)
      console.debug(`🔍 [DEBUG] ${message}`, data || '')
    }
  }

  /**
   * Log informativo (solo development)
   */
  info(message: string, data?: any) {
    if (this.isDevelopment) {
      const log = this.formatLog('info', message, data)
      console.log(`ℹ️  [INFO] ${message}`, data || '')
    }
  }

  /**
   * Log de advertencia (ambos ambientes)
   */
  warn(message: string, data?: any) {
    const log = this.formatLog('warn', message, data)
    console.warn(`⚠️  [WARN] ${message}`, data || '')
  }

  /**
   * Log de error (ambos ambientes)
   * En producción, enviar a servicio de monitoring (Sentry, etc.)
   */
  error(message: string, error?: any) {
    const log = this.formatLog('error', message, error)

    console.error(`❌ [ERROR] ${message}`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    })

    // TODO: Integrar con Sentry en producción
    if (!this.isDevelopment && this.isServer) {
      // Aquí se enviaría a Sentry/LogRocket
      // Sentry.captureException(error, { extra: { message } })
    }
  }

  /**
   * Log de éxito en operaciones importantes
   */
  success(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`✅ [SUCCESS] ${message}`, data || '')
    }
  }

  /**
   * Log de performance (tiempo de ejecución)
   */
  perf(message: string, startTime: number) {
    const duration = Date.now() - startTime
    if (this.isDevelopment) {
      console.log(`⏱️  [PERF] ${message} - ${duration}ms`)
    }
  }

  /**
   * Log de API request (útil para debugging)
   */
  api(method: string, path: string, status: number, duration?: number) {
    if (this.isDevelopment) {
      const statusIcon = status < 400 ? '✅' : '❌'
      const durationText = duration ? ` (${duration}ms)` : ''
      console.log(`${statusIcon} [API] ${method} ${path} - ${status}${durationText}`)
    }
  }
}

// Singleton
export const logger = new Logger()

// Export types para TypeScript
export type { LogLevel, LogEntry }
