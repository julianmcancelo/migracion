import { useState } from 'react'

export interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const toast = ({ title, description, variant }: Toast) => {
    // Por ahora usa alert, luego se puede mejorar con un toast component
    if (variant === 'destructive') {
      alert(`❌ ${title}\n${description || ''}`)
    } else {
      alert(`✅ ${title}\n${description || ''}`)
    }
  }

  return { toast }
}
