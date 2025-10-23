'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface SearchBarProps {
  onSearch: (term: string) => void
  placeholder?: string
}

/**
 * Barra de búsqueda con debounce
 * - Búsqueda en tiempo real
 * - Delay de 500ms para evitar requests excesivos
 */
export function SearchBar({
  onSearch,
  placeholder = 'Buscar por licencia, expediente...',
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    onSearch(debouncedSearch)
  }, [debouncedSearch, onSearch])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="pl-10 pr-4"
      />
    </div>
  )
}
