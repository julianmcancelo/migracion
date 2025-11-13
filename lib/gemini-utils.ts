import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Utilidades para manejar Gemini API con rate limiting y retry logic
 */

interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
}

/**
 * Sleep helper
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Ejecuta una llamada a Gemini con retry automático en caso de rate limit
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000 } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // Si es error 429 (rate limit), intentar de nuevo
      if (error.status === 429 && attempt < maxRetries) {
        // Calcular delay con exponential backoff
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay)

        console.log(
          `[Gemini] Rate limit alcanzado. Reintentando en ${delay}ms (intento ${attempt + 1}/${maxRetries})...`
        )

        await sleep(delay)
        continue
      }

      // Si no es 429 o ya no hay más reintentos, lanzar el error
      throw error
    }
  }

  throw lastError
}

/**
 * Obtiene el cliente de Gemini configurado
 */
export function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no está configurada')
  }

  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

/**
 * Obtiene el modelo recomendado para OCR (mejor cuota)
 */
export function getGeminiVisionModel() {
  const genAI = getGeminiClient()
  // gemini-1.5-flash tiene mejor cuota gratuita que gemini-2.0-flash-exp
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

/**
 * Obtiene el modelo para chat (mejor cuota)
 */
export function getGeminiChatModel() {
  const genAI = getGeminiClient()
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

/**
 * Maneja errores de Gemini y los convierte en mensajes amigables
 */
export function handleGeminiError(error: any): {
  message: string
  userMessage: string
  shouldRetry: boolean
  retryAfter?: number
} {
  // Error 429 - Rate Limit
  if (error.status === 429) {
    return {
      message: 'Límite de uso de IA alcanzado',
      userMessage:
        'Servicio temporalmente no disponible. Por favor, intente nuevamente en unos segundos.',
      shouldRetry: true,
      retryAfter: 2000,
    }
  }

  // Error 400 - Bad Request
  if (error.status === 400) {
    return {
      message: 'Solicitud inválida a Gemini',
      userMessage:
        'No se pudo procesar el archivo. Verifique que sea una imagen clara y legible.',
      shouldRetry: false,
    }
  }

  // Error 401/403 - Auth
  if (error.status === 401 || error.status === 403) {
    return {
      message: 'API Key de Gemini inválida o sin permisos',
      userMessage: 'Servicio de IA no disponible. Contacte al administrador.',
      shouldRetry: false,
    }
  }

  // Error 500 - Server Error
  if (error.status >= 500) {
    return {
      message: 'Error del servidor de Gemini',
      userMessage:
        'Servicio temporalmente no disponible. Por favor, intente más tarde.',
      shouldRetry: true,
      retryAfter: 5000,
    }
  }

  // Error genérico
  return {
    message: error.message || 'Error desconocido',
    userMessage: 'Error al procesar con IA. Por favor, intente nuevamente.',
    shouldRetry: false,
  }
}

/**
 * Extrae JSON de la respuesta de Gemini (que a veces incluye texto adicional)
 */
export function extractJSON(text: string): any {
  try {
    // Intentar parsear directamente
    return JSON.parse(text)
  } catch {
    // Buscar JSON entre marcadores de código
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1])
    }

    // Buscar JSON en el texto
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error('No se encontró JSON válido en la respuesta')
  }
}

/**
 * Límites de la API gratuita de Gemini
 */
export const GEMINI_FREE_LIMITS = {
  'gemini-1.5-flash': {
    requestsPerMinute: 15,
    requestsPerDay: 1500,
    tokensPerMinute: 1000000,
  },
  'gemini-1.5-pro': {
    requestsPerMinute: 2,
    requestsPerDay: 50,
    tokensPerMinute: 32000,
  },
  'gemini-2.0-flash-exp': {
    requestsPerMinute: 10, // Experimental, límites más bajos
    requestsPerDay: 1000,
    tokensPerMinute: 500000,
  },
}
