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
        <section className="bg-brand-bg">
            <div className="relative h-[350px] md:hidden">
                <img
                    src="/images/banner-mobile.png"
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/12 via-transparent to-brand-bg/55" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/18 via-transparent to-white/10" />
            </div>
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 hidden md:flex items-center justify-center">
                    <img
                        src="/images/banner.png"
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover object-center"
                    />
                </div>
                <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-brand-bg/94 via-brand-bg/76 via-[40%] to-brand-bg/18" />
                <div className="absolute inset-0 hidden md:block bg-gradient-to-t from-brand-primary/20 via-transparent to-white/12" />

                <div className="store-shell relative z-10 py-6 sm:py-8 lg:py-10 xl:py-12">
                    <div className="grid min-h-0 grid-cols-1 gap-5 md:min-h-[360px] lg:min-h-[430px] lg:grid-cols-[minmax(0,1.1fr)_minmax(220px,0.9fr)] lg:items-center xl:min-h-[470px]">
                        <div className="relative max-w-xl lg:max-w-2xl">
                            <h1 className="font-extrabold leading-[0.9] text-brand-text">
                                <span className="block text-[3.65rem] sm:text-7xl lg:text-[5.1rem] xl:text-[5.55rem]">COMBOS</span>
                                <span className="mt-1.5 block text-[3rem] text-brand-primary sm:text-6xl lg:text-[4.55rem] xl:text-[4.95rem]">
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

                            <div className="mt-8 flex flex-wrap gap-3 sm:mt-6 sm:gap-3.5">
                                <a
                                    href="#combos"
                                    className="home-button inline-flex items-center justify-center bg-brand-cta px-6 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-brand-cta-dark sm:px-7 sm:py-3.5 sm:text-sm"
                                >
                                    Ver combos
                                </a>
                                <a
                                    href="#armar"
                                    className="home-button inline-flex items-center justify-center border-2 border-brand-primary bg-white/95 px-6 py-3 text-xs font-bold uppercase tracking-wide text-brand-primary transition-colors hover:bg-brand-primary hover:text-white sm:px-7 sm:py-3.5 sm:text-sm"
                                >
                                    {'Arm\u00e1 tu combo'}
                                </a>
                            </div>
                        </div>

                        <div className="relative hidden h-full lg:block" />
                    </div>
                </div>
            </div>

            <div className="store-shell relative z-10 pb-6 pt-3 sm:pb-8 sm:pt-4 lg:pb-10 lg:pt-6 xl:pb-12">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
                    {FEATURES.map((feature) => (
                        <div key={feature.title} className="home-surface flex min-h-[92px] flex-col items-center justify-center gap-2 bg-white/84 px-3 py-3 text-center backdrop-blur-sm shadow-sm sm:min-h-[98px] sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:px-4 sm:py-3.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm sm:h-11 sm:w-11">
                                {feature.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] font-extrabold uppercase leading-[1.15] tracking-[0.08em] text-brand-text sm:text-base">
                                    {feature.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
