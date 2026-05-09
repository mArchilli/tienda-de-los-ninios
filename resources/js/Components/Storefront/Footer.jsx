import Logo from './Logo';

// ─── Footer ───────────────────────────────────────────────────────────────────
// Pie con columnas básicas, redes sociales y copyright.

const COLUMNS = [
    {
        title: 'Tienda',
        links: [
            { label: 'Combos',      href: '#combos' },
            { label: 'Nene',        href: '#nene' },
            { label: 'Nena',        href: '#nena' },
            { label: 'Unisex',      href: '#unisex' },
            { label: 'Accesorios',  href: '#accesorios' },
            { label: 'Outlet',      href: '#outlet' },
        ],
    },
    {
        title: 'Ayuda',
        links: [
            { label: 'Envíos',           href: '#envios' },
            { label: 'Cambios y devoluciones', href: '#cambios' },
            { label: 'Medios de pago',   href: '#pagos' },
            { label: 'Preguntas frecuentes', href: '#faq' },
        ],
    },
    {
        title: 'Nosotros',
        links: [
            { label: 'Sobre Mimos',  href: '#about' },
            { label: 'Contacto',     href: '#contacto' },
            { label: 'Mayoristas',   href: '#mayoristas' },
        ],
    },
];

function SocialIcon({ label, children }) {
    return (
        <a
            href="#"
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-brand-cta transition-colors"
        >
            {children}
        </a>
    );
}

export default function Footer() {
    return (
        <footer className="bg-brand-text text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="bg-white inline-block rounded-xl px-3 py-2">
                            <Logo />
                        </div>
                        <p className="mt-4 text-sm text-white/70 max-w-sm leading-relaxed">
                            Combos y prendas pensadas para acompañar cada etapa de la infancia, con calidad y mucho cariño.
                        </p>
                        <div className="mt-5 flex gap-2">
                            <SocialIcon label="Instagram">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth={1.6} />
                                    <circle cx="12" cy="12" r="4" strokeWidth={1.6} />
                                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                                </svg>
                            </SocialIcon>
                            <SocialIcon label="Facebook">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13 22v-9h3l1-4h-4V6.5c0-1.2.4-2 2.1-2H17V1h-3c-3 0-4.5 1.6-4.5 4.5V9H7v4h2.5v9z" />
                                </svg>
                            </SocialIcon>
                            <SocialIcon label="WhatsApp">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 12a8 8 0 10-14.3 5L4 21l4.2-1.5A8 8 0 0020 12zm-8 6a6 6 0 01-3.4-1l-2.4.8.8-2.3A6 6 0 1118 12a6 6 0 01-6 6zm3-4l-1.3-.6c-.2-.1-.4 0-.5.1l-.5.5c-.1.1-.2.2-.4.1-1-.4-1.7-1.1-2.1-2-.1-.2 0-.3.1-.4l.4-.4c.1-.1.1-.3 0-.5L10.2 9c-.1-.2-.3-.3-.5-.3h-.5a1 1 0 00-.7.4 1.7 1.7 0 00-.5 1.1c-.1 1.6 1 3.2 3.4 4.4 1.7.8 2.5.8 2.9.7.4-.1 1-.5 1.1-1l.1-.6c0-.2-.1-.4-.3-.5z" />
                                </svg>
                            </SocialIcon>
                        </div>
                    </div>

                    {/* Columns */}
                    {COLUMNS.map((col) => (
                        <div key={col.title}>
                            <p className="text-sm font-bold uppercase tracking-wider text-white">{col.title}</p>
                            <ul className="mt-4 space-y-2">
                                {col.links.map((l) => (
                                    <li key={l.label}>
                                        <a href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
                                            {l.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
                    <p>© {new Date().getFullYear()} Mimos. Todos los derechos reservados.</p>
                    <p>Hecho con <span className="text-brand-cta">♡</span> en Argentina.</p>
                </div>
            </div>
        </footer>
    );
}
