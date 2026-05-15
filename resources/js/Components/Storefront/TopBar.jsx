const items = [
    {
        icon: (
            <svg className="h-3.5 w-3.5 shrink-0 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
                <circle cx="7" cy="18" r="1.5" strokeWidth={1.8} />
                <circle cx="17" cy="18" r="1.5" strokeWidth={1.8} />
            </svg>
        ),
        text: 'Env\u00edos a todo el pa\u00eds',
    },
    {
        icon: (
            <svg className="h-3.5 w-3.5 shrink-0 text-brand-cta" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 018-2.83A4.5 4.5 0 0119 11c0 5.65-7 10-7 10z" />
            </svg>
        ),
        text: 'A domicilio o en tu sucursal m\u00e1s cercana',
    },
    {
        icon: (
            <svg className="h-3.5 w-3.5 shrink-0 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 15l-5 3.4 1.9-5.8L4 9h6.1z" />
            </svg>
        ),
        text: 'Nueva colecci\u00f3n de temporada',
    },
    {
        icon: (
            <svg className="h-3.5 w-3.5 shrink-0 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 4h12l1 4H5L6 4zM5 8v12h14V8" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 8V6a3 3 0 016 0v2" />
            </svg>
        ),
        text: 'Ropa para beb\u00e9s y ni\u00f1os de 0 a 12 a\u00f1os',
    },
];

export default function TopBar() {
    return (
        <div className="border-b border-brand-primary-dark/30 bg-brand-primary text-white">
            <div className="store-shell">
                <div className="flex h-8 items-center justify-center overflow-hidden text-center">
                    <div className="hidden items-center gap-6 whitespace-nowrap text-[11px] font-medium tracking-[0.14em] uppercase sm:flex">
                        {items.slice(0, 3).map((item) => (
                            <span key={item.text} className="inline-flex items-center gap-2 text-white/88">
                                {item.icon}
                                {item.text}
                            </span>
                        ))}
                    </div>
                    <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/88 sm:hidden">
                        {items[0].icon}
                        {items[0].text}
                    </span>
                </div>
            </div>
        </div>
    );
}
