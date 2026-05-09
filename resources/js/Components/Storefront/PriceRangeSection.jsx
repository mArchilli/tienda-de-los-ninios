// ─── PriceRangeSection ────────────────────────────────────────────────────────
// "ELEGÍ CÓMO QUERÉS REGALAR" — 4 tarjetas con rangos de precio + Armá tu combo.
// Cada tarjeta usa un fondo tint sutil distinto, manteniendo paleta de marca.

const RANGES = [
    {
        label: 'Combos',
        title: 'Hasta $30.000',
        href: '#combos-30k',
        bg: 'bg-brand-secondary-surface',
        iconBg: 'bg-brand-secondary',
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
        icon: (
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9l3 9h12l3-9-5 3-4-7-4 7-5-3z" />
            </svg>
        ),
    },
    {
        label: 'Armá',
        title: 'Tu combo',
        sub:   'Personalizalo a tu gusto',
        ctaLabel: 'Crear ahora',
        href: '#armar',
        bg: 'bg-violet-50',
        iconBg: 'bg-violet-400',
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <h2 className="text-center text-xl sm:text-2xl font-extrabold tracking-wide text-brand-text">
                    ELEGÍ CÓMO QUERÉS REGALAR
                </h2>

                <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {RANGES.map((r) => (
                        <a
                            key={r.title}
                            href={r.href}
                            className={`group rounded-2xl ${r.bg} p-6 lg:p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-1`}
                        >
                            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${r.iconBg} shadow-sm`}>
                                {r.icon}
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">
                                {r.label}
                            </p>
                            <p className="mt-1 text-base sm:text-lg font-extrabold uppercase text-brand-text leading-snug">
                                {r.title}
                            </p>
                            {r.sub && (
                                <p className="mt-2 text-xs text-brand-text-muted">{r.sub}</p>
                            )}
                            <span className="mt-3 text-xs font-semibold text-brand-primary group-hover:text-brand-primary-dark inline-flex items-center gap-1">
                                {r.ctaLabel ?? 'Ver opciones'}
                                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                                </svg>
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
