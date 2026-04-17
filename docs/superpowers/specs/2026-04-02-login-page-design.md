# Login Page Design Spec
**Date:** 2026-04-02  
**Status:** Approved

## Goal
Página de login a pantalla completa con layout Split Screen. Sin navbar ni footer. Solo Google y GitHub como proveedores OAuth.

## Layout

Split horizontal 50/50 en desktop. En mobile: panel derecho ocupa toda la pantalla (panel izquierdo oculto).

### Panel izquierdo — Crimson (brand)
- Fondo: `bg-primary` (crimson)
- Blob de acento amber en esquina inferior derecha (`blur-3xl`, 30% opacity)
- **Logo + wordmark:** icono cuadrado glass + "Second Brain" en mayúsculas, `font-headline font-extrabold`
- **Headline:** "Tu segundo cerebro para YouTube" — `text-4xl font-extrabold text-white`
- **Subheadline:** descripción breve en `text-white/65`
- **3 feature bullets:** dot amber + texto `text-white/75`
  1. Búsqueda semántica en tus videos
  2. Ganchos y resúmenes para redes sociales
  3. Contexto RAG para respuestas precisas
- **Social proof footer:** 3 avatares apilados + "847 creadores ya dentro" en `text-white/55`

### Panel derecho — Cream (form)
- Fondo: `bg-background` (cream `oklch(97% 0.01 80)`)
- **Back link:** `← Volver al inicio` → href `/`, `text-on-surface-variant text-sm`
- **Heading:** "Accede a tu cuenta" + subtítulo "Elige tu proveedor para continuar"
- **Botón Google:** fondo blanco, borde `outline-variant`, icono SVG oficial Google, texto "Continuar con Google"
- **Botón GitHub:** fondo `on-surface` (negro), icono SVG oficial GitHub (blanco), texto "Continuar con GitHub" en blanco
- **Divider:** línea + "Sin contraseña necesaria"
- **Terms:** "Al continuar aceptas los Términos de Servicio y la Política de Privacidad" con links en `text-primary`

## Comportamiento

- Botones llaman Server Actions: `signInWithGoogle()` y `signInWithGithub()` desde `src/lib/auth/actions.ts`
- Si viene con `?redirectTo=/ruta` en la URL, se pasa a las actions para redirigir tras login
- Ambos botones tienen `disabled` + spinner mientras la action está en vuelo (usando `useFormStatus` o `pending` de `useTransition`)
- Si el usuario ya está autenticado, `proxy.ts` lo redirige a `/dashboard` antes de llegar a esta página

## Archivos a crear

- `src/app/login/page.tsx` — Server Component que lee `searchParams.redirectTo`
- `src/components/auth/login-form.tsx` — Client Component con los botones y estado pending

## Iconos
- Google: SVG oficial multicolor inline
- GitHub: SVG oficial del Octocat (mark) en blanco

## Responsive
- `< md`: solo panel derecho, pantalla completa, padding generoso
- `>= md`: split 50/50
