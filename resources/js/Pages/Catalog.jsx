import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

const PRODUCTS_PAGE_SIZE = 20;

// ─── Filtros por audiencia ────────────────────────────────────────────────────
// Cada audiencia se define por género + si el talle es de bebé o no.
// "Bebe" toma género Niños con talles que incluyen "bebe"; "Beba" idem para Niñas.
const AUDIENCE_FILTERS = [
    { key: 'nino', label: 'Niño',  gender: 'Niños', baby: false },
    { key: 'nina', label: 'Niña',  gender: 'Niñas', baby: false },
    { key: 'bebe', label: 'Bebé', gender: 'Niños', baby: true  },
    { key: 'beba', label: 'Beba',  gender: 'Niñas', baby: true  },
];

const PRICE_RANGES = [
    { key: 'hasta-30k',  label: 'Hasta $30.000',  min: 0,      max: 30000    },
    { key: 'hasta-50k',  label: 'Hasta $50.000',  min: 0,      max: 50000    },
    { key: 'hasta-75k',  label: 'Hasta $75.000',  min: 0,      max: 75000    },
    { key: 'mas-100k',   label: 'Más de $100.000', min: 100000, max: Infinity },
];

const isBabySize = (name) => /bebe/i.test(String(name ?? ''));

const normalize = (value) =>
    String(value ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');

function matchesAudiences(item, audiences) {
    if (!audiences.length) return true;
    const genders = item.genders ?? [];
    const sizes = item.sizes ?? [];
    return audiences.some((key) => {
        const def = AUDIENCE_FILTERS.find((a) => a.key === key);
        if (!def) return false;
        const hasGender = genders.includes(def.gender);
        if (!hasGender) return false;
        return def.baby
            ? sizes.some((s) => isBabySize(s))
            : sizes.some((s) => !isBabySize(s));
    });
}

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
    const { url } = usePage();
    const [sort, setSort] = useState('relevancia');
    const [sortOpen, setSortOpen] = useState(false);
    const [visibleProducts, setVisibleProducts] = useState(PRODUCTS_PAGE_SIZE);
    const [search, setSearch] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Lee filtros iniciales desde la URL (?audiencia=nino,nina&destacados=1)
    const initialQuery = new URLSearchParams(url.split('?')[1] ?? '');
    const initialAudiences = (initialQuery.get('audiencia') ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((k) => AUDIENCE_FILTERS.some((a) => a.key === k));

    const [audiences, setAudiences] = useState(initialAudiences);          // ['nino', 'nina', 'bebe', 'beba']
    const [onlyFeatured, setOnlyFeatured] = useState(initialQuery.get('destacados') === '1');

    // Derivar priceRange inicial desde precio_min/precio_max en la URL
    const initialPriceRange = (() => {
        const min = Number(initialQuery.get('precio_min')) || 0;
        const max = Number(initialQuery.get('precio_max')) || Infinity;
        return PRICE_RANGES.find((r) => r.min === min && r.max === max)?.key ?? null;
    })();
    const [priceRange, setPriceRange] = useState(initialPriceRange);

    const filtersRef = useRef(null);
    const sortRef = useRef(null);

    // Cerrar popovers al hacer click fuera
    useEffect(() => {
        const handler = (e) => {
            if (filtersOpen && filtersRef.current && !filtersRef.current.contains(e.target)) {
                setFiltersOpen(false);
            }
            if (sortOpen && sortRef.current && !sortRef.current.contains(e.target)) {
                setSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [filtersOpen, sortOpen]);

    const query = new URLSearchParams(url.split('?')[1] ?? '');
    const typeFilter = query.get('tipo');
    const priceDef = PRICE_RANGES.find((r) => r.key === priceRange);

    const filterItem = (item) => {
        if (onlyFeatured && !item.is_featured) return false;
        if (!matchesAudiences(item, audiences)) return false;
        if (search.trim() && !normalize(item.name).includes(normalize(search.trim()))) return false;
        if (priceDef) {
            const price = Number(item.price);
            if (price < priceDef.min || price > priceDef.max) return false;
        }
        return true;
    };

    const sortedCombos = useMemo(() => {
        return [...combos]
            .map((combo) => ({ ...combo, type: 'combo' }))
            .filter(filterItem)
            .sort(SORTERS[sort] ?? SORTERS.relevancia);
    }, [combos, sort, audiences, onlyFeatured, search, priceRange]);

    const sortedProducts = useMemo(() => {
        return [...products]
            .map((product) => ({ ...product, type: 'product' }))
            .filter(filterItem)
            .sort(SORTERS[sort] ?? SORTERS.relevancia);
    }, [products, sort, audiences, onlyFeatured, search, priceRange]);

    const showCombos = typeFilter !== 'productos';
    const showProducts = typeFilter !== 'combos';
    const visibleProductList = sortedProducts.slice(0, visibleProducts);
    const hasMoreProducts = showProducts && visibleProducts < sortedProducts.length;
    const activeFilterCount = audiences.length + (onlyFeatured ? 1 : 0) + (priceRange ? 1 : 0);

    const handleLoadMore = () => {
        setVisibleProducts((current) => current + PRODUCTS_PAGE_SIZE);
    };

    const toggleAudience = (key) => {
        setAudiences((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
        setVisibleProducts(PRODUCTS_PAGE_SIZE);
    };

    const clearFilters = () => {
        setAudiences([]);
        setOnlyFeatured(false);
        setPriceRange(null);
        setVisibleProducts(PRODUCTS_PAGE_SIZE);
    };

    const togglePriceRange = (key) => {
        setPriceRange((prev) => (prev === key ? null : key));
        setVisibleProducts(PRODUCTS_PAGE_SIZE);
    };

    const isEmpty =
        (showCombos ? sortedCombos.length === 0 : true) &&
        (showProducts ? sortedProducts.length === 0 : true);

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
                    <div className="flex flex-wrap items-center gap-2 py-3 text-[11px] uppercase tracking-[0.16em] text-brand-text-muted sm:gap-3">
                        {/* Buscador */}
                        <div className="relative flex-1 min-w-[200px] sm:max-w-sm">
                            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 110-16 8 8 0 010 16z" />
                            </svg>
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setVisibleProducts(PRODUCTS_PAGE_SIZE); }}
                                placeholder="Buscar prenda o combo..."
                                className="h-9 w-full rounded-md border border-brand-secondary/25 bg-white pl-9 pr-9 text-xs font-medium text-brand-text placeholder:text-brand-text-light normal-case tracking-normal shadow-sm transition-colors focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-text-light hover:text-brand-cta"
                                    aria-label="Limpiar búsqueda"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
                            {/* Filtros (modal/popover desplegable) */}
                            <div className="relative" ref={filtersRef}>
                                <button
                                    type="button"
                                    onClick={() => setFiltersOpen((v) => !v)}
                                    className={`inline-flex h-9 items-center gap-2 rounded-md border bg-white px-3 font-semibold shadow-sm transition-colors ${
                                        filtersOpen || activeFilterCount > 0
                                            ? 'border-brand-cta text-brand-cta'
                                            : 'border-brand-secondary/25 text-brand-text hover:border-brand-secondary/45 hover:text-brand-primary'
                                    }`}
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M6 12h12M10 19h4" />
                                    </svg>
                                    Filtros
                                    {activeFilterCount > 0 && (
                                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-cta px-1 text-[10px] font-bold text-white">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                    <svg className={`h-3 w-3 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {filtersOpen && (
                                    <div className="absolute left-0 top-full z-30 mt-2 w-[min(92vw,340px)] origin-top animate-fade-in overflow-hidden rounded-md border border-brand-secondary/30 bg-white shadow-[0_22px_44px_rgba(41,50,65,0.18)]">
                                        <div className="px-4 py-3 border-b border-brand-secondary/20">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-text">Filtros</p>
                                        </div>

                                        {/* Audiencia */}
                                        <div className="px-4 py-4">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted mb-2.5">¿Para quién?</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {AUDIENCE_FILTERS.map((a) => {
                                                    const active = audiences.includes(a.key);
                                                    return (
                                                        <button
                                                            key={a.key}
                                                            type="button"
                                                            onClick={() => toggleAudience(a.key)}
                                                            className={`flex h-10 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-semibold normal-case tracking-normal transition-all ${
                                                                active
                                                                    ? 'border-brand-cta bg-brand-cta text-white shadow-sm'
                                                                    : 'border-brand-secondary/40 bg-white text-brand-text hover:border-brand-cta/50 hover:text-brand-cta'
                                                            }`}
                                                        >
                                                            {active && (
                                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                            {a.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Precio */}
                                        <div className="px-4 pb-4">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted mb-2.5">Precio</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {PRICE_RANGES.map((r) => {
                                                    const active = priceRange === r.key;
                                                    return (
                                                        <button
                                                            key={r.key}
                                                            type="button"
                                                            onClick={() => togglePriceRange(r.key)}
                                                            className={`flex h-10 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-semibold normal-case tracking-normal transition-all ${
                                                                active
                                                                    ? 'border-brand-cta bg-brand-cta text-white shadow-sm'
                                                                    : 'border-brand-secondary/40 bg-white text-brand-text hover:border-brand-cta/50 hover:text-brand-cta'
                                                            }`}
                                                        >
                                                            {active && (
                                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                            {r.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Destacados */}
                                        <div className="px-4 pb-4">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted mb-2.5">Recomendaciones</p>
                                            <button
                                                type="button"
                                                onClick={() => { setOnlyFeatured((v) => !v); setVisibleProducts(PRODUCTS_PAGE_SIZE); }}
                                                className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-xs font-semibold normal-case tracking-normal transition-all ${
                                                    onlyFeatured
                                                        ? 'border-brand-cta bg-brand-cta/10 text-brand-cta'
                                                        : 'border-brand-secondary/40 bg-white text-brand-text hover:border-brand-cta/50'
                                                }`}
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    <svg className="h-4 w-4" fill={onlyFeatured ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                                    </svg>
                                                    Solo destacados
                                                </span>
                                                <span className={`relative inline-block h-5 w-9 rounded-full transition-colors ${onlyFeatured ? 'bg-brand-cta' : 'bg-brand-secondary'}`}>
                                                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${onlyFeatured ? 'left-4' : 'left-0.5'}`} />
                                                </span>
                                            </button>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex items-center justify-between gap-2 border-t border-brand-secondary/20 bg-brand-secondary-light/40 px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={clearFilters}
                                                disabled={activeFilterCount === 0}
                                                className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted transition-colors hover:text-brand-cta disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Limpiar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFiltersOpen(false)}
                                                className="inline-flex h-9 items-center justify-center bg-brand-text px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-brand-primary"
                                            >
                                                Ver resultados
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Ordenar */}
                            <div className="relative" ref={sortRef}>
                                <button
                                    type="button"
                                    onClick={() => setSortOpen((value) => !value)}
                                    className="inline-flex h-9 items-center gap-2 rounded-md border border-brand-secondary/25 bg-white px-3 font-semibold text-brand-text shadow-sm transition-colors hover:border-brand-secondary/45 hover:text-brand-primary"
                                >
                                    <span className="hidden sm:inline">Ordenar por:</span>
                                    <span className="font-semibold text-brand-text">{SORT_LABELS[sort]}</span>
                                    <svg className={`h-3 w-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {sortOpen && (
                                    <div className="absolute right-0 top-full z-20 mt-2 w-56 origin-top animate-fade-in overflow-hidden rounded-md border border-brand-secondary/30 bg-white shadow-[0_18px_38px_rgba(41,50,65,0.14)]">
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
                            {showCombos && sortedCombos.length > 0 && (
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

                            {showProducts && sortedProducts.length > 0 && (
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
