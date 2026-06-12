import { Link } from '@inertiajs/react';

const ENTREPRENEUR_COMBO = {
    title: 'Pensando para que comiences',
    body: [
        '¿Sos emprendedor? ¿Revendes? Nosotros te ayudamos con combos listos para que puedas dar tus primeros pasos de forma simple.',
        'Pensamos estos combos para que te animes a comenzar, con prendas seleccionadas especialmente para que puedas venderlas y obtener un buen margen de ganancia.',
        'Si estás buscando una opción práctica, rentable y lista para empezar, este es el combo ideal para vos.',
    ],
    href: '/catalogo?precio_min=100000',
    mobileImage: '/images/combo-emprendedor-mobile.png',
    image: '/images/combo-emprendedor.png',
};

export default function PriceRangeSection() {
    return (
        <section className="bg-brand-bg">
            <div className="store-shell store-section !pt-4 lg:!pt-6">
                <div className="relative px-2 py-2 sm:px-3 lg:px-4">

                    <h2 className="home-section-title relative z-10 text-left">
                        COMBOS PARA EMPRENDEDORES
                    </h2>

                    <div className="relative z-10 mt-8">
                        <Link
                            href={ENTREPRENEUR_COMBO.href}
                            className="group flex w-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5"
                        >
                            <div className="store-card relative min-h-[360px] overflow-hidden sm:min-h-[440px] lg:min-h-[520px]">
                                <picture>
                                    <source media="(max-width: 639px)" srcSet={ENTREPRENEUR_COMBO.mobileImage} />
                                    <img
                                        src={ENTREPRENEUR_COMBO.image}
                                        alt={ENTREPRENEUR_COMBO.title}
                                        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                    />
                                </picture>
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,246,243,0.72),rgba(248,246,243,0.44)_42%,rgba(248,246,243,0.015))]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-text/6 via-transparent to-white/3" />

                                <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center px-6 py-8 sm:px-8 lg:px-12">
                                    <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center text-brand-cta sm:h-14 sm:w-14">
                                            <svg className="h-7 w-7 sm:h-11 sm:w-11" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8.5L12 4l9 4.5M3 8.5l9 5m-9-5V16l9 4.5M12 13.5l9-5M12 13.5V20.5M21 8.5V16L12 20.5" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7.5 6.25L12 8.5l4.5-2.25" />
                                            </svg>
                                        </div>

                                        <p className="home-section-title max-w-xl text-left sm:mt-5">
                                            {ENTREPRENEUR_COMBO.title}
                                        </p>
                                    </div>

                                    <div className="mt-4 max-w-xl space-y-4 text-sm leading-relaxed text-brand-text-muted sm:text-base">
                                        {ENTREPRENEUR_COMBO.body.map((paragraph) => (
                                            <p key={paragraph}>{paragraph}</p>
                                        ))}
                                    </div>

                                    <span className="home-button mt-6 inline-flex self-start items-center gap-2 bg-brand-cta px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-md transition-colors group-hover:bg-brand-cta-dark sm:px-5 sm:text-base">
                                        Ver catalogo
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
