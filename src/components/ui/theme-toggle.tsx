'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'

function handleThemeToggle(
  resolvedTheme: 'dark' | 'light',
  setTheme: (theme: 'dark' | 'light') => void,
) {
  const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
  if (!document.startViewTransition) {
    setTheme(newTheme)
    return
  }

  document.startViewTransition(() => {
    setTheme(newTheme)
  })
}

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <fieldset
      aria-label="Tema de color"
      className="flex items-center rounded-full bg-surface-container p-0.5 gap-0.5 border-0 m-0"
    >
      <button
        type="button"
        onClick={() => handleThemeToggle(resolvedTheme, setTheme)}
        aria-pressed={mounted ? !isDark : undefined}
        aria-label="Modo claro"
        title="Modo claro"
        className={cn(
          'flex size-7 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          mounted && !isDark
            ? 'bg-primary text-on-primary shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface',
        )}
      >
        <Sun size={13} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={() => handleThemeToggle(resolvedTheme, setTheme)}
        aria-pressed={mounted ? isDark : undefined}
        aria-label="Modo oscuro"
        title="Modo oscuro"
        className={cn(
          'flex size-7 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          mounted && isDark
            ? 'bg-primary text-on-primary shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface',
        )}
      >
        <Moon size={13} strokeWidth={2.5} />
      </button>
    </fieldset>
  )
}
