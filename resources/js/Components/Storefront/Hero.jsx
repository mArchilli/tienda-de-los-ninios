// ─── Hero ─────────────────────────────────────────────────────────────────────
// Sección principal: título "COMBOS PARA REGALAR", dos CTAs y bullets.
// La imagen del modelo se pasa por prop para poder reemplazarla fácil.

const FEATURES = [
    {
        title: 'Listos para regalar',
        sub:   'Presentación premium',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8h18v13H3zM12 8v13M3 8l2-3h6l1 3M21 8l-2-3h-6l-1 3" />
            </svg>
        ),
    },
    {
        title: 'Envíos a todo el país',
        sub:   'Rápidos y seguros',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
                <circle cx="7" cy="18" r="1.6" strokeWidth={1.6} />
                <circle cx="17" cy="18" r="1.6" strokeWidth={1.6} />
            </svg>
        ),
    },
    {
        title: 'Tarjeta personalizada',
        sub:   'Con tu mensaje',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 5h18v14H3zM3 9h18M7 14h6" />
            </svg>
        ),
    },
    {
        title: 'Hecho con amor',
        sub:   'Cuidamos cada detalle',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 21s-7-4.35-7-10a4.5 4.5 0 018-2.83A4.5 4.5 0 0119 11c0 5.65-7 10-7 10z" />
            </svg>
        ),
    },
];

export default function Hero({ image }) {
    return (
        <section className="relative overflow-hidden bg-brand-primary-surface">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                    {/* Left — copy */}
                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            Nuevo
                        </span>

                        <h1 className="mt-4 font-extrabold leading-[0.95] text-brand-text">
                            <span className="block text-5xl sm:text-6xl lg:text-7xl">COMBOS</span>
                            <span className="block text-4xl sm:text-5xl lg:text-6xl text-brand-primary mt-1">
                                PARA REGALAR
                                <svg className="inline-block h-7 w-7 ml-2 text-brand-cta -translate-y-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 018-2.83A4.5 4.5 0 0119 11c0 5.65-7 10-7 10z" />
                                </svg>
                            </span>
                        </h1>

                        <p className="mt-5 text-base sm:text-lg text-brand-text-muted max-w-md leading-relaxed">
                            Armá el regalo perfecto para cada ocasión.
                            <br />
                            Vos elegís, nosotros lo armamos con mucho amor
                            <span className="text-brand-cta"> ♡</span>
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <a
                                href="#combos"
                                className="inline-flex items-center justify-center rounded-xl bg-brand-cta px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md hover:bg-brand-cta-dark transition-colors"
                            >
                                Ver combos
                            </a>
                            <a
                                href="#armar"
                                className="inline-flex items-center justify-center rounded-xl border-2 border-brand-primary bg-white px-7 py-3 text-sm font-bold uppercase tracking-wide text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                            >
                                Armá tu combo
                            </a>
                        </div>
                    </div>

                    {/* Right — image + badge */}
                    <div className="relative">
                        <div className="relative aspect-[4/3] sm:aspect-[5/4] rounded-3xl overflow-hidden bg-brand-secondary/30 shadow-lg">
                            {image ? (
                                <img src={image} alt="Combo destacado" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-brand-primary/40">
                                        <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mt-2 text-xs font-medium">Imagen del combo</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Floating badge */}
                        <div className="absolute -bottom-4 right-4 sm:-right-6 sm:bottom-6 h-32 w-32 sm:h-36 sm:w-36 rounded-full bg-brand-primary text-white flex flex-col items-center justify-center text-center shadow-xl border-4 border-brand-bg">
                            <span className="text-[10px] font-semibold uppercase tracking-widest opacity-80">Nuevos</span>
                            <span className="text-lg font-extrabold leading-tight">COMBOS</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80 mt-0.5">todas las<br/>semanas</span>
                            <svg className="h-3 w-3 mt-1 text-brand-cta" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Features strip */}
                <div className="mt-10 lg:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {FEATURES.map((f) => (
                        <div key={f.title} className="flex items-center gap-3 rounded-2xl bg-white/60 backdrop-blur px-4 py-3">
                            <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary-surface text-brand-primary">
                                {f.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-brand-text leading-tight">{f.title}</p>
                                <p className="text-xs text-brand-text-muted">{f.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
