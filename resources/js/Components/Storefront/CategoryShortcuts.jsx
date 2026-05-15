const CATEGORIES = [
    { label: 'NENE', href: '#nene', tint: 'bg-brand-primary-surface', orb: 'bg-brand-primary/12' },
    { label: 'NENA', href: '#nena', tint: 'bg-rose-50', orb: 'bg-rose-200/55' },
    { label: 'UNISEX', href: '#unisex', tint: 'bg-brand-secondary-surface', orb: 'bg-brand-secondary/25' },
    { label: 'ACCESORIOS', href: '#accesorios', tint: 'bg-amber-50', orb: 'bg-amber-200/55' },
    { label: 'OUTLET', href: '#outlet', tint: 'bg-brand-cta-surface', orb: 'bg-brand-cta/12' },
];

function CircleSlot({ tint, label }) {
    return (
        <div className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full ${tint} shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:h-28 sm:w-28 lg:h-32 lg:w-32`}>
            <div className="absolute inset-x-4 top-3 h-5 rounded-full bg-white/45 blur-md" />
            {label === 'OUTLET' ? (
                <span className="text-3xl font-extrabold text-brand-cta lg:text-[2.2rem]">%</span>
            ) : (
                <svg className="h-11 w-11 text-brand-primary/50 lg:h-12 lg:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M16 14a4 4 0 10-8 0M12 11a3 3 0 100-6 3 3 0 000 6zM4 21c0-3.5 3.5-6 8-6s8 2.5 8 6" />
                </svg>
            )}
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
                                        className="group relative flex flex-col items-center rounded-[1.5rem] px-3 py-4 transition duration-300 hover:-translate-y-1"
                                    >
                                        <div className={`absolute inset-0 rounded-[1.5rem] ${category.orb} opacity-0 transition duration-300 group-hover:opacity-100`} />
                                        <div className="relative">
                                            <CircleSlot tint={category.tint} label={category.label} />
                                        </div>
                                        <span className="relative mt-3 text-xs font-bold tracking-[0.18em] text-brand-text transition-colors group-hover:text-brand-primary">
                                            {category.label}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <aside className="relative overflow-hidden rounded-[2rem] bg-brand-primary p-6 text-white shadow-[0_24px_50px_rgba(61,90,128,0.20)] sm:p-7 lg:p-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-black/10" />
                            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute -bottom-12 -right-10 h-56 w-56 rounded-full bg-brand-secondary/35" />

                            <div className="relative z-10 flex min-h-[260px] flex-col justify-between lg:min-h-[320px]">
                                <div className="max-w-[66%]">
                                    <h3 className="text-xl font-extrabold leading-tight sm:text-2xl lg:text-[1.95rem]">
                                        {'CALIDAD, DISE\u00d1O Y COMODIDAD'}
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-white/88">
                                        {'Prendas pensadas para acompa\u00f1ar cada aventura de todos los d\u00edas.'}
                                    </p>
                                    <a
                                        href="#about"
                                        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-cta px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors hover:bg-brand-cta-dark"
                                    >
                                        {'Conoc\u00e9 m\u00e1s'}
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                                        </svg>
                                    </a>
                                </div>

                                <div className="absolute bottom-6 right-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-secondary shadow-[0_18px_32px_rgba(41,50,65,0.16)] lg:h-28 lg:w-28">
                                    <svg className="h-12 w-12 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M16 14a4 4 0 10-8 0M12 11a3 3 0 100-6 3 3 0 000 6zM4 21c0-3.5 3.5-6 8-6s8 2.5 8 6" />
                                    </svg>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </section>
    );
}
