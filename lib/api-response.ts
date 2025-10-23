import { NextResponse } from 'next/server'
import { logger } from './logger'

/**
 * Utilidad para respuestas consistentes en API Routes
 *
 * Provee métodos estandarizados para respuestas exitosas y de error
 * con logging automático y formato consistente.
 *
 * Uso:
 * ```typescript
 * // Éxito
 * return ApiResponse.success(data, 'Operación exitosa')
 *
 * // Error
 * return ApiResponse.error('No autorizado', 401)
 *
 * // Error con detalles
 * return ApiResponse.error('Validación fallida', 400, validationErrors)
 * ```
 */

interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  timestamp: string
}

interface ErrorResponse {
  success: false
  error: string
  details?: any
  timestamp: string
}

export class ApiResponse {
  /**
   * Respuesta exitosa
   */
  static success<T>(
    data: T,
    message?: string,
    status: number = 200
  ): NextResponse<SuccessResponse<T>> {
    const response: SuccessResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response, { status })
  }

  /**
   * Respuesta de error
   * - Logs automáticos
   * - Oculta detalles sensibles en producción
   */
  static error(message: string, status: number = 500, details?: any): NextResponse<ErrorResponse> {
    // Log del error
    logger.error(message, details)

    const response: ErrorResponse = {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      // Solo mostrar detalles en development
      details: process.env.NODE_ENV === 'development' ? details : undefined,
    }

    return NextResponse.json(response, { status })
  }

  /**
   * Error de validación (400)
   */
  static validationError(details: any): NextResponse<ErrorResponse> {
    return this.error('Datos inválidos', 400, details)
  }

  /**
   * Error de autenticación (401)
   */
  static unauthorized(message: string = 'No autenticado'): NextResponse<ErrorResponse> {
    return this.error(message, 401)
  }

  /**
   * Error de permisos (403)
   */
  static forbidden(message: string = 'No tiene permisos'): NextResponse<ErrorResponse> {
    return this.error(message, 403)
  }

  /**
   * Recurso no encontrado (404)
   */
  static notFound(resource: string = 'Recurso'): NextResponse<ErrorResponse> {
    return this.error(`${resource} no encontrado`, 404)
  }

  /**
   * Error del servidor (500)
   */
  static serverError(
    message: string = 'Error del servidor',
    details?: any
  ): NextResponse<ErrorResponse> {
    return this.error(message, 500, details)
  }

  /**
   * Respuesta de creación exitosa (201)
   */
  static created<T>(data: T, message?: string): NextResponse<SuccessResponse<T>> {
    return this.success(data, message, 201)
  }

  /**
   * Respuesta sin contenido (204)
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 })
  }
}

// Tipo helper para extraer data de respuesta exitosa
export type ApiSuccessData<T> = T extends NextResponse<SuccessResponse<infer U>> ? U : never
