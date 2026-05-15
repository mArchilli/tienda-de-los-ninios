const ITEMS = [
    {
        title: 'ENV\u00cdOS A TODO EL PA\u00cdS',
        sub: 'A tu casa o al domicilio que vos elijas',
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
                <circle cx="7" cy="18" r="1.6" strokeWidth={1.6} />
                <circle cx="17" cy="18" r="1.6" strokeWidth={1.6} />
            </svg>
        ),
    },
    {
        title: 'REGALOS LISTOS',
        sub: 'Presentaci\u00f3n especial sin cargo',
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8h18v13H3zM12 8v13M3 8l2-3h6l1 3M21 8l-2-3h-6l-1 3" />
            </svg>
        ),
    },
    {
        title: 'TARJETA PERSONALIZADA',
        sub: 'Escrib\u00ed tu mensaje y lo agregamos',
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 5h18v14H3zM3 9h18M7 14h6" />
            </svg>
        ),
    },
    {
        title: 'COMPRA 100% SEGURA',
        sub: 'Medios de pago protegidos y cuotas sin inter\u00e9s',
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
            </svg>
        ),
    },
];

export default function TrustBanner() {
    return (
        <section className="bg-brand-bg">
            <div className="store-shell store-section-bottom">
                <div className="store-panel bg-brand-secondary-surface/70 px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
                    <div className="absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-white/30 blur-3xl" />
                    <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-brand-primary/10 blur-3xl" />

                    <div className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
                        {ITEMS.map((item) => (
                            <div key={item.title} className="store-card flex items-start gap-4 px-4 py-4 sm:px-5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-primary shadow-sm">
                                    {item.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[12px] font-extrabold tracking-[0.18em] text-brand-primary">
                                        {item.title}
                                    </p>
                                    <p className="mt-1.5 text-sm leading-relaxed text-brand-text-muted">
                                        {item.sub}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
