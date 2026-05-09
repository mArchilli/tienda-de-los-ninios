// ─── TopBar ───────────────────────────────────────────────────────────────────
// Franja superior con mensajes de envío. Tipografía pequeña, fondo bg de marca.
// Usa tokens brand-* definidos en tailwind.config.js.

export default function TopBar() {
    return (
        <div className="w-full bg-brand-primary-surface border-b border-brand-secondary/30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-9 items-center justify-center gap-6 text-[12px] text-brand-text-muted">
                    <span className="inline-flex items-center gap-2">
                        <svg className="h-3.5 w-3.5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
                            <circle cx="7" cy="18" r="1.5" strokeWidth={1.8} />
                            <circle cx="17" cy="18" r="1.5" strokeWidth={1.8} />
                        </svg>
                        Envíos a todo el país
                    </span>
                    <span className="hidden sm:inline-block h-3 w-px bg-brand-text-light/40" />
                    <span className="hidden sm:inline-flex items-center gap-2">
                        Envíos rápidos y seguros
                        <svg className="h-3.5 w-3.5 text-brand-cta" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21s-7-4.35-7-10a4.5 4.5 0 018-2.83A4.5 4.5 0 0119 11c0 5.65-7 10-7 10z" />
                        </svg>
                    </span>
                </div>
            </div>
        </div>
    );
}
