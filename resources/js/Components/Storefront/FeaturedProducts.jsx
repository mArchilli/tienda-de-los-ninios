import { Link } from '@inertiajs/react';
import { useState } from 'react';

const ITEMS_PER_PAGE = 5;

function fmt(price) {
    return '$' + Number(price).toLocaleString('es-AR');
}

function ProductCard({ product }) {
    return (
        <article className="group h-full">
            <Link href={`/producto/${product.id}`} className="flex h-full flex-col">
                <div className="store-card flex h-full flex-col border-brand-primary/35 p-3 transition duration-300 group-hover:-translate-y-1.5 group-hover:border-brand-primary group-hover:shadow-[0_24px_48px_rgba(31,31,31,0.08)]">
                    <div className="home-media relative aspect-[4/5] overflow-hidden bg-brand-primary-surface">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-brand-primary/30">
                                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-text/12 via-transparent to-white/10" />
                        <span
                            aria-hidden="true"
                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/88 text-brand-text-muted shadow-sm backdrop-blur transition-colors group-hover:text-brand-cta"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21s-7-4.35-7-10a4.5 4.5 0 018-2.83A4.5 4.5 0 0119 11c0 5.65-7 10-7 10z" />
                            </svg>
                        </span>
                    </div>

                    <div className="flex flex-1 flex-col px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-brand-text sm:text-[17px]">{product.name}</h3>
                        <p className="mt-1 text-[14px] font-extrabold tracking-[-0.01em] text-brand-cta sm:text-[17px]">
                            {fmt(product.price)}
                        </p>
                        <span className="home-button mt-auto inline-flex h-9 w-full items-center justify-center bg-brand-cta px-4 text-xs font-bold uppercase tracking-wide text-white transition-colors group-hover:bg-brand-cta-dark sm:h-10 sm:text-sm">
                            Ver producto
                        </span>
                    </div>
                </div>
            </Link>
        </article>
    );
}

export default function FeaturedProducts({ products }) {
    const [page, setPage] = useState(0);
    const items = products ?? [];

    if (items.length === 0) return null;

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const visible = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
    const hasPrev = page > 0;
    const hasNext = page < totalPages - 1;

    return (
        <section className="bg-brand-bg">
            <div className="store-shell store-section-bottom">
                <div className="store-panel px-5 py-8 sm:px-7 lg:px-10 lg:py-10">
                    <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-brand-primary/10 blur-3xl" />
                    <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-brand-secondary/20 blur-3xl" />

                    {/* Header */}
                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <h2 className="home-section-title">
                            PRODUCTOS DESTACADOS
                        </h2>

                        <div className="flex items-center gap-3">
                            {/* Arrows: desktop only */}
                            {totalPages > 1 && (
                                <div className="hidden items-center gap-3 sm:flex">
                                    <button
                                        type="button"
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={!hasPrev}
                                        aria-label="Anteriores"
                                        className="home-button flex h-11 w-11 items-center justify-center border border-white/70 bg-white/80 text-brand-text shadow-sm backdrop-blur-sm transition hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={!hasNext}
                                        aria-label="Siguientes"
                                        className="home-button flex h-11 w-11 items-center justify-center border border-white/70 bg-white/80 text-brand-text shadow-sm backdrop-blur-sm transition hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            <Link
                                href="/catalogo"
                                className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.14em] text-brand-primary hover:text-brand-primary-dark"
                            >
                                Ver todo
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile: swipe carousel */}
                    <div className="relative z-10 mt-7 sm:hidden">
                        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {items.map((product) => (
                                <div key={product.id} className="w-[calc(50%-4px)] flex-none snap-start">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-brand-text-muted/50">
                            deslizá para ver más
                        </p>
                    </div>

                    {/* Desktop: page-based grid */}
                    <div
                        key={page}
                        className="relative z-10 mt-7 hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-4 lg:gap-5"
                    >
                        {visible.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Dots: desktop only */}
                    {totalPages > 1 && (
                        <div className="relative z-10 mt-6 hidden items-center justify-center gap-2 sm:flex">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setPage(i)}
                                    aria-label={`Página ${i + 1}`}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        i === page
                                            ? 'w-6 bg-brand-primary'
                                            : 'w-2 bg-brand-secondary/40 hover:bg-brand-secondary/70'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
