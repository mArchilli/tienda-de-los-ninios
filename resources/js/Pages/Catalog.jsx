import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

function fmt(price) {
    return '$' + Number(price).toLocaleString('es-AR');
}

function ProductCard({ item }) {
    const href = item.type === 'combo' ? `/combo/${item.id}` : `/producto/${item.id}`;

    return (
        <Link href={href} className="group block h-full">
            <article className="flex h-full flex-col overflow-hidden border border-brand-primary/35 bg-white shadow-[0_10px_24px_rgba(41,50,65,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-[0_16px_34px_rgba(41,50,65,0.10)]">
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-primary-surface/35">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            loading="lazy"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-brand-primary-surface">
                            <svg className="h-12 w-12 text-brand-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {item.is_featured && (
                        <span className="absolute left-2.5 top-2.5 rounded-sm border border-white/80 bg-white/92 px-2 py-1 text-[9px] font-extrabold tracking-[0.18em] text-brand-text shadow-sm sm:left-3 sm:top-3">
                            NEW IN
                        </span>
                    )}

                    {item.type === 'combo' && (
                        <span className="absolute right-2.5 top-2.5 rounded-sm bg-brand-cta-surface px-2 py-1 text-[9px] font-extrabold tracking-[0.18em] text-brand-cta shadow-sm sm:right-3 sm:top-3">
                            COMBO
                        </span>
                    )}
                </div>

                <div className="flex flex-1 flex-col px-3.5 py-3.5 sm:px-4 sm:py-4">
                    <h3 className="line-clamp-2 min-h-[2.35rem] text-[13px] font-semibold leading-[1.15] text-brand-text sm:min-h-[2.5rem] sm:text-[13.5px]">
                        {item.name}
                    </h3>
                    <p className="mt-2 text-[15px] font-extrabold tracking-[-0.01em] text-brand-text sm:text-base">
                        {fmt(item.price)}
                    </p>
                    <span className="mt-4 inline-flex h-10 w-full items-center justify-center bg-brand-cta px-4 text-sm font-bold uppercase tracking-wide text-white transition-colors group-hover:bg-brand-cta-dark">
                        {item.type === 'combo' ? 'Armar combo' : 'Ver producto'}
                    </span>
                </div>
            </article>
        </Link>
    );
}

const SORTERS = {
    relevancia: (a, b) => Number(b.is_featured) - Number(a.is_featured),
    'precio-asc': (a, b) => Number(a.price) - Number(b.price),
    'precio-desc': (a, b) => Number(b.price) - Number(a.price),
    nombre: (a, b) => a.name.localeCompare(b.name, 'es'),
};

const SORT_LABELS = {
    relevancia: 'Relevancia',
    'precio-asc': 'Precio: menor a mayor',
    'precio-desc': 'Precio: mayor a menor',
    nombre: 'Nombre (A \u2192 Z)',
};

export default function Catalog({ combos = [], products = [], cartCount }) {
    const [sort, setSort] = useState('relevancia');
    const [sortOpen, setSortOpen] = useState(false);

    const items = useMemo(() => {
        const merged = [
            ...combos.map((combo) => ({ ...combo, type: 'combo' })),
            ...products.map((product) => ({ ...product, type: 'product' })),
        ];

        return merged.sort(SORTERS[sort] ?? SORTERS.relevancia);
    }, [combos, products, sort]);

    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title={'Cat\u00e1logo \u00b7 Mimos'} />

            <section className="bg-brand-text text-white">
                <div className="mx-auto w-full max-w-[1720px] px-3 py-2.5 text-center text-[11px] font-light uppercase tracking-[0.18em] sm:px-4 sm:text-sm lg:px-5 xl:px-6">
                    {'Nueva colecci\u00f3n'} <span className="mx-2 text-white/40">|</span>
                    <span className="font-semibold">{'oto\u00f1o / invierno 2026'}</span>
                </div>
            </section>

            <section className="border-b border-brand-secondary/20 bg-brand-bg">
                <div className="mx-auto w-full max-w-[1720px] px-3 sm:px-4 lg:px-5 xl:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 py-3 text-[11px] uppercase tracking-[0.16em] text-brand-text-muted sm:gap-3 lg:justify-end">
                        <button
                            type="button"
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-brand-secondary/25 bg-white px-3 font-semibold text-brand-text shadow-sm transition-colors hover:border-brand-secondary/45 hover:text-brand-primary"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M6 12h12M10 19h4" />
                            </svg>
                            Filtros
                        </button>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setSortOpen((value) => !value)}
                                className="inline-flex h-9 items-center gap-2 rounded-md border border-brand-secondary/25 bg-white px-3 font-semibold text-brand-text shadow-sm transition-colors hover:border-brand-secondary/45 hover:text-brand-primary"
                            >
                                Ordenar por:
                                <span className="font-semibold text-brand-text">{SORT_LABELS[sort]}</span>
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {sortOpen && (
                                <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-md border border-brand-secondary/30 bg-white shadow-[0_18px_38px_rgba(41,50,65,0.14)]">
                                    {Object.entries(SORT_LABELS).map(([key, label]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                setSort(key);
                                                setSortOpen(false);
                                            }}
                                            className={`block w-full px-4 py-2.5 text-left text-xs normal-case tracking-normal transition-colors hover:bg-brand-primary-surface ${
                                                key === sort ? 'font-semibold text-brand-primary' : 'text-brand-text'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-brand-bg">
                <div className="mx-auto w-full max-w-[1720px] px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6 xl:px-6">
                    {items.length === 0 ? (
                        <div className="py-24 text-center text-brand-text-muted">
                            <p className="text-sm">No hay prendas ni combos disponibles por el momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5 xl:gap-5 2xl:grid-cols-6">
                            {items.map((item) => (
                                <ProductCard key={`${item.type}-${item.id}`} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </StorefrontLayout>
    );
}
