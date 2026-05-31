import Logo from './Logo';

const WHATSAPP_NUMBER = '5491172397202';
const WHATSAPP_MESSAGE = encodeURIComponent('\u00a1Hola! \u00bfQu\u00e9 tal? Tengo una consulta.');
const SOCIAL_LINKS = [
    {
        label: 'TikTok',
        href: 'https://www.tiktok.com/@latiendadelosninios',
        icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16.5 3c.4 1.9 1.5 3 3.5 3.5v2.7c-1.3 0-2.5-.3-3.5-.9V14a5 5 0 11-5-5c.3 0 .6 0 .9.1v2.8a2.5 2.5 0 10 1.6 2.3V3h2.5z" />
            </svg>
        ),
    },
    {
        label: 'WhatsApp',
        href: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`,
        icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 12a8 8 0 10-14.3 5L4 21l4.2-1.5A8 8 0 0020 12zm-8 6a6 6 0 01-3.4-1l-2.4.8.8-2.3A6 6 0 1118 12a6 6 0 01-6 6zm3-4l-1.3-.6c-.2-.1-.4 0-.5.1l-.5.5c-.1.1-.2.2-.4.1-1-.4-1.7-1.1-2.1-2-.1-.2 0-.3.1-.4l.4-.4c.1-.1.1-.3 0-.5L10.2 9c-.1-.2-.3-.3-.5-.3h-.5a1 1 0 00-.7.4 1.7 1.7 0 00-.5 1.1c-.1 1.6 1 3.2 3.4 4.4 1.7.8 2.5.8 2.9.7.4-.1 1-.5 1.1-1l.1-.6c0-.2-.1-.4-.3-.5z" />
            </svg>
        ),
    },
    {
        label: 'Instagram',
        href: 'https://www.instagram.com/latiendadelosninos/',
        icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth={1.8} />
                <circle cx="12" cy="12" r="4" strokeWidth={1.8} />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
        ),
    },
];

const COLUMNS = [
    {
        title: 'Tienda',
        links: [
            { label: 'Combos', href: '/catalogo?tipo=combos' },
            { label: 'Nene', href: '/catalogo?audiencia=nino' },
            { label: 'Bebe', href: '/catalogo?audiencia=bebe&talles=0,1,2,3,4,5,6' },
            { label: 'Nena', href: '/catalogo?audiencia=nina' },
            { label: 'Beba', href: '/catalogo?audiencia=beba&talles=0,1,2,3,4,5,6' },
            { label: 'Catalogo', href: '/catalogo' },
        ],
    },
    {
        title: 'Ayuda',
        links: [
            { label: 'Preguntas frecuentes', href: '#faq' },
            { label: 'Contacto', href: '/contacto' },
        ],
    },
    {
        title: 'Nosotros',
        links: [
            { label: 'Sobre nosotros', href: '#about' },
            { label: 'Redes sociales', href: '/contacto' },
        ],
    },
];

function SocialIcon({ href, label, children }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-cta/40 bg-brand-cta/10 text-brand-cta transition-colors hover:bg-brand-cta hover:text-white"
        >
            {children}
        </a>
    );
}

export default function Footer() {
    return (
        <footer className="border-t border-brand-cta/45 bg-white text-brand-text">
            <div className="store-shell pb-10 pt-4">
                <div className="grid grid-cols-1 gap-10 px-6 py-10 sm:px-8 lg:grid-cols-5 lg:px-10 lg:py-12">
                    <div className="lg:col-span-2">
                        <div className="inline-block rounded-2xl bg-white px-3 py-2 shadow-sm">
                            <Logo />
                        </div>
                        <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-text-muted">
                            {'Combos y prendas pensadas para acompa\u00f1ar cada etapa de la infancia, con calidad y mucho cari\u00f1o.'}
                        </p>
                        <div className="mt-6 flex gap-2">
                            {SOCIAL_LINKS.map((item) => (
                                <SocialIcon key={item.label} href={item.href} label={item.label}>
                                    {item.icon}
                                </SocialIcon>
                            ))}
                        </div>
                    </div>

                    {COLUMNS.map((column) => (
                        <div key={column.title}>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-cta">{column.title}</p>
                            <ul className="mt-5 space-y-2.5">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <a href={link.href} className="text-sm text-brand-text-muted transition-colors hover:text-brand-cta">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-brand-cta text-white">
                <div className="store-shell">
                    <div className="flex flex-col items-center justify-between gap-3 px-6 py-5 text-xs sm:flex-row sm:px-8 lg:px-10">
                        <p>{'\u00a9'} 2026 La Tienda de los Ninos. Todos los derechos reservados.</p>
                        <p>Desarrollado por <span className="text-brand-text">PAMPA LABS</span></p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
