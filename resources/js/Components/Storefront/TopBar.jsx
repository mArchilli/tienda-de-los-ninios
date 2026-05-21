const items = [
    {
        icon: (
            <svg className="h-3.5 w-3.5 shrink-0 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
                <circle cx="7" cy="18" r="1.5" strokeWidth={1.8} />
                <circle cx="17" cy="18" r="1.5" strokeWidth={1.8} />
            </svg>
        ),
        text: 'Envíos a todo el país — a domicilio o a tu sucursal más cercana',
    },
    {
        icon: (
            <svg className="h-3.5 w-3.5 shrink-0 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l7 4v5c0 4.4-2.9 8.4-7 9-4.1-.6-7-4.6-7-9V7l7-4z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.5 12.5l1.8 1.8 3.2-4" />
            </svg>
        ),
        text: 'Compra 100% segura',
    },
    {
        icon: (
            <svg className="h-3.5 w-3.5 shrink-0 text-brand-cta" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 018-2.83A4.5 4.5 0 0119 11c0 5.65-7 10-7 10z" />
            </svg>
        ),
        text: 'Nueva colección de temporada',
    },
    {
        icon: (
            <svg className="h-3.5 w-3.5 shrink-0 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8.5h18" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 15h3" />
            </svg>
        ),
        text: 'Todos los métodos de pago',
    },
];

export default function TopBar() {
    return (
        <div className="border-b border-brand-primary-dark/30 bg-brand-primary text-white">
            <div className="store-shell">
                <div className="topbar-marquee h-8">
                    <div className="topbar-marquee-track">
                        {[...items, ...items].map((item, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/88 sm:text-[11px]"
                            >
                                {item.icon}
                                {item.text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
