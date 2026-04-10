import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Términos de Uso', href: '/terms' },
  { label: 'Privacidad', href: '/privacy' },
]

export function Footer() {
  return (
    <footer className="w-full bg-inverse-surface border-t border-inverse-on-surface/10">
      <div className="flex flex-col md:flex-row justify-between items-center px-4 sm:px-6 md:px-12 py-8 md:py-10 w-full max-w-7xl mx-auto gap-6 md:gap-8">
        {/* Brand — link to home for keyboard / AT users */}
        <Link
          href="/"
          className="text-lg font-extrabold text-inverse-on-surface uppercase tracking-tighter font-headline hover:text-inverse-on-surface/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-on-surface/40 rounded"
        >
          YouTube Intelligence
        </Link>

        <nav aria-label="Pie de página">
          <ul className="flex flex-wrap gap-8 items-center justify-center list-none m-0 p-0">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  className="font-label text-xs text-inverse-on-surface/50 hover:text-inverse-on-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-on-surface/40 rounded"
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="font-label text-xs text-inverse-on-surface/50">
          © {new Date().getFullYear()} YouTube Intelligence
        </div>
      </div>
    </footer>
  )
}
