'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      expand={true}
      richColors
      toastOptions={{
        style: {
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        },
        className: 'toast-notification',
      }}
    />
  )
}
