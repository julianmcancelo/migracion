'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Componente de paginación
 * - Navegación entre páginas
 * - Muestra rango de páginas
 * - Botones de anterior/siguiente
 */
export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const range = 2 // Páginas antes y después de la actual

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - range && i <= currentPage + range)) {
        pages.push(i)
      } else if (i === currentPage - range - 1 || i === currentPage + range + 1) {
        pages.push('...')
      }
    }

    return pages
  }

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 pt-4 sm:px-0">
      {/* Botón Anterior */}
      <div className="flex w-0 flex-1">
        <Button
          variant="ghost"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Anterior
        </Button>
      </div>

      {/* Números de página */}
      <div className="hidden gap-2 md:flex">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-500">
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <Button
              key={pageNum}
              variant={isActive ? 'default' : 'ghost'}
              onClick={() => onPageChange(pageNum)}
              className="min-w-[40px]"
            >
              {pageNum}
            </Button>
          )
        })}
      </div>

      {/* Información móvil */}
      <div className="md:hidden">
        <span className="text-sm text-gray-700">
          Página {currentPage} de {totalPages}
        </span>
      </div>

      {/* Botón Siguiente */}
      <div className="flex w-0 flex-1 justify-end">
        <Button
          variant="ghost"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-2"
        >
          Siguiente
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  )
}
