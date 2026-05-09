// ─── TrustBanner ──────────────────────────────────────────────────────────────
// Tira de cuatro garantías. Va sobre fondo crema, tarjetas con tint suave.

const ITEMS = [
    {
        title: 'ENVÍOS A TODO EL PAÍS',
        sub:   'A tu casa o al domicilio que vos elijas',
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
        sub:   'Presentación especial sin cargo',
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8h18v13H3zM12 8v13M3 8l2-3h6l1 3M21 8l-2-3h-6l-1 3" />
            </svg>
        ),
    },
    {
        title: 'TARJETA PERSONALIZADA',
        sub:   'Escribí tu mensaje y lo agregamos',
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 5h18v14H3zM3 9h18M7 14h6" />
            </svg>
        ),
    },
    {
        title: 'COMPRA 100% SEGURA',
        sub:   'Medios de pago protegidos y cuotas sin interés',
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
                <div className="rounded-2xl bg-brand-secondary-surface p-5 sm:p-7">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                        {ITEMS.map((it) => (
                            <div key={it.title} className="flex items-start gap-3">
                                <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-primary">
                                    {it.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[12px] font-extrabold tracking-wide text-brand-primary">
                                        {it.title}
                                    </p>
                                    <p className="text-xs text-brand-text-muted leading-snug mt-0.5">
                                        {it.sub}
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
