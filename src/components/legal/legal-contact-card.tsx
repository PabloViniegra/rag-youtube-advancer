import { Mail } from 'lucide-react'

interface LegalContactCardProps {
  question: string
  description: string
  email: string
}

export function LegalContactCard({
  question,
  description,
  email,
}: LegalContactCardProps) {
  return (
    <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant flex items-start gap-4">
      <div className="shrink-0 size-10 bg-primary/10 rounded-xl flex items-center justify-center">
        <Mail size={18} className="text-primary" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-headline font-semibold text-on-surface mb-1">
          {question}
        </p>
        <p className="text-sm text-on-surface-variant mb-3">{description}</p>
        <a
          href={`mailto:${email}`}
          className="text-primary font-semibold text-sm hover:underline underline-offset-2 transition-colors"
        >
          {email}
        </a>
      </div>
    </div>
  )
}
