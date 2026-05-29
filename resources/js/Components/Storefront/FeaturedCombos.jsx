import { Link } from '@inertiajs/react';
import { useRef } from 'react';

function fmt(price) {
    return '$' + Number(price).toLocaleString('es-AR');
}

function ComboCard({ combo }) {
    return (
        <article className="group h-full">
            <Link href={`/combo/${combo.id}`} className="flex h-full flex-col">
                <div className="store-card flex h-full flex-col border-brand-primary/35 p-3 transition duration-300 group-hover:-translate-y-1.5 group-hover:border-brand-primary group-hover:shadow-[0_24px_48px_rgba(31,31,31,0.08)]">
                    <div className="home-media relative aspect-[4/5] overflow-hidden bg-brand-secondary-surface">
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
                            <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-[10px] ${combo.badgeColor ?? 'bg-brand-primary'}`}>
                                {combo.badge}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-1 flex-col px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-brand-text sm:text-[18px]">{combo.name}</h3>
                        {combo.desc && (
                            <p className="mt-1 hidden text-sm leading-relaxed text-brand-text-muted sm:block">{combo.desc}</p>
                        )}
                        <p className="mt-1 text-[14px] font-extrabold tracking-[-0.01em] text-brand-cta sm:mt-2 sm:text-[17px]">
                            {fmt(combo.price)}
                        </p>
                    </div>
                </div>
            </Link>
        </article>
    );
}

export default function FeaturedCombos({ combos }) {
    const scrollerRef = useRef(null);
    const items = combos ?? [];

    if (items.length === 0) return null;

    const scroll = (direction) => {
        const node = scrollerRef.current;
        if (!node) return;
        node.scrollBy({ left: direction * node.clientWidth * 0.82, behavior: 'smooth' });
    };

    return (
        <section id="combos" className="bg-brand-bg">
            <div className="store-shell store-section">
                <div className="relative px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
                    <div className="absolute -left-20 top-0 h-48 w-48 rounded-full bg-brand-secondary/20 blur-3xl" />
                    <div className="absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-brand-cta/10 blur-3xl" />

                    {/* Header */}
                    <div className="relative z-10 flex items-end justify-between gap-4">
                        <h2 className="home-section-title">
                            {'LO MÁS ELEGIDO DE ESTA SEMANA'}
                            <span className="ml-2 text-brand-cta">{'♡'}</span>
                        </h2>

                        {/* Arrows: desktop only */}
                        <div className="hidden items-center gap-3 sm:flex">
                            <button
                                type="button"
                                onClick={() => scroll(-1)}
                                aria-label="Anterior"
                                className="home-button flex h-11 w-11 items-center justify-center border border-white/70 bg-white/80 text-brand-text shadow-sm backdrop-blur-sm transition hover:text-brand-primary"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => scroll(1)}
                                aria-label="Siguiente"
                                className="home-button flex h-11 w-11 items-center justify-center border border-white/70 bg-white/80 text-brand-text shadow-sm backdrop-blur-sm transition hover:text-brand-primary"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile: swipe carousel (2 per view) */}
                    <div className="relative z-10 mt-8 sm:hidden">
                        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {items.map((combo) => (
                                <div key={combo.id} className="w-[calc(50%-4px)] flex-none snap-start">
                                    <ComboCard combo={combo} />
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-brand-text-muted/50">
                            deslizá para ver más
                        </p>
                    </div>

                    {/* Desktop: free-scroll carousel with fixed-width cards */}
                    <div className="relative z-10 mt-8 hidden sm:block">
                        <div
                            ref={scrollerRef}
                            className="scrollbar-thin -mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-3 scroll-smooth lg:gap-5 xl:gap-6"
                        >
                            {items.map((combo) => (
                                <div key={combo.id} className="w-[318px] flex-none snap-start lg:w-[338px] xl:w-[352px]">
                                    <ComboCard combo={combo} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 mt-8 flex justify-center">
                        <Link
                            href="/catalogo"
                            className="home-button inline-flex items-center gap-2 bg-brand-cta px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-sm transition-colors hover:bg-brand-cta-dark"
                        >
                            Ver todos los combos
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
