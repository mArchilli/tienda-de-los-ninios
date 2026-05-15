import { useRef } from 'react';

const FALLBACK = [
    { id: 1, name: 'Combo Nene Aventura', desc: 'Campera + Remera + Jean', price: 38900, badge: 'M\u00c1S VENDIDO', badgeColor: 'bg-emerald-700' },
    { id: 2, name: 'Combo Nene Urban', desc: 'Buzo + Pantal\u00f3n + Remera', price: 35900, badge: 'NUEVO EN EL LIVE', badgeColor: 'bg-amber-500' },
    { id: 3, name: 'Combo Nene Cl\u00e1sico', desc: 'Buzo + Remera + Jogger', price: 36900, badge: 'FAVORITO', badgeColor: 'bg-brand-primary' },
    { id: 4, name: 'Combo Nene Verano', desc: 'Remera + Bermuda + Gorra', price: 28900, badge: null, badgeColor: null },
];

function fmt(price) {
    return '$' + Number(price).toLocaleString('es-AR');
}

function ComboCard({ combo }) {
    return (
        <article className="group w-[285px] shrink-0 snap-start sm:w-[318px] lg:w-[338px] xl:w-[352px]">
            <div className="store-card p-3 transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_24px_48px_rgba(61,90,128,0.12)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-brand-secondary-surface">
                    {combo.image ? (
                        <img src={combo.image} alt={combo.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-brand-primary/40">
                            <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-brand-text/55 via-transparent to-white/10" />

                    {combo.badge && (
                        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow ${combo.badgeColor ?? 'bg-brand-primary'}`}>
                            {combo.badge}
                        </span>
                    )}
                </div>

                <div className="px-1 pb-1 pt-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-base font-extrabold leading-tight text-brand-text">{combo.name}</h3>
                            {combo.desc && (
                                <p className="mt-1 text-sm leading-relaxed text-brand-text-muted">{combo.desc}</p>
                            )}
                        </div>
                        <span className="shrink-0 rounded-full bg-brand-cta-surface px-3 py-1 text-sm font-bold text-brand-cta shadow-sm">
                            {fmt(combo.price)}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function FeaturedCombos({ combos }) {
    const scrollerRef = useRef(null);
    const items = combos?.length ? combos : FALLBACK;

    const scroll = (direction) => {
        const node = scrollerRef.current;
        if (!node) return;
        const amount = node.clientWidth * 0.82;
        node.scrollBy({ left: direction * amount, behavior: 'smooth' });
    };

    return (
        <section className="bg-brand-bg">
            <div className="store-shell store-section">
                <div className="store-panel px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
                    <div className="absolute -left-20 top-0 h-48 w-48 rounded-full bg-brand-secondary/20 blur-3xl" />
                    <div className="absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-brand-cta/10 blur-3xl" />

                    <div className="relative z-10 flex items-end justify-between gap-4">
                        <h2 className="text-xl font-extrabold tracking-[0.08em] text-brand-text sm:text-2xl lg:text-[1.9rem]">
                            {'LO M\u00c1S ELEGIDO DE ESTA SEMANA'}
                            <span className="ml-2 text-brand-cta">{'\u2661'}</span>
                        </h2>

                        <div className="hidden items-center gap-3 sm:flex">
                            <button
                                type="button"
                                onClick={() => scroll(-1)}
                                aria-label="Anterior"
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-brand-text shadow-sm backdrop-blur-sm transition hover:text-brand-primary"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => scroll(1)}
                                aria-label="Siguiente"
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-brand-text shadow-sm backdrop-blur-sm transition hover:text-brand-primary"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 mt-8">
                        <div
                            ref={scrollerRef}
                            className="scrollbar-thin -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 scroll-smooth sm:-mx-2 sm:px-2 lg:gap-5 xl:gap-6"
                        >
                            {items.map((combo) => (
                                <ComboCard key={combo.id} combo={combo} />
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 mt-8 flex justify-center">
                        <a
                            href="#combos"
                            className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-sm transition-colors hover:bg-brand-primary-dark"
                        >
                            Ver todos los combos
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
