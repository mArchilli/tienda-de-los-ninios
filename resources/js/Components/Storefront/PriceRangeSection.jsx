import { Link } from '@inertiajs/react';

const ENTREPRENEUR_COMBO = {
    label: 'Combos para emprendedores',
    title: 'Pensado para emprendedores y revendedores',
    sub: 'Una propuesta de mayor valor, con mejor presentacion y mas presencia para ofrecer en tu negocio.',
    href: '/catalogo?tipo=combos&precio_min=100000',
    image: '/images/combo-emprendedor.png',
};

export default function PriceRangeSection() {
    return (
        <section className="bg-brand-bg">
            <div className="store-shell store-section !pt-4 lg:!pt-6">
                <div className="relative px-2 py-2 sm:px-3 lg:px-4">

                    <h2 className="home-section-title relative z-10 text-center">
                        PENSADO PARA EMPRENDEDORES
                    </h2>

                    <div className="relative z-10 mt-8">
                        <Link
                            href={ENTREPRENEUR_COMBO.href}
                            className="group flex w-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5"
                        >
                            <div className="store-card relative min-h-[360px] overflow-hidden sm:min-h-[440px] lg:min-h-[520px]">
                                <img
                                    src={ENTREPRENEUR_COMBO.image}
                                    alt={ENTREPRENEUR_COMBO.label}
                                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,246,243,0.95),rgba(248,246,243,0.76)_42%,rgba(248,246,243,0.08))]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-text/10 via-transparent to-white/10" />

                                <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center px-6 py-8 sm:px-8 lg:px-12">
                                    <div className="flex h-14 w-14 items-center justify-center text-brand-cta">
                                        <svg className="h-11 w-11" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 19h16M6 16V9m4 7V5m4 11v-8m4 8v-4" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7l3-3 3 2 4-3" />
                                        </svg>
                                    </div>

                                    <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-brand-cta">
                                        {ENTREPRENEUR_COMBO.label}
                                    </p>
                                    <p className="mt-3 max-w-xl text-xl font-extrabold leading-tight text-brand-text sm:text-3xl lg:text-[2.45rem]">
                                        {ENTREPRENEUR_COMBO.title}
                                    </p>
                                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-text-muted sm:text-base">
                                        {ENTREPRENEUR_COMBO.sub}
                                    </p>

                                    <span className="mt-6 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-cta">
                                        Ver catalogo
                                        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
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
