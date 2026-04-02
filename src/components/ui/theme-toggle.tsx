'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — only render active state after mount
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
        onClick={() => setTheme('light')}
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
        onClick={() => setTheme('dark')}
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
