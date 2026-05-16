const FEATURES = [
    {
        title: 'Listos para regalar',
        sub: 'Presentaci\u00f3n premium',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8h18v13H3zM12 8v13M3 8l2-3h6l1 3M21 8l-2-3h-6l-1 3" />
            </svg>
        ),
    },
    {
        title: 'Env\u00edos a todo el pa\u00eds',
        sub: 'R\u00e1pidos y seguros',
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
        sub: 'Con tu mensaje',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 5h18v14H3zM3 9h18M7 14h6" />
            </svg>
        ),
    },
    {
        title: 'Hecho con amor',
        sub: 'Cuidamos cada detalle',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 21s-7-4.35-7-10a4.5 4.5 0 018-2.83A4.5 4.5 0 0119 11c0 5.65-7 10-7 10z" />
            </svg>
        ),
    },
];

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-brand-bg">
            <div className="absolute inset-0 flex items-center justify-center">
                <img
                    src="/images/banner.png"
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-contain object-center"
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/94 via-brand-bg/76 via-[40%] to-brand-bg/18" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/20 via-transparent to-white/10" />

            <div className="store-shell relative z-10 py-6 sm:py-8 lg:py-10 xl:py-12">
                <div className="grid min-h-[360px] grid-cols-1 gap-5 lg:min-h-[430px] lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)] lg:items-center xl:min-h-[470px]">
                    <div className="relative max-w-xl lg:max-w-2xl">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            Nuevo
                        </span>

                        <h1 className="mt-4 font-extrabold leading-[0.9] text-brand-text">
                            <span className="block text-5xl sm:text-6xl lg:text-[4.35rem] xl:text-[4.8rem]">COMBOS</span>
                            <span className="mt-1.5 block text-4xl text-brand-primary sm:text-5xl lg:text-[3.9rem] xl:text-[4.35rem]">
                                PARA REGALAR
                                <svg className="ml-2 inline-block h-7 w-7 -translate-y-1 text-brand-cta sm:h-8 sm:w-8" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 018-2.83A4.5 4.5 0 0119 11c0 5.65-7 10-7 10z" />
                                </svg>
                            </span>
                        </h1>

                        <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-text-muted sm:text-lg lg:text-[1.03rem]">
                            {'Arm\u00e1 el regalo perfecto para cada ocasi\u00f3n.'}
                            <br />
                            {'Vos eleg\u00eds, nosotros lo armamos con mucho amor'}
                            <span className="text-brand-cta">{' \u2661'}</span>
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3.5">
                            <a
                                href="#combos"
                                className="home-button inline-flex items-center justify-center bg-brand-cta px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-brand-cta-dark"
                            >
                                Ver combos
                            </a>
                            <a
                                href="#armar"
                                className="home-button inline-flex items-center justify-center border-2 border-brand-primary bg-white/95 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                            >
                                {'Arm\u00e1 tu combo'}
                            </a>
                        </div>
                    </div>

                    <div className="relative hidden h-full lg:block" />
                </div>

                <div className="pointer-events-none absolute right-4 top-6 z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-brand-bg bg-brand-primary text-center text-white shadow-xl sm:right-8 sm:top-8 sm:h-32 sm:w-32 lg:right-10 lg:top-10 lg:h-36 lg:w-36 xl:right-12 xl:top-12 xl:h-40 xl:w-40">
                    <span className="text-[10px] font-semibold uppercase tracking-widest opacity-80">Nuevos</span>
                    <span className="text-lg font-extrabold leading-tight xl:text-[1.35rem]">COMBOS</span>
                    <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-80">todas las<br />semanas</span>
                    <svg className="mt-1 h-3 w-3 text-brand-cta xl:h-3.5 xl:w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
                    </svg>
                </div>

                <div className="relative z-10 mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:-mt-2 lg:grid-cols-4 lg:gap-4">
                    {FEATURES.map((feature) => (
                        <div key={feature.title} className="home-surface flex items-center gap-3 bg-white/84 px-4 py-3 backdrop-blur-sm shadow-sm">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary-surface text-brand-primary">
                                {feature.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold leading-tight text-brand-text">{feature.title}</p>
                                <p className="text-xs text-brand-text-muted">{feature.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
