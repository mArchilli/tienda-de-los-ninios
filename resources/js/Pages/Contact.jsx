import { Head } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

const WHATSAPP_NUMBER = '5491172397202';
const WHATSAPP_MESSAGE = encodeURIComponent('\u00a1Hola! \u00bfQu\u00e9 tal? Tengo una consulta.');

const CONTACT_CHANNELS = [
    {
        title: 'WhatsApp',
        badge: 'Atencion directa',
        description: 'Escribinos para consultar stock, talles, medios de pago o el estado de tu pedido. Te respondemos de forma cercana y rapida.',
        detailTitle: 'Ideal para',
        detail: 'Resolver dudas y comprar con ayuda personalizada.',
        cta: 'Abrir WhatsApp',
        href: `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`,
        icon: (
            <svg className="h-16 w-16 sm:h-20 sm:w-20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 12a8 8 0 10-14.3 5L4 21l4.2-1.5A8 8 0 0020 12zm-8 6a6 6 0 01-3.4-1l-2.4.8.8-2.3A6 6 0 1118 12a6 6 0 01-6 6zm3-4l-1.3-.6c-.2-.1-.4 0-.5.1l-.5.5c-.1.1-.2.2-.4.1-1-.4-1.7-1.1-2.1-2-.1-.2 0-.3.1-.4l.4-.4c.1-.1.1-.3 0-.5L10.2 9c-.1-.2-.3-.3-.5-.3h-.5a1 1 0 00-.7.4 1.7 1.7 0 00-.5 1.1c-.1 1.6 1 3.2 3.4 4.4 1.7.8 2.5.8 2.9.7.4-.1 1-.5 1.1-1l.1-.6c0-.2-.1-.4-.3-.5z" />
            </svg>
        ),
    },
    {
        title: 'Instagram',
        badge: 'Novedades diarias',
        description: 'Mira ingresos, destacados y contenido pensado para ayudarte a elegir mejor. Es el lugar ideal para seguir el dia a dia de la tienda.',
        detailTitle: 'Que vas a ver',
        detail: 'Fotos, novedades y prendas recomendadas.',
        cta: 'Ir a Instagram',
        href: 'https://www.instagram.com/latiendadelosninos/',
        icon: (
            <svg className="h-16 w-16 sm:h-20 sm:w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth={1.8} />
                <circle cx="12" cy="12" r="4" strokeWidth={1.8} />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
        ),
    },
    {
        title: 'TikTok',
        badge: 'Lives y ofertas',
        description: 'Sumate a nuestros lives para ver las prendas en movimiento, descubrir lanzamientos y comprar de una forma mas dinamica.',
        detailTitle: 'Experiencia',
        detail: 'Videos, vivos y oportunidades especiales todos los dias.',
        cta: 'Ir a TikTok',
        href: 'https://www.tiktok.com/@latiendadelosninios',
        icon: (
            <svg className="h-16 w-16 sm:h-20 sm:w-20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16.5 3c.4 1.9 1.5 3 3.5 3.5v2.7c-1.3 0-2.5-.3-3.5-.9V14a5 5 0 11-5-5c.3 0 .6 0 .9.1v2.8a2.5 2.5 0 10 1.6 2.3V3h2.5z" />
            </svg>
        ),
    },
];

function ContactCard({ channel }) {
    return (
        <a
            href={channel.href}
            target="_blank"
            rel="noreferrer"
            className="home-surface group relative block min-h-[320px] overflow-hidden bg-[linear-gradient(135deg,rgba(255,90,78,0.98),rgba(240,75,64,0.92))] px-6 py-7 text-white shadow-[0_24px_50px_rgba(31,31,31,0.14)] transition duration-300 hover:-translate-y-1 sm:min-h-[360px] sm:px-7 sm:py-8"
        >
            <div className="absolute right-0 top-0 h-28 w-28 translate-x-6 -translate-y-6 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-6 translate-y-6 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[1.3rem] bg-white/10 text-white">
                        {channel.icon}
                    </div>
                    <span className="inline-flex items-center rounded-full bg-white/14 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90">
                        {channel.badge}
                    </span>
                </div>

                <div className="mt-7">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-[2.1rem]">{channel.title}</h2>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-white/92">
                        {channel.description}
                    </p>
                </div>

                <div className="home-surface mt-6 border border-white/18 bg-white/10 px-5 py-4 text-white">
                    <p className="text-sm font-bold">{channel.detailTitle}</p>
                    <p className="mt-1 text-sm text-white/88">{channel.detail}</p>
                </div>

                <div className="mt-auto pt-6">
                    <span className="home-button inline-flex items-center justify-center border border-brand-cta bg-white px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-cta shadow-sm transition-colors group-hover:bg-brand-primary-surface sm:px-8 sm:py-4 sm:text-base">
                        {channel.cta}
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                        </svg>
                    </span>
                </div>
            </div>
        </a>
    );
}

export default function Contact({ cartCount }) {
    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title="Contacto" />

            <section className="home-angular bg-brand-bg">
                <div className="store-shell store-section">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="home-section-title text-center">CONTACTO</h1>
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {CONTACT_CHANNELS.map((channel) => (
                            <ContactCard key={channel.title} channel={channel} />
                        ))}
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
