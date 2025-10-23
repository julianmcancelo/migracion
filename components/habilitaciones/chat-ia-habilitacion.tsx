'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles, Loader2, AlertCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Mensaje {
  id: string
  tipo: 'usuario' | 'ia'
  texto: string
  timestamp: Date
}

interface ChatIAHabilitacionProps {
  habilitacionId: number
  nroLicencia?: string
}

export default function ChatIAHabilitacion({
  habilitacionId,
  nroLicencia,
}: ChatIAHabilitacionProps) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [pregunta, setPregunta] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sugerencias, setSugerencias] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Cargar sugerencias al montar
  useEffect(() => {
    cargarSugerencias()
  }, [])

  // Auto-scroll al agregar mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensajes])

  const cargarSugerencias = async () => {
    try {
      const response = await fetch(`/api/habilitaciones/${habilitacionId}/consultar-ia`)
      const data = await response.json()
      if (data.success) {
        setSugerencias(data.data.sugerencias || [])
      }
    } catch (err) {
      console.error('Error al cargar sugerencias:', err)
    }
  }

  const enviarPregunta = async (textoPregunta?: string) => {
    const preguntaFinal = textoPregunta || pregunta.trim()
    
    if (!preguntaFinal) return

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
    setError(null)

    try {
      const response = await fetch(`/api/habilitaciones/${habilitacionId}/consultar-ia`, {
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
        setError(data.error || 'Error al consultar')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const usarSugerencia = (sugerencia: string) => {
    enviarPregunta(sugerencia)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Asistente IA - Habilitación
          {nroLicencia && (
            <Badge variant="outline" className="ml-2">
              {nroLicencia}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Pregunta cualquier cosa sobre esta habilitación y recibe respuestas instantáneas con IA
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Área de mensajes */}
        <div 
          className="h-[400px] w-full rounded-lg border p-4 overflow-y-auto" 
          ref={scrollRef}
        >
          {mensajes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Sparkles className="h-12 w-12 text-blue-300" />
              <div>
                <p className="text-gray-600 font-medium">
                  ¡Hola! Soy tu asistente con IA
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Pregúntame sobre el estado, vigencias, inspecciones o cualquier dato de esta
                  habilitación
                </p>
              </div>
              
              {/* Sugerencias rápidas */}
              {sugerencias.length > 0 && (
                <div className="mt-6 w-full">
                  <p className="text-xs text-gray-500 mb-3">Preguntas sugeridas:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {sugerencias.slice(0, 3).map((sug, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => usarSugerencia(sug)}
                        className="text-xs"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {sug}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {mensajes.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={`flex ${mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      mensaje.tipo === 'usuario'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {mensaje.tipo === 'ia' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Asistente IA</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{mensaje.texto}</p>
                    <p className="text-xs opacity-70 mt-1">
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
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Analizando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sugerencias (cuando ya hay mensajes) */}
        {mensajes.length > 0 && sugerencias.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <p className="text-xs text-gray-500 w-full">Sugerencias:</p>
            {sugerencias.slice(0, 4).map((sug, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => usarSugerencia(sug)}
                className="text-xs"
                disabled={loading}
              >
                {sug}
              </Button>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            enviarPregunta()
          }}
          className="flex w-full gap-2"
        >
          <Input
            placeholder="Escribe tu pregunta aquí..."
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !pregunta.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
