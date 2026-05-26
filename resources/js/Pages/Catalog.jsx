import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

const PRODUCTS_PAGE_SIZE = 20;

function fmt(price) {
    return '$' + Number(price).toLocaleString('es-AR');
}

function ProductCard({ item }) {
    const href = item.type === 'combo' ? `/combo/${item.id}` : `/producto/${item.id}`;

    return (
        <Link href={href} className="group block h-full">
            <article className="flex h-full flex-col overflow-hidden border border-brand-primary/35 bg-white shadow-[0_10px_24px_rgba(41,50,65,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-[0_16px_34px_rgba(41,50,65,0.10)]">
                <div className="relative aspect-[4/5] overflow-hidden bg-white">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.name}
                            className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
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
                        <span className="absolute left-3 top-3 rounded-sm bg-brand-cta px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-sm">
                            New
                        </span>
                    )}

                    {item.type === 'combo' && (
                        <span className="absolute right-3 top-3 rounded-sm bg-brand-text px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-sm">
                            Combo
                        </span>
                    )}

                    <span
                        aria-hidden="true"
                        className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-cta shadow-md transition-transform duration-300 group-hover:scale-110"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </span>
                </div>

                <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
                    <h3 className="line-clamp-2 text-[17px] font-bold leading-[1.08] text-brand-text sm:text-[18px]">
                        {item.name}
                    </h3>
                    <p className="mt-1 text-[16px] font-extrabold tracking-[-0.01em] text-brand-cta sm:text-[17px]">
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
    nombre: 'Nombre (A -> Z)',
};

function SectionHeading({ title, subtitle }) {
    return (
        <div className="mb-4 flex items-end justify-between gap-3 border-b border-brand-secondary/20 pb-3 sm:mb-5 sm:pb-4">
            <div>
                <h2 className="text-lg font-extrabold uppercase tracking-[0.14em] text-brand-text sm:text-xl">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-brand-text-muted">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

export default function Catalog({ combos = [], products = [], cartCount }) {
    const [sort, setSort] = useState('relevancia');
    const [sortOpen, setSortOpen] = useState(false);
    const [visibleProducts, setVisibleProducts] = useState(PRODUCTS_PAGE_SIZE);

    const sortedCombos = useMemo(() => {
        return [...combos]
            .map((combo) => ({ ...combo, type: 'combo' }))
            .sort(SORTERS[sort] ?? SORTERS.relevancia);
    }, [combos, sort]);

    const sortedProducts = useMemo(() => {
        return [...products]
            .map((product) => ({ ...product, type: 'product' }))
            .sort(SORTERS[sort] ?? SORTERS.relevancia);
    }, [products, sort]);

    const visibleProductList = sortedProducts.slice(0, visibleProducts);
    const hasMoreProducts = visibleProducts < sortedProducts.length;

    const handleLoadMore = () => {
        setVisibleProducts((current) => current + PRODUCTS_PAGE_SIZE);
    };

    const isEmpty = sortedCombos.length === 0 && sortedProducts.length === 0;

    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title={'Cat\u00e1logo'} />

            <section className="bg-brand-text text-white">
                <div className="w-full px-3 py-2.5 text-center text-[11px] font-light uppercase tracking-[0.18em] sm:px-5 sm:text-sm lg:px-8">
                    {'Nueva colecci\u00f3n'} <span className="mx-2 text-white/40">|</span>
                    <span className="font-semibold">{'oto\u00f1o / invierno 2026'}</span>
                </div>
            </section>

            <section className="border-b border-brand-secondary/20 bg-brand-bg">
                <div className="w-full px-3 sm:px-5 lg:px-8">
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
                <div className="w-full px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
                    {isEmpty ? (
                        <div className="py-24 text-center text-brand-text-muted">
                            <p className="text-sm">No hay prendas ni combos disponibles por el momento.</p>
                        </div>
                    ) : (
                        <div className="space-y-10 sm:space-y-14">
                            {sortedCombos.length > 0 && (
                                <div>
                                    <SectionHeading
                                        title="Combos disponibles"
                                        subtitle={`${sortedCombos.length} ${sortedCombos.length === 1 ? 'combo' : 'combos'}`}
                                    />
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5 xl:gap-5 2xl:grid-cols-6">
                                        {sortedCombos.map((item) => (
                                            <ProductCard key={`${item.type}-${item.id}`} item={item} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {sortedProducts.length > 0 && (
                                <div>
                                    <SectionHeading
                                        title="Prendas"
                                        subtitle={`${sortedProducts.length} ${sortedProducts.length === 1 ? 'prenda' : 'prendas'}`}
                                    />
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5 xl:gap-5 2xl:grid-cols-6">
                                        {visibleProductList.map((item) => (
                                            <ProductCard key={`${item.type}-${item.id}`} item={item} />
                                        ))}
                                    </div>

                                    {hasMoreProducts && (
                                        <div className="mt-8 flex justify-center sm:mt-10">
                                            <button
                                                type="button"
                                                onClick={handleLoadMore}
                                                className="inline-flex h-11 items-center justify-center rounded-md border border-brand-text bg-white px-8 text-[12px] font-extrabold uppercase tracking-[0.18em] text-brand-text shadow-sm transition-colors hover:bg-brand-text hover:text-white"
                                            >
                                                {'Cargar m\u00e1s prendas'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </StorefrontLayout>
    );
}
