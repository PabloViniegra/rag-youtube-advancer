interface TipContent {
  label: string
  message: string
}

interface ContextualTipProps {
  videoCount: number
}

function getTip(videoCount: number): TipContent | null {
  if (videoCount === 0) return null

  if (videoCount < 3) {
    const remaining = 3 - videoCount
    return {
      label: 'Siguiente paso',
      message: `Indexa ${remaining} video${remaining === 1 ? '' : 's'} más para empezar a hacer preguntas a tu cerebro.`,
    }
  }

  if (videoCount < 8) {
    return {
      label: 'Prueba esto',
      message:
        'Tienes contexto suficiente — pregunta "¿qué técnicas de retención mencionan mis videos?"',
    }
  }

  if (videoCount < 15) {
    return {
      label: 'Tu cerebro crece',
      message:
        'Con varios videos indexados, prueba comparar perspectivas entre diferentes creadores.',
    }
  }

  return {
    label: 'Cerebro maduro',
    message:
      'Genera un hook para tu próximo video basado en lo que mejor funciona en tu biblioteca.',
  }
}

export function ContextualTip({ videoCount }: ContextualTipProps) {
  const tip = getTip(videoCount)

  if (!tip) return null

  return (
    <aside
      aria-label="Sugerencia contextual"
      className="rounded-lg border border-secondary-fixed-dim bg-secondary-container px-4 py-3"
    >
      <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
        {tip.label}
      </p>
      <p className="font-body text-sm leading-relaxed text-on-secondary-container">
        {tip.message}
      </p>
    </aside>
  )
}
