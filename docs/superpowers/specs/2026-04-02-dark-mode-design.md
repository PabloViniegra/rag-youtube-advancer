# Dark Mode — Bloomberg Charcoal

**Date:** 2026-04-02  
**Status:** Approved  
**Scope:** Integrate dark mode across all layouts with a Pill Sun·Moon toggle at top-right.

---

## 1. Goal

Add a fully integrated dark mode to the application that:
- Respects the editorial identity defined in `.impeccable.md` (Bold. Precise. Relentless.)
- Maintains the same warm-toned system in both modes — NOT neon/gaming aesthetic
- Places a consistent toggle control at the top-right of every layout
- Persists the user's preference across sessions and respects OS-level preference as default

---

## 2. Palette — Bloomberg Charcoal

The dark palette is a thermal inversion of the existing OKLCH light system. Same hue angles, same warm undertone, inverted lightness. All tokens live in `globals.css`.

### Surface scale

| Token | Light (current) | Dark (new) |
|---|---|---|
| `--color-background` | `oklch(97% 0.01 80)` Warm Cream | `oklch(12% 0.02 35)` Warm Charcoal |
| `--color-surface` | `oklch(94% 0.01 80)` | `oklch(15% 0.02 35)` |
| `--color-surface-dim` | `oklch(90% 0.01 80)` | `oklch(10% 0.02 35)` |
| `--color-surface-bright` | `oklch(98% 0.005 80)` | `oklch(22% 0.02 35)` |
| `--color-surface-container-lowest` | `oklch(92% 0.01 80)` | `oklch(11% 0.02 35)` |
| `--color-surface-container-low` | `oklch(93% 0.01 80)` | `oklch(13% 0.02 35)` |
| `--color-surface-container` | `oklch(94% 0.01 80)` | `oklch(17% 0.02 35)` |
| `--color-surface-container-high` | `oklch(95% 0.01 80)` | `oklch(19% 0.02 35)` |
| `--color-surface-container-highest` | `oklch(96% 0.01 80)` | `oklch(24% 0.02 35)` |
| `--color-surface-variant` | `oklch(92% 0.015 75)` | `oklch(20% 0.02 35)` |
| `--color-inverse-surface` | `oklch(14% 0.025 35)` | `oklch(90% 0.015 80)` |

### Typography

| Token | Light | Dark |
|---|---|---|
| `--color-on-surface` | `oklch(13% 0.025 35)` Near-black | `oklch(92% 0.02 80)` Warm Cream |
| `--color-on-surface-variant` | `oklch(44% 0.02 35)` Muted | `oklch(68% 0.02 40)` Muted Cream |

### Brand colors (adjusted for dark contrast)

| Token | Light | Dark |
|---|---|---|
| `--color-primary` | `oklch(42% 0.2 25)` Crimson | `oklch(62% 0.2 25)` Light Crimson |
| `--color-primary-dim` | `oklch(36% 0.2 25)` | `oklch(56% 0.2 25)` |
| `--color-primary-container` | `oklch(94% 0.04 25)` | `oklch(22% 0.06 25)` |
| `--color-on-primary` | `oklch(97% 0.01 80)` | `oklch(97% 0.01 80)` (unchanged) |
| `--color-secondary` | `oklch(55% 0.16 70)` Amber | `oklch(72% 0.16 70)` Bright Amber |
| `--color-tertiary` | `oklch(42% 0.06 260)` Slate | `oklch(62% 0.06 260)` Light Slate |

### Borders & errors

| Token | Light | Dark |
|---|---|---|
| `--color-outline` | `oklch(58% 0.02 35)` | `oklch(40% 0.02 35)` |
| `--color-outline-variant` | `oklch(80% 0.02 75)` | `oklch(28% 0.02 35)` |
| `--color-error` | `oklch(42% 0.22 30)` | `oklch(62% 0.22 30)` |

### Implementation in CSS

Tokens are applied via a `.dark` class on `<html>`, overriding the base `@theme` values:

```css
/* In globals.css — added AFTER the existing @theme block */
.dark {
  --color-background: oklch(12% 0.02 35);
  --color-surface: oklch(15% 0.02 35);
  /* ... all tokens listed above ... */
}
```

This is the correct pattern for Tailwind v4's CSS-first config — no `darkMode` config key needed. Tailwind's `dark:` variant switches from the default `prefers-color-scheme` media query to class-based via `@custom-variant dark (&:is(.dark, .dark *))` at the top of `globals.css`.

---

## 3. Toggle Component — Pill Sun·Moon

### Visual spec

```
[ ☀ | ☽ ]
      ↑ active state: crimson bg + cream icon
```

- Pill shape: `border-radius: full`, `bg-surface-container`
- Each side: 28×28px icon button
- Active: `bg-primary text-on-primary`
- Inactive: `text-on-surface-variant`, hover `text-on-surface`
- Transition: `200ms ease` on background and color
- No outer border (matches `.impeccable.md` "every pixel earns its place")

### Component

**File:** `src/components/ui/theme-toggle.tsx`  
**Type:** `'use client'` — requires `useTheme()` hook  
**Dependencies:** `next-themes`, `lucide-react` (already installed — uses `Sun` and `Moon` icons)

```tsx
// Pseudocode
'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  return (
    <div role="group" aria-label="Color theme">
      <button onClick={() => setTheme('light')} aria-pressed={!isDark}><Sun size={14} /></button>
      <button onClick={() => setTheme('dark')}  aria-pressed={isDark}><Moon size={14} /></button>
    </div>
  )
}
```

Uses `resolvedTheme` (not `theme`) to correctly handle `system` default.

---

## 4. ThemeProvider

**File:** `src/components/providers/theme-provider.tsx`  
Thin wrapper around `next-themes`' `ThemeProvider`:

```tsx
'use client'
export { ThemeProvider } from 'next-themes'
```

Or a re-export with project-default props (`attribute="class"`, `defaultTheme="system"`, `enableSystem`).

---

## 5. Root Layout Changes

**File:** `src/app/layout.tsx`

- Add `suppressHydrationWarning` to `<html>` (prevents next-themes hydration mismatch)
- Wrap `<body>` children with `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`

---

## 6. Toggle Placement

### Landing Navbar (`src/components/landing/navbar.tsx`)
- Position: right side of nav, **before** the CTA button
- The navbar already has a `flex` right-section — add `<ThemeToggle />` there
- Must handle both light and dark background states since nav is fixed over hero

### Dashboard Layout (`src/app/dashboard/layout.tsx`)
- **Desktop topbar** (new `DashboardTopbar` sub-component): `<ThemeToggle />` in the top-right of the main content header
- **Mobile header** (`md:hidden` strip): `<ThemeToggle />` in the right side of the mobile topbar
- The `DashboardTopbar` component also fixes the 316-line violation — extracted along with `NavItem`, `UserAvatar`, inline SVG icons into separate files:
  - `src/components/dashboard/nav-item.tsx`
  - `src/components/dashboard/user-avatar.tsx`
  - `src/components/dashboard/sidebar.tsx`
  - `src/components/dashboard/topbar.tsx`

---

## 7. Auth Error Page Fix

**File:** `src/app/auth/error/page.tsx`  
Replace raw Tailwind classes (`bg-white`, `text-gray-900`, `text-gray-500`, `bg-gray-900`) with design system tokens. Included in this work since it will look broken in dark mode otherwise.

---

## 8. Tech Stack

| Concern | Solution |
|---|---|
| SSR-safe theme toggle | `next-themes` v0.x (`attribute="class"`) |
| Persistence | `localStorage` via next-themes |
| Default | `system` (OS preference) |
| CSS strategy | `.dark {}` class override in `globals.css` |
| Tailwind dark: variant | `@custom-variant dark (&:is(.dark, .dark *))` in globals.css |
| Flash of unstyled content | `suppressHydrationWarning` + next-themes handles FOUC |

---

## 9. Files Changed

| File | Change |
|---|---|
| `package.json` | Add `next-themes` |
| `src/app/globals.css` | Add `@variant dark` + `.dark {}` token block |
| `src/app/layout.tsx` | `suppressHydrationWarning`, `ThemeProvider` |
| `src/components/providers/theme-provider.tsx` | **NEW** — next-themes re-export |
| `src/components/ui/theme-toggle.tsx` | **NEW** — Pill Sun·Moon toggle |
| `src/components/landing/navbar.tsx` | Add `ThemeToggle` |
| `src/app/dashboard/layout.tsx` | Add `ThemeToggle`, extract sub-components |
| `src/components/dashboard/sidebar.tsx` | **NEW** — extracted sidebar |
| `src/components/dashboard/topbar.tsx` | **NEW** — extracted topbar with ThemeToggle |
| `src/components/dashboard/nav-item.tsx` | **NEW** — extracted NavItem |
| `src/components/dashboard/user-avatar.tsx` | **NEW** — extracted UserAvatar |
| `src/app/auth/error/page.tsx` | Fix stale raw Tailwind tokens |

---

## 10. Out of Scope

- Dark mode variants for images/charts (no charts in current codebase)
- Per-page theme overrides
- High contrast / accessibility-specific theme variant (separate concern)
