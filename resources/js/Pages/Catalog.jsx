import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

const PRODUCTS_PAGE_SIZE = 20;

const AUDIENCE_FILTERS = [
    { key: 'nino', label: 'Niño',  gender: 'Niños', baby: false },
    { key: 'nina', label: 'Niña',  gender: 'Niñas', baby: false },
    { key: 'bebe', label: 'Bebé',  gender: 'Niños', baby: true  },
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
            <article className="store-card flex h-full flex-col border-brand-primary/35 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-[0_16px_34px_rgba(41,50,65,0.10)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-white">
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
                        <span className="absolute left-3 top-3 rounded-md bg-brand-cta px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-sm">
                            New
                        </span>
                    )}

                    {item.type === 'combo' && (
                        <span className="absolute right-3 top-3 rounded-md bg-brand-text px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-sm">
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

// Chip inline para la fila de audiencia en desktop
function FilterChip({ label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold normal-case tracking-normal transition-all shadow-sm ${
                active
                    ? 'border-brand-cta bg-brand-cta text-white'
                    : 'border-brand-secondary/30 bg-white text-brand-text hover:border-brand-cta/50 hover:text-brand-cta'
            }`}
        >
            {active && (
                <svg className="h-2.5 w-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            )}
            {label}
        </button>
    );
}

// Carrusel paginado 2×2 para la modal
function FilterCarousel({ items, selected, onToggle }) {
    const ITEMS_PER_PAGE = 4;
    const [page, setPage] = useState(0);
    const touchStartX = useRef(null);

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const currentItems = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
    const canPrev = page > 0;
    const canNext = page < totalPages - 1;

    const goNext = () => { if (canNext) setPage((p) => p + 1); };
    const goPrev = () => { if (canPrev) setPage((p) => p - 1); };

    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (delta > 40) goNext();
        else if (delta < -40) goPrev();
        touchStartX.current = null;
    };

    if (items.length === 0) return null;

    return (
        <div>
            <div className="flex items-center gap-2">
                {totalPages > 1 && (
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={!canPrev}
                        className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-brand-secondary/40 bg-white text-brand-text-muted transition-colors hover:border-brand-cta/50 hover:text-brand-cta disabled:opacity-25 disabled:cursor-default"
                        aria-label="Anterior"
                    >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                <div
                    className={`${totalPages > 1 ? 'flex-1' : 'w-full'} grid grid-cols-2 gap-1.5`}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {currentItems.map((item) => {
                        const active = selected.includes(item);
                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onToggle(item)}
                                className={`flex h-9 w-full items-center justify-center gap-1 rounded-md border text-xs font-semibold normal-case tracking-normal transition-all ${
                                    active
                                        ? 'border-brand-cta bg-brand-cta text-white shadow-sm'
                                        : 'border-brand-secondary/40 bg-white text-brand-text hover:border-brand-cta/50 hover:text-brand-cta'
                                }`}
                            >
                                {active && (
                                    <svg className="h-2.5 w-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                <span className="truncate px-1">{item}</span>
                            </button>
                        );
                    })}
                    {Array.from({ length: ITEMS_PER_PAGE - currentItems.length }).map((_, i) => (
                        <div key={`ph-${i}`} className="h-9" />
                    ))}
                </div>

                {totalPages > 1 && (
                    <button
                        type="button"
                        onClick={goNext}
                        disabled={!canNext}
                        className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-brand-secondary/40 bg-white text-brand-text-muted transition-colors hover:border-brand-cta/50 hover:text-brand-cta disabled:opacity-25 disabled:cursor-default"
                        aria-label="Siguiente"
                    >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-2.5 flex justify-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setPage(i)}
                            className={`h-1.5 rounded-full transition-all ${
                                i === page ? 'w-4 bg-brand-cta' : 'w-1.5 bg-brand-secondary/40 hover:bg-brand-secondary/60'
                            }`}
                            aria-label={`Página ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Panel de filtros compartido entre mobile y desktop
function FiltersPanel({ setFiltersOpen, allSizes, selectedSizes, toggleSize, allCategories, selectedCategories, toggleCategory, priceRange, togglePriceRange, onlyFeatured, setOnlyFeatured, clearFilters, activeFilterCount, setVisibleProducts }) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl sm:absolute sm:inset-auto sm:left-0 sm:bottom-auto sm:top-full sm:z-30 sm:mt-2 sm:w-[min(92vw,340px)] sm:rounded-md overflow-hidden border border-brand-secondary/30 bg-white shadow-[0_22px_44px_rgba(41,50,65,0.18)] animate-fade-in">
            {/* Handle mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-brand-secondary/30" />
            </div>

            {/* Header */}
            <div className="px-4 py-3 border-b border-brand-secondary/20 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-text">Filtros</p>
                <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="sm:hidden flex h-7 w-7 items-center justify-center rounded-full text-brand-text-muted hover:bg-brand-secondary/20 hover:text-brand-text"
                    aria-label="Cerrar filtros"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Contenido con scroll */}
            <div className="overflow-y-auto max-h-[60vh] sm:max-h-none">
                {allSizes.length > 0 && (
                    <div className="px-4 py-4 border-b border-brand-secondary/10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted mb-3">Talle</p>
                        <FilterCarousel items={allSizes} selected={selectedSizes} onToggle={toggleSize} />
                    </div>
                )}

                {allCategories.length > 0 && (
                    <div className="px-4 py-4 border-b border-brand-secondary/10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted mb-3">Categoría</p>
                        <FilterCarousel items={allCategories} selected={selectedCategories} onToggle={toggleCategory} />
                    </div>
                )}

                <div className="px-4 py-4 border-b border-brand-secondary/10">
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

                <div className="px-4 py-4">
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
            </div>

            {/* Footer */}
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
                    className="inline-flex h-9 items-center justify-center rounded-md bg-brand-text px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-brand-primary"
                >
                    Ver resultados
                </button>
            </div>
        </div>
    );
}

export default function Catalog({ combos = [], products = [], cartCount, allSizes = [], allCategories = [] }) {
    const { url } = usePage();
    const [sort, setSort] = useState('relevancia');
    const [sortOpen, setSortOpen] = useState(false);
    const [visibleProducts, setVisibleProducts] = useState(PRODUCTS_PAGE_SIZE);
    const [search, setSearch] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);

    const initialQuery = new URLSearchParams(url.split('?')[1] ?? '');

    const [audiences, setAudiences] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [onlyFeatured, setOnlyFeatured] = useState(initialQuery.get('destacados') === '1');

    const initialPriceRange = (() => {
        const min = Number(initialQuery.get('precio_min')) || 0;
        const max = Number(initialQuery.get('precio_max')) || Infinity;
        return PRICE_RANGES.find((r) => r.min === min && r.max === max)?.key ?? null;
    })();
    const [priceRange, setPriceRange] = useState(initialPriceRange);

    // Lock body scroll cuando el panel de filtros está abierto en mobile
    useEffect(() => {
        document.body.style.overflow = filtersOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [filtersOpen]);

    // Cerrar sort al hacer click fuera (el container del sort usa stopPropagation en onMouseDown)
    useEffect(() => {
        if (!sortOpen) return;
        const handler = () => setSortOpen(false);
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [sortOpen]);

    const query = new URLSearchParams(url.split('?')[1] ?? '');
    const typeFilter = query.get('tipo');
    const priceDef = PRICE_RANGES.find((r) => r.key === priceRange);

    const filterItem = (item) => {
        if (!matchesAudiences(item, audiences)) return false;
        if (onlyFeatured && !item.is_featured) return false;
        if (search.trim() && !normalize(item.name).includes(normalize(search.trim()))) return false;
        if (priceDef) {
            const price = Number(item.price);
            if (price < priceDef.min || price > priceDef.max) return false;
        }
        if (selectedSizes.length > 0) {
            const itemSizes = item.sizes ?? [];
            if (!selectedSizes.some((s) => itemSizes.includes(s))) return false;
        }
        if (selectedCategories.length > 0 && item.type !== 'combo') {
            const itemCategories = item.categories ?? [];
            if (!selectedCategories.some((c) => itemCategories.includes(c))) return false;
        }
        return true;
    };

    const sortedCombos = useMemo(() => {
        return [...combos]
            .map((combo) => ({ ...combo, type: 'combo' }))
            .filter(filterItem)
            .sort(SORTERS[sort] ?? SORTERS.relevancia);
    }, [combos, sort, audiences, selectedSizes, selectedCategories, onlyFeatured, search, priceRange]);

    const sortedProducts = useMemo(() => {
        return [...products]
            .map((product) => ({ ...product, type: 'product' }))
            .filter(filterItem)
            .sort(SORTERS[sort] ?? SORTERS.relevancia);
    }, [products, sort, audiences, selectedSizes, selectedCategories, onlyFeatured, search, priceRange]);

    const showCombos = typeFilter !== 'productos';
    const showProducts = typeFilter !== 'combos';
    const visibleProductList = sortedProducts.slice(0, visibleProducts);
    const hasMoreProducts = showProducts && visibleProducts < sortedProducts.length;
    const activeFilterCount =
        selectedSizes.length + selectedCategories.length + (onlyFeatured ? 1 : 0) + (priceRange ? 1 : 0);

    const handleLoadMore = () => setVisibleProducts((c) => c + PRODUCTS_PAGE_SIZE);

    const toggleAudience = (key) => {
        setAudiences((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
        setVisibleProducts(PRODUCTS_PAGE_SIZE);
    };

    const toggleSize = (size) => {
        setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
        setVisibleProducts(PRODUCTS_PAGE_SIZE);
    };

    const toggleCategory = (cat) => {
        setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
        setVisibleProducts(PRODUCTS_PAGE_SIZE);
    };

    const clearFilters = () => {
        setSelectedSizes([]);
        setSelectedCategories([]);
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

    const filtersPanelProps = {
        setFiltersOpen,
        allSizes, selectedSizes, toggleSize,
        allCategories, selectedCategories, toggleCategory,
        priceRange, togglePriceRange,
        onlyFeatured, setOnlyFeatured,
        clearFilters, activeFilterCount, setVisibleProducts,
    };

    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title={'Catálogo'} />

            <section className="bg-brand-text text-white">
                <div className="w-full px-3 py-2.5 text-center text-[11px] font-light uppercase tracking-[0.18em] sm:px-5 sm:text-sm lg:px-8">
                    {'Nueva colección'} <span className="mx-2 text-white/40">|</span>
                    <span className="font-semibold">{'otoño / invierno 2026'}</span>
                </div>
            </section>

            <section className="border-b border-brand-secondary/20 bg-brand-bg">
                <div className="w-full px-3 sm:px-5 lg:px-8">

                    {/* ── LAYOUT MOBILE (oculto en sm+) ── */}
                    <div className="sm:hidden py-4 flex flex-col gap-3">
                        {/* Buscador grande */}
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 110-16 8 8 0 010 16z" />
                            </svg>
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setVisibleProducts(PRODUCTS_PAGE_SIZE); }}
                                placeholder="Buscar prenda o combo..."
                                className="h-14 w-full rounded-2xl border border-brand-secondary/30 bg-white pl-11 pr-10 text-sm font-medium text-brand-text placeholder:text-brand-text-light normal-case tracking-normal shadow-sm transition-colors focus:border-brand-cta focus:outline-none focus:ring-2 focus:ring-brand-cta/20"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-light hover:text-brand-cta"
                                    aria-label="Limpiar búsqueda"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Audiencia — grilla 2×2 */}
                        <div className="grid grid-cols-2 gap-2.5">
                            {AUDIENCE_FILTERS.map((a) => {
                                const active = audiences.includes(a.key);
                                return (
                                    <button
                                        key={a.key}
                                        type="button"
                                        onClick={() => toggleAudience(a.key)}
                                        className={`flex h-14 items-center justify-center gap-2 rounded-2xl border text-[15px] font-semibold normal-case tracking-normal transition-all ${
                                            active
                                                ? 'border-brand-cta bg-brand-cta text-white shadow-md'
                                                : 'border-brand-secondary/30 bg-white text-brand-text shadow-sm hover:border-brand-cta/40 hover:text-brand-cta'
                                        }`}
                                    >
                                        {active && (
                                            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                        {a.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Fila inferior: Ordenar + Mostrar filtros */}
                        <div className="flex gap-2.5">
                            {/* Sort compacto */}
                            <div className="relative flex-shrink-0" onMouseDown={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    onClick={() => setSortOpen((v) => !v)}
                                    className="flex h-14 items-center gap-2 rounded-2xl border border-brand-secondary/30 bg-white px-4 text-sm font-semibold text-brand-text shadow-sm transition-colors hover:border-brand-secondary/50"
                                >
                                    <svg className="h-4 w-4 text-brand-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M7 12h10M11 17h4" />
                                    </svg>
                                    <span className="normal-case tracking-normal">Ordenar</span>
                                    <svg className={`h-3.5 w-3.5 text-brand-text-muted transition-transform ${sortOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {sortOpen && (
                                    <div
                                        className="absolute left-0 top-full z-20 mt-1.5 w-52 origin-top animate-fade-in overflow-hidden rounded-xl border border-brand-secondary/30 bg-white shadow-[0_18px_38px_rgba(41,50,65,0.14)]"
                                    >
                                        {Object.entries(SORT_LABELS).map(([key, label]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => { setSort(key); setSortOpen(false); }}
                                                className={`block w-full px-4 py-3 text-left text-sm normal-case tracking-normal transition-colors hover:bg-brand-primary-surface ${
                                                    key === sort ? 'font-semibold text-brand-cta' : 'text-brand-text'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Botón principal Mostrar filtros */}
                            <button
                                type="button"
                                onClick={() => setFiltersOpen(true)}
                                className="relative flex flex-1 h-14 items-center justify-center gap-2.5 rounded-2xl bg-brand-cta text-[15px] font-bold normal-case tracking-normal text-white shadow-md transition-all active:scale-[0.98]"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M6 12h12M10 19h4" />
                                </svg>
                                Mostrar filtros
                                {activeFilterCount > 0 && (
                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-extrabold text-brand-cta">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Panel de filtros mobile */}
                        {filtersOpen && (
                            <>
                                <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setFiltersOpen(false)} />
                                <FiltersPanel {...filtersPanelProps} />
                            </>
                        )}
                    </div>

                    {/* ── LAYOUT DESKTOP (oculto en mobile) ── */}
                    <div className="hidden sm:block">
                        {/* Fila 1: Buscador + Filtros + Ordenar */}
                        <div className="flex flex-wrap items-center gap-2 py-3 text-[11px] uppercase tracking-[0.16em] text-brand-text-muted sm:gap-3">
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
                                {/* Filtros */}
                                <div className="relative">
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
                                        <>
                                            <div className="fixed inset-0 z-20" onClick={() => setFiltersOpen(false)} />
                                            <FiltersPanel {...filtersPanelProps} />
                                        </>
                                    )}
                                </div>

                                {/* Ordenar */}
                                <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        onClick={() => setSortOpen((v) => !v)}
                                        className="inline-flex h-9 items-center gap-2 rounded-md border border-brand-secondary/25 bg-white px-3 font-semibold text-brand-text shadow-sm transition-colors hover:border-brand-secondary/45 hover:text-brand-primary"
                                    >
                                        <span className="hidden sm:inline">Ordenar por:</span>
                                        <span className="font-semibold text-brand-text">{SORT_LABELS[sort]}</span>
                                        <svg className={`h-3 w-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {sortOpen && (
                                        <div
                                            className="absolute right-0 top-full z-20 mt-2 w-56 origin-top animate-fade-in overflow-hidden rounded-md border border-brand-secondary/30 bg-white shadow-[0_18px_38px_rgba(41,50,65,0.14)]"
                                        >
                                            {Object.entries(SORT_LABELS).map(([key, label]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => { setSort(key); setSortOpen(false); }}
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

                        {/* Fila 2: Audiencia quick-filters */}
                        <div className="flex items-center gap-2 pb-3 overflow-x-auto">
                            <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">
                                Para:
                            </span>
                            {AUDIENCE_FILTERS.map((a) => (
                                <FilterChip
                                    key={a.key}
                                    label={a.label}
                                    active={audiences.includes(a.key)}
                                    onClick={() => toggleAudience(a.key)}
                                />
                            ))}
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
                                                {'Cargar más prendas'}
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
