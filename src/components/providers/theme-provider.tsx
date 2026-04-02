'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

type Theme = (typeof THEME)[keyof typeof THEME]

const RESOLVED_THEME = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

type ResolvedTheme = (typeof RESOLVED_THEME)[keyof typeof RESOLVED_THEME]

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: 'class' | 'data-theme'
  defaultTheme?: Theme
  enableSystem?: boolean
  storageKey?: string
}

const THEME_CONTEXT = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return RESOLVED_THEME.LIGHT
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? RESOLVED_THEME.DARK
    : RESOLVED_THEME.LIGHT
}

function isTheme(value: string | null): value is Theme {
  return value === THEME.LIGHT || value === THEME.DARK || value === THEME.SYSTEM
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = THEME.SYSTEM,
  enableSystem = true,
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
    RESOLVED_THEME.LIGHT,
  )

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey)
    if (isTheme(storedTheme)) {
      setThemeState(storedTheme)
      return
    }
    setThemeState(defaultTheme)
  }, [defaultTheme, storageKey])

  useEffect(() => {
    const nextResolvedTheme: ResolvedTheme =
      theme === THEME.SYSTEM
        ? enableSystem
          ? getSystemTheme()
          : RESOLVED_THEME.LIGHT
        : theme

    setResolvedTheme(nextResolvedTheme)

    const root = document.documentElement
    root.style.colorScheme = nextResolvedTheme

    if (attribute === 'class') {
      root.classList.remove(RESOLVED_THEME.LIGHT, RESOLVED_THEME.DARK)
      root.classList.add(nextResolvedTheme)
      return
    }

    root.setAttribute(attribute, nextResolvedTheme)
  }, [attribute, enableSystem, theme])

  useEffect(() => {
    if (!(theme === THEME.SYSTEM && enableSystem)) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      setResolvedTheme(getSystemTheme())
    }

    mediaQuery.addEventListener('change', onChange)
    return () => {
      mediaQuery.removeEventListener('change', onChange)
    }
  }, [enableSystem, theme])

  const contextValue = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      resolvedTheme,
      setTheme: (nextTheme: Theme) => {
        setThemeState(nextTheme)
        localStorage.setItem(storageKey, nextTheme)
      },
    }
  }, [resolvedTheme, storageKey, theme])

  return (
    <THEME_CONTEXT.Provider value={contextValue}>
      {children}
    </THEME_CONTEXT.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(THEME_CONTEXT)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
