import { useEffect, useState } from 'react'

/**
 * Hook para debounce de valores
 *
 * Útil para inputs de búsqueda que no deben hacer request
 * en cada tecla presionada.
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 500)
 *
 * useEffect(() => {
 *   // Solo se ejecuta 500ms después de que el usuario dejó de escribir
 *   fetchData(debouncedSearch)
 * }, [debouncedSearch])
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Setear un timer que actualizará el valor debounced después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpiar el timeout si el valor cambia antes del delay
    // Esto previene que se ejecute el callback si el usuario sigue escribiendo
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
