interface BrainEmptyIllustrationProps {
  className?: string
}

export function BrainEmptyIllustration({
  className,
}: BrainEmptyIllustrationProps) {
  return (
    <svg
      width="80"
      height="60"
      viewBox="0 0 80 60"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Brain outline — simplified left lobe */}
      <path
        d="M18 38 C10 36 6 28 8 20 C10 13 17 10 22 13 C22 8 28 5 34 8 C36 4 44 4 46 8 C52 5 58 8 58 14 C63 12 70 17 68 25 C70 32 64 38 58 38"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base / jaw line */}
      <path
        d="M18 38 C22 44 30 46 40 46 C50 46 58 44 58 38"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Dashed center dividing line */}
      <line
        x1="40"
        y1="9"
        x2="40"
        y2="45"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />
      {/* Node — top left */}
      <circle cx="25" cy="18" r="2.5" fill="currentColor" opacity="0.5" />
      {/* Node — top right */}
      <circle cx="55" cy="20" r="2.5" fill="currentColor" opacity="0.5" />
      {/* Node — mid left */}
      <circle cx="22" cy="30" r="2" fill="currentColor" opacity="0.4" />
      {/* Node — mid right */}
      <circle cx="57" cy="30" r="2" fill="currentColor" opacity="0.4" />
      {/* Center × mark */}
      <line
        x1="37"
        y1="24"
        x2="43"
        y2="30"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="43"
        y1="24"
        x2="37"
        y2="30"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
