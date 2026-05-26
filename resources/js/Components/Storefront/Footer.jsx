import Logo from './Logo';

const COLUMNS = [
    {
        title: 'Tienda',
        links: [
            { label: 'Combos', href: '#combos' },
            { label: 'Nene', href: '#nene' },
            { label: 'Nena', href: '#nena' },
            { label: 'Unisex', href: '#unisex' },
            { label: 'Accesorios', href: '#accesorios' },
            { label: 'Outlet', href: '#outlet' },
        ],
    },
    {
        title: 'Ayuda',
        links: [
            { label: 'Env\u00edos', href: '#envios' },
            { label: 'Cambios y devoluciones', href: '#cambios' },
            { label: 'Medios de pago', href: '#pagos' },
            { label: 'Preguntas frecuentes', href: '#faq' },
        ],
    },
    {
        title: 'Nosotros',
        links: [
            { label: 'Sobre Mimos', href: '#about' },
            { label: 'Contacto', href: '#contacto' },
            { label: 'Mayoristas', href: '#mayoristas' },
        ],
    },
];

function SocialIcon({ label, children }) {
    return (
        <a
            href="#"
            aria-label={label}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/10 text-white transition-colors hover:bg-brand-cta"
        >
            {children}
        </a>
    );
}

export default function Footer() {
    return (
        <footer className="bg-brand-text text-white">
            <div className="store-shell pb-10 pt-4">
                <div className="grid grid-cols-1 gap-10 px-6 py-10 sm:px-8 lg:grid-cols-5 lg:px-10 lg:py-12">
                    <div className="lg:col-span-2">
                        <div className="inline-block rounded-2xl bg-white px-3 py-2 shadow-sm">
                            <Logo />
                        </div>
                        <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/72">
                            {'Combos y prendas pensadas para acompa\u00f1ar cada etapa de la infancia, con calidad y mucho cari\u00f1o.'}
                        </p>
                        <div className="mt-6 flex gap-2">
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

                    {COLUMNS.map((column) => (
                        <div key={column.title}>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white">{column.title}</p>
                            <ul className="mt-5 space-y-2.5">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <a href={link.href} className="text-sm text-white/72 transition-colors hover:text-white">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-5 text-xs text-white/60 sm:flex-row sm:px-8 lg:px-10">
                    <p>{'\u00a9'} 2026 La Tienda de los Ninos. Todos los derechos reservados.</p>
                    <p>Desarrollado por <span className="text-brand-cta">PAMPA LABS</span></p>
                </div>
            </div>
        </footer>
    );
}
