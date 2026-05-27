import { Link } from '@inertiajs/react';

const CHANNELS = [
    {
        title: 'TikTok Lives',
        badge: 'Compra en vivo',
        desc: 'Unite a nuestros lives en TikTok para ver las prendas en vivo, ofertas exclusivas y hacer tus compras.',
        detailTitle: 'Horario de los lives',
        detail: 'Lunes a sabado de 10 a 13hs y de 16 a 20hs',
        cta: 'Ir a TikTok',
        href: 'https://www.tiktok.com/',
        external: true,
        panelClass: 'bg-[linear-gradient(135deg,rgba(255,90,78,0.98),rgba(240,75,64,0.92))]',
        detailClass: 'bg-white/10 border-white/18',
        iconBg: 'bg-white/16',
        icon: (
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16.5 3c.4 1.9 1.5 3 3.5 3.5v2.7c-1.3 0-2.5-.3-3.5-.9V14a5 5 0 11-5-5c.3 0 .6 0 .9.1v2.8a2.5 2.5 0 10 1.6 2.3V3h2.5z" />
            </svg>
        ),
        detailIcon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="8" strokeWidth={1.8} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l2 2" />
            </svg>
        ),
    },
];

function ChannelCard({ channel }) {
    const content = (
        <>
            <div className="flex items-start gap-4 sm:gap-5">
                <div className={`home-media flex h-16 w-16 shrink-0 items-center justify-center ${channel.iconBg} text-white shadow-sm ring-1 ring-white/16`}>
                    {channel.icon}
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-extrabold text-white sm:text-[2rem]">{channel.title}</h3>
                        <span className="inline-flex items-center rounded-full bg-white/14 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/88">
                            {channel.badge}
                        </span>
                    </div>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-white/92">
                        {channel.desc}
                    </p>
                </div>
            </div>

            <div className={`home-surface mt-6 flex items-center gap-3 border px-5 py-4 text-white ${channel.detailClass}`}>
                <div className="home-media flex h-11 w-11 shrink-0 items-center justify-center bg-white/10">
                    {channel.detailIcon}
                </div>
                <div>
                    <p className="text-sm font-bold">{channel.detailTitle}</p>
                    <p className="mt-1 text-sm text-white/88">{channel.detail}</p>
                </div>
            </div>

            <div className="mt-6">
                <span className="home-button inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-bold text-brand-text transition-transform group-hover:translate-x-1">
                    {channel.cta}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                    </svg>
                </span>
            </div>
        </>
    );

    if (channel.external) {
        return (
            <a
                href={channel.href}
                target="_blank"
                rel="noreferrer"
                className={`home-surface group block px-5 py-6 text-white shadow-[0_24px_50px_rgba(31,31,31,0.14)] transition duration-300 hover:-translate-y-1 sm:px-6 sm:py-7 lg:px-7 ${channel.panelClass}`}
            >
                {content}
            </a>
        );
    }

    return (
        <Link
            href={channel.href}
            className={`home-surface group block px-5 py-6 text-white shadow-[0_24px_50px_rgba(31,31,31,0.14)] transition duration-300 hover:-translate-y-1 sm:px-6 sm:py-7 lg:px-7 ${channel.panelClass}`}
        >
            {content}
        </Link>
    );
}

export default function About() {
    return (
        <section id="about" className="bg-brand-bg">
            <div className="store-shell store-section">
                <div className="relative">
                    <div className="absolute -left-14 top-10 h-44 w-44 bg-brand-cta/10 blur-3xl" />
                    <div className="absolute -right-10 bottom-8 h-48 w-48 bg-brand-secondary/18 blur-3xl" />

                    <div className="relative z-10">
                        <h2 className="home-section-title">
                            SOBRE NOSOTROS
                        </h2>
                    </div>

                    <div className="relative z-10 mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,1fr)]">
                        <div className="px-1 py-2 sm:px-2">
                            <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-brand-text-muted">
                                <p>
                                    Somos Hernan y Franco, dos hermanos detras de La Tienda de los Ninos
                                </p>
                                <p>
                                    Arrancamos con un local fisico en Mariano Acosta y hoy somos una tienda virtual donde
                                    podes comprar ropa de nino hasta el talle 16, armar tus propios combos y recibir todo
                                    en cualquier parte del pais.
                                </p>
                                <p>
                                    Ademas, todos los dias mostramos prendas y novedades en nuestros lives de TikTok.
                                </p>
                            </div>

                            <div className="mt-8 max-w-[42rem]">
                                {CHANNELS.map((channel) => (
                                    <ChannelCard key={channel.title} channel={channel} />
                                ))}
                            </div>
                        </div>

                        <div className="home-media overflow-hidden">
                            <img
                                src="/images/about-imagen.png"
                                alt="Sobre nosotros"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
