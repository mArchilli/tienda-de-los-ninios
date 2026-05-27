const CATEGORIES = [
    { label: 'NENE', href: '#nene', tint: 'bg-brand-primary-surface', orb: 'bg-brand-primary/12', image: '/images/filtro-nene.png' },
    { label: 'NENA', href: '#nena', tint: 'bg-rose-50', orb: 'bg-rose-200/55', image: '/images/filtro-nena.png' },
    { label: 'BEBE', href: '#bebe', tint: 'bg-brand-secondary-surface', orb: 'bg-brand-secondary/25', image: '/images/filtro-bebe.png' },
    { label: 'BEBA', href: '#beba', tint: 'bg-amber-50', orb: 'bg-amber-200/55', image: '/images/filtro-beba.png' },
    { label: 'CREAR COMBO', href: '#armar', tint: 'bg-brand-cta-surface', orb: 'bg-brand-cta/12', image: '/images/filtro-combos.png' },
];

function CircleSlot({ tint, label, image }) {
    return (
        <div className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full ${tint} shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:h-28 sm:w-28 lg:h-32 lg:w-32`}>
            <div className="absolute inset-x-4 top-3 h-5 rounded-full bg-white/45 blur-md" />
            <img
                src={image}
                alt={`Filtro ${label.toLowerCase()}`}
                className="relative z-10 h-16 w-16 object-contain sm:h-20 sm:w-20 lg:h-24 lg:w-24"
            />
        </div>
    );
}

export default function CategoryShortcuts() {
    return (
        <section className="bg-brand-bg">
            <div className="store-shell store-section-bottom">
                <div className="store-panel px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
                    <div className="absolute -left-16 top-8 h-40 w-40 rounded-full bg-brand-secondary/18 blur-3xl" />
                    <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-brand-primary/10 blur-3xl" />

                    <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)] lg:gap-8 xl:gap-10">
                        <div className="store-card bg-white/55 px-5 py-6 sm:px-6 lg:px-7">
                            <h2 className="text-lg font-extrabold tracking-[0.08em] text-brand-text sm:text-xl lg:text-2xl">
                                ROPA QUE LES ENCANTA
                            </h2>

                            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                                {CATEGORIES.map((category) => (
                                    <a
                                        key={category.label}
                                        href={category.href}
                                        className="home-surface group relative flex flex-col items-center px-3 py-4 transition duration-300 hover:-translate-y-1"
                                    >
                                        <div className={`home-surface absolute inset-0 ${category.orb} opacity-0 transition duration-300 group-hover:opacity-100`} />
                                        <div className="relative">
                                            <CircleSlot tint={category.tint} label={category.label} image={category.image} />
                                        </div>
                                        <span className="relative mt-3 text-center text-[11px] font-bold leading-tight tracking-[0.14em] text-brand-text transition-colors group-hover:text-brand-primary sm:text-xs sm:tracking-[0.18em]">
                                            {category.label}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <aside className="home-panel relative overflow-hidden shadow-[0_24px_50px_rgba(31,31,31,0.12)]">
                            <img
                                src="/images/banner-filtros.png"
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 h-full w-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/88 via-brand-primary/70 to-brand-primary/28" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/8" />

                            <div className="relative z-10 flex min-h-[260px] flex-col justify-between p-6 sm:p-7 lg:min-h-[320px] lg:p-8">
                                <div className="max-w-[66%]">
                                    <h3 className="text-xl font-extrabold leading-tight text-brand-text sm:text-2xl lg:text-[1.95rem]">
                                        {'CALIDAD, DISE\u00d1O Y COMODIDAD'}
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-brand-text/80">
                                        {'Prendas pensadas para acompa\u00f1ar cada aventura de todos los d\u00edas.'}
                                    </p>
                                    <a
                                        href="#about"
                                        className="home-button mt-5 inline-flex items-center gap-1.5 bg-brand-cta px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors hover:bg-brand-cta-dark"
                                    >
                                        {'Conoc\u00e9 m\u00e1s'}
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </section>
    );
}
