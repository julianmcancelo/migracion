'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, X, Minimize2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Mensaje {
  id: string
  tipo: 'usuario' | 'ia'
  texto: string
  timestamp: Date
}

/**
 * Chat IA Global - Flotante en toda la aplicación
 * Puede responder sobre cualquier aspecto del sistema
 */
export default function ChatIAGlobal() {
  const [isOpen, setIsOpen] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [pregunta, setPregunta] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al agregar mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensajes])

  const enviarPregunta = async (preguntaTexto?: string) => {
    const preguntaFinal = (preguntaTexto || pregunta).trim()
    if (!preguntaFinal) return
    
    if (!preguntaTexto) {
      // Solo limpiar si viene del input
      setPregunta('')
    }

    // Agregar mensaje del usuario
    const mensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      tipo: 'usuario',
      texto: preguntaFinal,
      timestamp: new Date(),
    }

    setMensajes((prev) => [...prev, mensajeUsuario])
    setPregunta('')
    setLoading(true)

    try {
      // TODO: Crear endpoint /api/chat-ia-global
      const response = await fetch('/api/chat-ia-global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: preguntaFinal }),
      })

      const data = await response.json()

      if (data.success) {
        const mensajeIA: Mensaje = {
          id: (Date.now() + 1).toString(),
          tipo: 'ia',
          texto: data.data.respuesta,
          timestamp: new Date(),
        }
        setMensajes((prev) => [...prev, mensajeIA])
      } else {
        setMensajes((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            tipo: 'ia',
            texto: 'Lo siento, no pude procesar tu pregunta. Por favor intenta de nuevo.',
            timestamp: new Date(),
          },
        ])
      }
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          tipo: 'ia',
          texto: 'Error de conexión. Por favor intenta de nuevo.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const sugerencias = [
    '¿Cómo busco una habilitación?',
    '¿Cómo genero una oblea?',
    '¿Cómo hago un cambio de vehículo?',
    '¿Cómo programo una inspección?',
  ]

  return (
    <>
      {/* Botón Flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-4 shadow-2xl hover:bg-blue-700 transition-all hover:scale-110"
          aria-label="Abrir asistente IA"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-bold">Asistente IA</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded transition"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
            style={{ maxHeight: '400px' }}
          >
            {mensajes.length === 0 ? (
              <div className="text-center space-y-4 py-8">
                <Bot className="h-16 w-16 text-blue-300 mx-auto" />
                <div>
                  <p className="font-medium text-gray-700">¡Hola! Soy tu asistente</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Pregúntame sobre habilitaciones, turnos, inspecciones, obleas...
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Preguntas rápidas:</p>
                  {sugerencias.map((sug, index) => (
                    <button
                      key={index}
                      onClick={() => enviarPregunta(sug)}
                      className="block w-full text-left px-3 py-2 text-xs bg-white rounded-lg hover:bg-blue-50 transition border border-gray-200"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={`flex ${mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        mensaje.tipo === 'usuario'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {mensaje.tipo === 'ia' && (
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-3 w-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600">Asistente</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{mensaje.texto}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {mensaje.timestamp.toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                        <span className="text-sm text-gray-600">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                enviarPregunta()
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Escribe tu pregunta..."
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                disabled={loading}
                className="flex-1 rounded-full"
              />
              <Button
                type="submit"
                disabled={loading || !pregunta.trim()}
                className="rounded-full bg-blue-600 hover:bg-blue-700"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
