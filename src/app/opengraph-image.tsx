import { ImageResponse } from 'next/og'

/**
 * Dynamic Open Graph image generation.
 * Served at /opengraph-image (1200×630 px).
 * Referenced automatically by Next.js App Router metadata.
 *
 * Used as fallback for all pages that don't have their own OG image.
 */
export const runtime = 'edge'

export const alt = 'YouTube Intelligence — Tu Segundo Cerebro para YouTube'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        background:
          'linear-gradient(135deg, #1a0a08 0%, #3d1008 50%, #c0392b 100%)',
        padding: '72px 80px',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative ambient blob */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'rgba(231, 76, 60, 0.25)',
          filter: 'blur(80px)',
        }}
      />

      {/* YouTube play icon mark */}
      <div
        style={{
          position: 'absolute',
          top: '64px',
          left: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <title>YouTube Intelligence logo</title>
          <path
            d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
            stroke="white"
            strokeWidth="1.5"
          />
          <path
            d="m10 8 6 4-6 4V8Z"
            fill="white"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand label */}
      <div
        style={{
          position: 'absolute',
          top: '76px',
          left: '164px',
          fontSize: '13px',
          fontWeight: 800,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        YouTube Intelligence
      </div>

      {/* Main headline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 900,
            lineHeight: 1.05,
            color: '#ffffff',
            margin: 0,
            maxWidth: '800px',
          }}
        >
          Tu Segundo Cerebro para YouTube
        </h1>
        <p
          style={{
            fontSize: '24px',
            color: 'rgba(255,255,255,0.65)',
            margin: 0,
            fontWeight: 400,
            maxWidth: '700px',
            lineHeight: 1.4,
          }}
        >
          Analiza videos con IA RAG. Genera resúmenes, hooks y insights en
          segundos.
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          {['Búsqueda semántica', 'Resúmenes IA', 'Análisis RAG'].map(
            (pill) => (
              <div
                key={pill}
                style={{
                  padding: '8px 18px',
                  borderRadius: '100px',
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                {pill}
              </div>
            ),
          )}
        </div>
      </div>
    </div>,
    { ...size },
  )
}
