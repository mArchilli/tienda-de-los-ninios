// ─── CategoryShortcuts ────────────────────────────────────────────────────────
// "ROPA QUE LES ENCANTA" — accesos directos circulares a categorías
// + tarjeta promocional "Calidad, diseño y comodidad".

const CATEGORIES = [
    { label: 'NENE',       href: '#nene',       tint: 'bg-brand-primary-surface' },
    { label: 'NENA',       href: '#nena',       tint: 'bg-rose-50' },
    { label: 'UNISEX',     href: '#unisex',     tint: 'bg-brand-secondary-surface' },
    { label: 'ACCESORIOS', href: '#accesorios', tint: 'bg-amber-50' },
    { label: 'OUTLET',     href: '#outlet',     tint: 'bg-brand-cta-surface' },
];

function CircleSlot({ tint, label }) {
    return (
        <div className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded-full ${tint} flex items-center justify-center overflow-hidden`}>
            {label === 'OUTLET' ? (
                <span className="text-2xl font-extrabold text-brand-cta">%</span>
            ) : (
                <svg className="h-10 w-10 text-brand-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M16 14a4 4 0 10-8 0M12 11a3 3 0 100-6 3 3 0 000 6zM4 21c0-3.5 3.5-6 8-6s8 2.5 8 6" />
                </svg>
            )}
        </div>
    );
}

export default function CategoryShortcuts() {
    return (
        <section className="bg-brand-bg">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                    {/* Left — categorías */}
                    <div className="lg:col-span-2">
                        <h2 className="text-lg sm:text-xl font-extrabold tracking-wide text-brand-text">
                            ROPA QUE LES ENCANTA
                        </h2>

                        <div className="mt-6 grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6">
                            {CATEGORIES.map((cat) => (
                                <a
                                    key={cat.label}
                                    href={cat.href}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <CircleSlot tint={cat.tint} label={cat.label} />
                                    <span className="text-[11px] font-bold tracking-wider text-brand-text group-hover:text-brand-primary transition-colors">
                                        {cat.label}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Right — promo */}
                    <aside className="rounded-2xl bg-brand-primary text-white overflow-hidden relative flex flex-col justify-between p-6 min-h-[220px]">
                        <div className="relative z-10 max-w-[60%]">
                            <h3 className="text-xl sm:text-2xl font-extrabold leading-tight">
                                CALIDAD, DISEÑO Y COMODIDAD
                            </h3>
                            <p className="mt-2 text-sm text-white/85 leading-snug">
                                Prendas pensadas para acompañar cada aventura de todos los días.
                            </p>
                            <a
                                href="#about"
                                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-cta px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-brand-cta-dark transition-colors"
                            >
                                Conocé más
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                                </svg>
                            </a>
                        </div>

                        {/* Decorative circle */}
                        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-brand-secondary/40" />
                        <div className="absolute right-6 bottom-6 h-24 w-24 rounded-full bg-brand-secondary flex items-center justify-center">
                            <svg className="h-12 w-12 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M16 14a4 4 0 10-8 0M12 11a3 3 0 100-6 3 3 0 000 6zM4 21c0-3.5 3.5-6 8-6s8 2.5 8 6" />
                            </svg>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
