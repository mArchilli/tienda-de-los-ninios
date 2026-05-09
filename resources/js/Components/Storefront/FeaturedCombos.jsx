import { useRef } from 'react';

// ─── FeaturedCombos ───────────────────────────────────────────────────────────
// Carrusel horizontal de combos destacados. Acepta `combos` por prop.
// Si no se pasan combos, muestra placeholders coherentes con la home mock.

const FALLBACK = [
    { id: 1, name: 'Combo Nene Aventura', desc: 'Campera + Remera + Jean',     price: 38900, badge: 'MÁS VENDIDO',     badgeColor: 'bg-emerald-700' },
    { id: 2, name: 'Combo Nene Urban',    desc: 'Buzo + Pantalón + Remera',    price: 35900, badge: 'NUEVO EN EL LIVE', badgeColor: 'bg-amber-500' },
    { id: 3, name: 'Combo Nene Clásico',  desc: 'Buzo + Remera + Jogger',      price: 36900, badge: 'FAVORITO',         badgeColor: 'bg-brand-primary' },
    { id: 4, name: 'Combo Nene Verano',   desc: 'Remera + Bermuda + Gorra',    price: 28900, badge: null,               badgeColor: null },
];

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR');
}

function ComboCard({ combo }) {
    return (
        <article className="snap-start shrink-0 w-[260px] sm:w-[280px] lg:w-[300px] group">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-secondary-surface">
                {combo.image ? (
                    <img src={combo.image} alt={combo.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-brand-primary/40">
                        <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                )}

                {combo.badge && (
                    <span className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow ${combo.badgeColor ?? 'bg-brand-primary'}`}>
                        {combo.badge}
                    </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <h3 className="text-white font-bold text-sm leading-tight">{combo.name}</h3>
                    {combo.desc && <p className="text-white/80 text-xs">{combo.desc}</p>}
                </div>

                <span className="absolute bottom-3 right-3 inline-flex items-center rounded-full bg-white px-3 py-1 text-sm font-bold text-brand-text shadow">
                    {fmt(combo.price)}
                </span>
            </div>
        </article>
    );
}

export default function FeaturedCombos({ combos }) {
    const scrollerRef = useRef(null);
    const items = combos?.length ? combos : FALLBACK;

    const scroll = (dir) => {
        const node = scrollerRef.current;
        if (!node) return;
        const amount = node.clientWidth * 0.8;
        node.scrollBy({ left: dir * amount, behavior: 'smooth' });
    };

    return (
        <section className="bg-brand-bg">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="flex items-end justify-between gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-brand-text">
                        LO MÁS ELEGIDO DE ESTA SEMANA
                        <span className="text-brand-cta ml-2">♡</span>
                    </h2>
                </div>

                <div className="relative mt-8">
                    {/* Arrows */}
                    <button
                        type="button"
                        onClick={() => scroll(-1)}
                        aria-label="Anterior"
                        className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-brand-secondary/30 shadow text-brand-text hover:text-brand-primary"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => scroll(1)}
                        aria-label="Siguiente"
                        className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-white border border-brand-secondary/30 shadow text-brand-text hover:text-brand-primary"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Scroller */}
                    <div
                        ref={scrollerRef}
                        className="flex gap-4 lg:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 scrollbar-thin"
                    >
                        {items.map((combo) => (
                            <ComboCard key={combo.id} combo={combo} />
                        ))}
                    </div>
                </div>

                <div className="flex justify-center mt-8">
                    <a
                        href="#combos"
                        className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-primary-dark transition-colors"
                    >
                        Ver todos los combos
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                        </svg>
                    </a>
                </div>
            </div>
        </section>
    );
}
