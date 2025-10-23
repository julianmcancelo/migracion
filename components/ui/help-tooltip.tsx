'use client'

import { HelpCircle } from 'lucide-react'
import { useState } from 'react'

interface HelpTooltipProps {
  content: string
  title?: string
  className?: string
}

/**
 * Tooltip de ayuda simple y visual
 * Muestra información útil al hacer hover o click
 */
export function HelpTooltip({ content, title, className = '' }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full p-0.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
        aria-label="Ayuda"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {/* Tooltip */}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 animate-in fade-in-0 zoom-in-95">
          <div className="relative rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
            {/* Arrow */}
            <div className="absolute left-1/2 top-full -translate-x-1/2">
              <div className="border-4 border-transparent border-t-white"></div>
            </div>
            
            {/* Content */}
            <div className="max-w-xs space-y-1">
              {title && (
                <div className="text-sm font-semibold text-gray-900">{title}</div>
              )}
              <div className="text-xs text-gray-600 leading-relaxed">{content}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Input con ayuda integrada
 */
interface InputWithHelpProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  helpText: string
  error?: string
}

export function InputWithHelp({ 
  label, 
  helpText, 
  error,
  className = '',
  ...props 
}: InputWithHelpProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {label}
        <HelpTooltip content={helpText} />
      </label>
      <input
        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 bg-white hover:border-gray-400'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <span className="inline-block h-1 w-1 rounded-full bg-red-600"></span>
          {error}
        </p>
      )}
    </div>
  )
}
