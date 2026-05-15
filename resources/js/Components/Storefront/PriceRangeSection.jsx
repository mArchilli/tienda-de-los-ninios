const RANGES = [
    {
        label: 'Combos',
        title: 'Hasta $30.000',
        href: '#combos-30k',
        bg: 'bg-brand-secondary-surface',
        iconBg: 'bg-brand-secondary',
        accent: 'bg-brand-secondary/35',
        icon: (
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8h18v13H3zM12 8v13M3 8l2-3h6l1 3M21 8l-2-3h-6l-1 3" />
            </svg>
        ),
    },
    {
        label: 'Combos',
        title: '$30.000 a $50.000',
        href: '#combos-50k',
        bg: 'bg-amber-50',
        iconBg: 'bg-amber-400',
        accent: 'bg-amber-200/60',
        icon: (
            <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
            </svg>
        ),
    },
    {
        label: 'Combos',
        title: 'Premium',
        href: '#combos-premium',
        bg: 'bg-brand-primary-surface',
        iconBg: 'bg-brand-primary',
        accent: 'bg-brand-primary/20',
        icon: (
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9l3 9h12l3-9-5 3-4-7-4 7-5-3z" />
            </svg>
        ),
    },
    {
        label: 'Arm\u00e1',
        title: 'Tu combo',
        sub: 'Personalizalo a tu gusto',
        ctaLabel: 'Crear ahora',
        href: '#armar',
        bg: 'bg-violet-50',
        iconBg: 'bg-violet-400',
        accent: 'bg-violet-200/60',
        icon: (
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5h2v14h-2zM5 11h14v2H5z" />
            </svg>
        ),
    },
];

export default function PriceRangeSection() {
    return (
        <section className="bg-brand-bg">
            <div className="store-shell store-section !pt-4 lg:!pt-6">
                <div className="store-panel px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
                    <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-brand-secondary/20 blur-3xl" />
                    <div className="absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-brand-primary/10 blur-3xl" />

                    <h2 className="relative z-10 text-center text-xl font-extrabold tracking-[0.08em] text-brand-text sm:text-2xl lg:text-[1.9rem]">
                        {'ELEG\u00cd C\u00d3MO QUER\u00c9S REGALAR'}
                    </h2>

                    <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
                        {RANGES.map((range) => (
                            <a
                                key={range.title}
                                href={range.href}
                                className={`group store-card ${range.bg} flex min-h-[235px] flex-col p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(61,90,128,0.12)] lg:min-h-[255px] lg:p-7`}
                            >
                                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${range.accent}`} />
                                <div className={`relative mb-6 flex h-[4.6rem] w-[4.6rem] items-center justify-center rounded-[1.4rem] ${range.iconBg} shadow-[0_10px_24px_rgba(41,50,65,0.14)]`}>
                                    {range.icon}
                                </div>

                                <p className="relative text-[11px] font-bold uppercase tracking-[0.24em] text-brand-text-muted">
                                    {range.label}
                                </p>
                                <p className="relative mt-3 text-[1.35rem] font-extrabold uppercase leading-tight text-brand-text">
                                    {range.title}
                                </p>
                                {range.sub && (
                                    <p className="relative mt-3 max-w-[16rem] text-sm leading-relaxed text-brand-text-muted">
                                        {range.sub}
                                    </p>
                                )}

                                <span className="relative mt-auto inline-flex items-center gap-1 pt-6 text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary group-hover:text-brand-primary-dark">
                                    {range.ctaLabel ?? 'Ver opciones'}
                                    <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                                    </svg>
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
