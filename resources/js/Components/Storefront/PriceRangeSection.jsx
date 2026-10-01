import { Link } from '@inertiajs/react';

const GIFT_COMBO = {
    title: 'Un regalo hecho a su medida',
    body: [
        'Armá un combo con las prendas que elijas para alguien especial.',
        'Sumá una tarjeta con tu mensaje y recibilo listo para regalar.',
    ],
    href: '/catalogo?tipo=combos',
    mobileImage: '/images/combo-emprendedor-mobile.png',
    image: '/images/combo-emprendedor.png',
};

const RAINBOW_COLORS = ['#E63954', '#D97916', '#B88900', '#46A343', '#148CC4', '#72B829'];

function RainbowTitle({ title }) {
    return title.split(/(REGALO)/i).map((part, index) => (
        /^REGALO$/i.test(part) ? (
            <span key={index} className="inline-block whitespace-nowrap" aria-hidden="true">
                {part.split('').map((letter, letterIndex) => (
                    <span key={letterIndex} style={{ color: RAINBOW_COLORS[letterIndex] }}>{letter}</span>
                ))}
            </span>
        ) : part
    ));
}

export default function PriceRangeSection({ title = 'COMBOS PARA REGALO' }) {
    return (
        <section className="bg-brand-bg">
            <div className="store-shell store-section !pt-4 lg:!pt-6">
                <div className="relative px-2 py-2 sm:px-3 lg:px-4">

                    <h2 className="home-section-title relative z-10 text-left" aria-label={title}>
                        <RainbowTitle title={title} />
                    </h2>

                    <div className="relative z-10 mt-8">
                        <Link
                            href={GIFT_COMBO.href}
                            className="group flex w-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5"
                        >
                            <div className="store-card relative aspect-[941/1672] overflow-hidden md:aspect-auto md:min-h-[440px] lg:min-h-[520px]">
                                <picture>
                                    <source media="(max-width: 767px)" srcSet={GIFT_COMBO.mobileImage} />
                                    <img
                                        src={GIFT_COMBO.image}
                                        alt="Bolsa y tarjeta de regalo de La Tienda de los Niños"
                                        className="absolute inset-0 h-full w-full object-contain object-center transition-transform duration-500 md:object-cover md:group-hover:scale-105"
                                    />
                                </picture>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/25 via-[36%] to-transparent md:hidden" />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-text/6 via-transparent to-white/3 md:hidden" />

                                <div className="relative z-10 flex h-full max-w-2xl flex-col justify-start px-5 pt-7 md:justify-center md:px-8 md:py-8 lg:px-12">
                                    <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-0">
                                        <div className="hidden h-14 w-14 shrink-0 items-center justify-center text-brand-cta md:flex">
                                            <svg className="h-11 w-11" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9h18v12H3zM2 6h20v3H2zM12 6v15M12 6C9 6 7 5 7 3.5 7 2.1 8 1.5 9.2 2c1.5.6 2.8 2.8 2.8 4Zm0 0c3 0 5-1 5-2.5 0-1.4-1-2-2.2-1.5C13.3 2.6 12 4.8 12 6Z" />
                                            </svg>
                                        </div>

                                        <p className="home-section-title max-w-xl text-left md:mt-5">
                                            {GIFT_COMBO.title}
                                        </p>
                                    </div>

                                    <div className="mt-2 max-w-xl space-y-2 text-[13px] leading-snug text-brand-text-muted sm:mt-4 sm:space-y-4 sm:text-base sm:leading-relaxed">
                                        {GIFT_COMBO.body.map((paragraph) => (
                                            <p key={paragraph}>{paragraph}</p>
                                        ))}
                                    </div>

                                    <span className="home-button mt-3 inline-flex self-start items-center gap-2 bg-brand-cta px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-md transition-colors group-hover:bg-brand-cta-dark sm:mt-6 sm:px-5 sm:text-base">
                                        Ver combos
                                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
