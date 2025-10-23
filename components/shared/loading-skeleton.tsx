import { cn } from '@/lib/utils'

/**
 * Skeleton loaders para diferentes contextos
 * Mejora la UX mostrando placeholders mientras carga contenido
 */

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />
}

/**
 * Skeleton para tablas
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 border-b pb-3">
        <Skeleton className="h-4 w-[15%]" />
        <Skeleton className="h-4 w-[25%]" />
        <Skeleton className="h-4 w-[20%]" />
        <Skeleton className="h-4 w-[15%]" />
        <Skeleton className="h-4 w-[15%]" />
        <Skeleton className="h-4 w-[10%]" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3">
          <Skeleton className="h-10 w-[15%]" />
          <Skeleton className="h-10 w-[25%]" />
          <Skeleton className="h-10 w-[20%]" />
          <Skeleton className="h-10 w-[15%]" />
          <Skeleton className="h-10 w-[15%]" />
          <Skeleton className="h-10 w-[10%]" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para cards
 */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="space-y-3">
        <Skeleton className="h-5 w-[60%]" />
        <Skeleton className="h-4 w-[40%]" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[90%]" />
          <Skeleton className="h-3 w-[80%]" />
        </div>
        <div className="flex gap-2 pt-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton para grid de cards
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton para estadísticas (dashboard)
 */
export function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="mt-4 h-8 w-[40%]" />
          <Skeleton className="mt-2 h-3 w-[80%]" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para formulario
 */
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-[30%]" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

/**
 * Skeleton para página completa
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[40%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>

      {/* Stats */}
      <StatsSkeleton />

      {/* Content */}
      <div className="rounded-lg border bg-card p-6">
        <TableSkeleton />
      </div>
    </div>
  )
}
