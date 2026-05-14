const items = [
    {
        icon: (
            <svg className="h-3.5 w-3.5 shrink-0 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
                <circle cx="7" cy="18" r="1.5" strokeWidth={1.8} />
                <circle cx="17" cy="18" r="1.5" strokeWidth={1.8} />
            </svg>
        ),
        text: 'Envíos a todo el país',
    },
    {
        icon: (
            <svg className="h-3.5 w-3.5 shrink-0 text-brand-cta" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 018-2.83A4.5 4.5 0 0119 11c0 5.65-7 10-7 10z" />
            </svg>
        ),
        text: 'A domicilio o en tu sucursal más cercana',
    },
    {
        icon: (
            <svg className="h-3.5 w-3.5 shrink-0 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 15l-5 3.4 1.9-5.8L4 9h6.1z" />
            </svg>
        ),
        text: 'Nueva colección de temporada',
    },
    {
        icon: (
            <svg className="h-3.5 w-3.5 shrink-0 text-brand-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 4h12l1 4H5L6 4zM5 8v12h14V8" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 8V6a3 3 0 016 0v2" />
            </svg>
        ),
        text: 'Ropa para bebés y niños de 0 a 12 años',
    },
];

const Separator = () => (
    <span className="mx-8 text-brand-text-light/40 select-none">◆</span>
);

export default function TopBar() {
    return (
        <>
            <style>{`
                @keyframes topbar-marquee {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
                .topbar-track {
                    animation: topbar-marquee 32s linear infinite;
                }
                .topbar-track:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <div className="w-full bg-brand-primary-surface border-b border-brand-secondary/30 overflow-hidden">
                <div className="h-9 flex items-center">
                    <div className="topbar-track flex items-center whitespace-nowrap">
                        {[...items, ...items].map((item, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-2 text-[12px] text-brand-text-muted"
                            >
                                {item.icon}
                                {item.text}
                                <Separator />
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
