'use client'

import { HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react'
import { ReactNode, useState } from 'react'

/**
 * Validaciones comunes reutilizables
 */
export const validators = {
  required: (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'Este campo es obligatorio'
    }
    return null
  },

  email: (value: string) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Por favor ingrese un email válido (ejemplo@correo.com)'
    }
    return null
  },

  dni: (value: string) => {
    if (!value) return null
    const dniRegex = /^\d{7,8}$/
    if (!dniRegex.test(value)) {
      return 'El DNI debe tener 7 u 8 dígitos (sin puntos ni espacios)'
    }
    return null
  },

  telefono: (value: string) => {
    if (!value) return null
    const telefonoRegex = /^[\d\s\-+()]{8,}$/
    if (!telefonoRegex.test(value)) {
      return 'Ingrese un teléfono válido (al menos 8 dígitos)'
    }
    return null
  },

  dominio: (value: string) => {
    if (!value) return null
    const dominioRegex = /^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{3}[A-Z]{2}$/
    if (!dominioRegex.test(value.toUpperCase())) {
      return 'Formato de dominio inválido (ej: ABC123 o AB123CD)'
    }
    return null
  },

  minLength: (min: number) => (value: string) => {
    if (!value) return null
    if (value.length < min) {
      return `Debe tener al menos ${min} caracteres`
    }
    return null
  },

  maxLength: (max: number) => (value: string) => {
    if (!value) return null
    if (value.length > max) {
      return `No puede tener más de ${max} caracteres`
    }
    return null
  },
}

/**
 * Campo de formulario inteligente con validación y ayuda
 */
interface SmartFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'time' | 'textarea'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  helpText?: string
  validators?: ((value: string) => string | null)[]
  required?: boolean
  disabled?: boolean
  className?: string
  autoFocus?: boolean
}

export function SmartField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  helpText,
  validators: fieldValidators = [],
  required = false,
  disabled = false,
  className = '',
  autoFocus = false,
}: SmartFieldProps) {
  const [touched, setTouched] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  // Aplicar validaciones
  const errors = fieldValidators
    .map(validator => validator(value))
    .filter(Boolean) as string[]
  
  const error = touched && errors.length > 0 ? errors[0] : null

  // Estado del campo
  const isValid = touched && value && errors.length === 0
  const isInvalid = touched && errors.length > 0

  const InputComponent = type === 'textarea' ? 'textarea' : 'input'

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label con ayuda */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500" title="Campo obligatorio">*</span>}
          {helpText && (
            <button
              type="button"
              onMouseEnter={() => setShowHelp(true)}
              onMouseLeave={() => setShowHelp(false)}
              onClick={(e) => {
                e.preventDefault()
                setShowHelp(!showHelp)
              }}
              className="inline-flex items-center justify-center rounded-full p-0.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
              aria-label="Ayuda"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
        {isValid && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Correcto</span>
          </span>
        )}
      </div>

      {/* Tooltip de ayuda */}
      {showHelp && helpText && (
        <div className="animate-in fade-in-0 slide-in-from-top-1 rounded-lg border border-blue-200 bg-blue-50 p-2 text-xs text-blue-900">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 flex-shrink-0 text-blue-600" />
            <p className="leading-relaxed">{helpText}</p>
          </div>
        </div>
      )}

      {/* Input */}
      <InputComponent
        id={name}
        name={name}
        type={type !== 'textarea' ? type : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        rows={type === 'textarea' ? 4 : undefined}
        className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${
          isInvalid
            ? 'border-red-300 bg-red-50 pr-10 focus:border-red-500 focus:ring-red-500/20'
            : isValid
            ? 'border-green-300 bg-green-50 pr-10 focus:border-green-500 focus:ring-green-500/20'
            : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500/20'
        }`}
      />

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-start gap-1.5 text-xs text-red-600 animate-in fade-in-0 slide-in-from-top-1">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Select inteligente con ayuda
 */
interface SmartSelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function SmartSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Seleccione una opción',
  helpText,
  required = false,
  disabled = false,
  className = '',
}: SmartSelectProps) {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
        {helpText && (
          <button
            type="button"
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
            onClick={(e) => {
              e.preventDefault()
              setShowHelp(!showHelp)
            }}
            className="inline-flex items-center justify-center rounded-full p-0.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        )}
      </label>

      {/* Tooltip */}
      {showHelp && helpText && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-xs text-blue-900">
          {helpText}
        </div>
      )}

      {/* Select */}
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
