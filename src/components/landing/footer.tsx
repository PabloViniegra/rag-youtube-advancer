const FOOTER_LINKS = [
  { label: 'Términos de Uso', href: '#' },
  { label: 'Privacidad', href: '#' },
  { label: 'Twitter / X', href: '#' },
  { label: 'YouTube', href: '#' },
]

export function Footer() {
  return (
    <footer className="w-full bg-inverse-surface border-t border-inverse-on-surface/10">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-10 w-full max-w-7xl mx-auto gap-8">
        <div className="text-lg font-extrabold text-inverse-on-surface uppercase tracking-tighter font-headline">
          YouTube Intelligence
        </div>

        <div className="flex flex-wrap gap-8 items-center justify-center">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              className="font-label text-xs text-inverse-on-surface/50 hover:text-inverse-on-surface transition-colors"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="font-label text-xs text-inverse-on-surface/50">
          © {new Date().getFullYear()} YouTube Intelligence
        </div>
      </div>
    </footer>
  )
}
