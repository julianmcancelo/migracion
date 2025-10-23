'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'

interface TourStep {
  title: string
  description: string
  target?: string // selector CSS del elemento a destacar
  image?: string
}

interface OnboardingTourProps {
  steps: TourStep[]
  onComplete: () => void
  onSkip: () => void
  autoStart?: boolean
}

/**
 * Componente de guía interactiva paso a paso
 * Ayuda a los usuarios nuevos a entender el sistema
 */
export function OnboardingTour({ 
  steps, 
  onComplete, 
  onSkip, 
  autoStart = true 
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(autoStart)

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    setIsVisible(false)
    onSkip()
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0" />

      {/* Modal de guía */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl animate-in zoom-in-95 slide-in-from-bottom-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 p-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium text-blue-600">
                    Paso {currentStep + 1} de {steps.length}
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">{step.title}</h2>
              </div>
              <button
                onClick={handleSkip}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {/* Imagen ilustrativa (si existe) */}
              {step.image && (
                <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="h-64 w-full object-cover"
                  />
                </div>
              )}

              {/* Descripción */}
              <p className="text-base leading-relaxed text-gray-700">{step.description}</p>
            </div>

            {/* Footer con navegación */}
            <div className="flex items-center justify-between border-t border-gray-200 p-6">
              {/* Indicadores de progreso */}
              <div className="flex gap-1.5">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-blue-600'
                        : index < currentStep
                        ? 'bg-blue-300'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Botones de navegación */}
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Saltar guía
                </button>

                {!isFirstStep && (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Anterior
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Finalizar
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Hook para gestionar el estado del tour
 */
export function useOnboardingTour(tourKey: string) {
  const [hasSeenTour, setHasSeenTour] = useState(true)

  useEffect(() => {
    const seen = localStorage.getItem(`tour_${tourKey}`)
    setHasSeenTour(seen === 'true')
  }, [tourKey])

  const completeTour = () => {
    localStorage.setItem(`tour_${tourKey}`, 'true')
    setHasSeenTour(true)
  }

  const resetTour = () => {
    localStorage.removeItem(`tour_${tourKey}`)
    setHasSeenTour(false)
  }

  return {
    hasSeenTour,
    completeTour,
    resetTour,
  }
}

/**
 * Pasos predefinidos para el tour principal
 */
export const mainTourSteps: TourStep[] = [
  {
    title: '¡Bienvenido al Sistema de Gestión!',
    description:
      'Este sistema te ayudará a gestionar habilitaciones, turnos e inspecciones de forma fácil y rápida. Te mostraremos las funciones principales en unos simples pasos.',
  },
  {
    title: 'Navegación Principal',
    description:
      'Usa el menú lateral para acceder a las diferentes secciones: Dashboard, Habilitaciones, Turnos, Inspecciones, Vehículos y Personas. En móvil, presiona el botón ☰ para abrir el menú.',
  },
  {
    title: 'Búsqueda Rápida',
    description:
      'Usa la barra de búsqueda en la parte superior para encontrar habilitaciones por licencia, DNI o dominio. Escribe y presiona Enter para buscar.',
  },
  {
    title: 'Crear Nuevos Registros',
    description:
      'En cada sección encontrarás un botón "+" o "Nuevo..." para crear habilitaciones, turnos, personas o vehículos. Los formularios te guiarán con ayuda contextual.',
  },
  {
    title: 'Ayuda Contextual',
    description:
      'Verás íconos de ayuda (?) junto a los campos. Pasa el mouse sobre ellos para obtener información sobre qué ingresar en cada campo.',
  },
  {
    title: '¡Todo Listo!',
    description:
      'Ya estás preparado para usar el sistema. Si necesitas ayuda, busca los íconos de información o contacta al soporte técnico. ¡Buena suerte!',
  },
]
