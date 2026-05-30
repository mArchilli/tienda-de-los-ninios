import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR');
}

function pickKey(productId, sizeId) {
    return `${productId}-${sizeId}`;
}

function ProductPickerCard({ product, size, quantity, totalRemaining, categoryRemaining, onAdd, onRemove, onImageClick }) {
    const atStock      = quantity >= product.stock;
    const catBlocked   = categoryRemaining != null && categoryRemaining <= 0;
    const noCapacity   = (totalRemaining <= 0 || catBlocked) && quantity === 0;
    const canAdd       = !atStock && totalRemaining > 0 && !catBlocked;

    return (
        <div
            className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[1.55rem] bg-white transition-all duration-300 ${
                quantity > 0
                    ? 'border-2 border-brand-cta shadow-[0_14px_30px_rgba(255,90,78,0.18)] -translate-y-0.5'
                    : 'border border-brand-secondary/60 shadow-[0_8px_20px_rgba(41,50,65,0.05)] hover:-translate-y-0.5 hover:border-brand-cta/50 hover:shadow-[0_14px_28px_rgba(41,50,65,0.10)]'
            }`}
        >
            <button
                type="button"
                onClick={onImageClick}
                disabled={!product.image}
                aria-label={product.image ? `Ampliar imagen de ${product.name}` : 'Imagen no disponible'}
                className="relative block aspect-[4/5] w-full overflow-hidden bg-brand-secondary-light rounded-t-[1.4rem] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2 disabled:cursor-default"
            >
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-primary-surface">
                        <svg className="h-10 w-10 text-brand-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {quantity > 0 && (
                    <span className="absolute top-2.5 right-2.5 inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-brand-cta px-2 text-[12px] font-bold text-white shadow">
                        ×{quantity}
                    </span>
                )}

                <span className="absolute top-2.5 left-2.5 inline-flex h-6 items-center rounded-full bg-brand-text px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    Talle {size.name}
                </span>

                {product.image && (
                    <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-brand-text/75 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 7v8M7 11h8M11 19a8 8 0 110-16 8 8 0 010 16z" />
                        </svg>
                        Ampliar
                    </span>
                )}

                {quantity > 0 && (
                    <div className="pointer-events-none absolute inset-0 bg-brand-cta/5" />
                )}
            </button>

            <div className="flex flex-1 flex-col px-3 py-3">
                <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-brand-text">
                    {product.name}
                </p>
                {product.category_name && (
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-brand-text-light">
                        {product.category_name}
                    </p>
                )}
                <p className="mt-1 text-[11px] text-brand-text-muted">
                    Stock: <span className="font-semibold text-brand-text">{product.stock}</span>
                </p>

                <div className="mt-3 flex items-center justify-between gap-2">
                    {quantity === 0 ? (
                        <button
                            type="button"
                            onClick={onAdd}
                            disabled={noCapacity}
                            className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-cta text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-brand-cta-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar
                        </button>
                    ) : (
                        <div className="flex h-9 w-full items-center justify-between gap-2 rounded-full border border-brand-cta/40 overflow-hidden">
                            <button
                                type="button"
                                onClick={onRemove}
                                className="h-full w-9 flex items-center justify-center text-brand-cta hover:bg-brand-cta hover:text-white transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                </svg>
                            </button>
                            <span className="flex-1 text-center text-sm font-bold text-brand-text">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={onAdd}
                                disabled={!canAdd}
                                className="h-full w-9 flex items-center justify-center text-brand-cta hover:bg-brand-cta hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-brand-cta"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Carousel paginado de chips (mobile) ──────────────────────────────────────

function FilterChipCarousel({ items, selectedIds, onToggle, labelPrefix = '' }) {
    const ITEMS_PER_PAGE = 4;
    const [page, setPage] = useState(0);
    const touchStartX = useRef(null);

    const totalPages   = Math.ceil(items.length / ITEMS_PER_PAGE);
    const currentItems = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
    const canPrev      = page > 0;
    const canNext      = page < totalPages - 1;

    const goNext = () => { if (canNext) setPage((p) => p + 1); };
    const goPrev = () => { if (canPrev) setPage((p) => p - 1); };

    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd   = (e) => {
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
                        className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-brand-cta/35 bg-white text-brand-text-muted transition-colors hover:border-brand-cta hover:text-brand-cta disabled:opacity-25 disabled:cursor-default"
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
                    {currentItems.map((it) => {
                        const active = selectedIds.includes(it.id);
                        return (
                            <button
                                key={it.id}
                                type="button"
                                onClick={() => onToggle(it.id)}
                                className={`flex h-9 w-full items-center justify-center gap-1 rounded-full border text-xs font-semibold transition-all ${
                                    active
                                        ? 'border-brand-cta bg-brand-cta text-white shadow-sm'
                                        : 'border-brand-cta/35 bg-white text-brand-text hover:border-brand-cta hover:text-brand-cta'
                                }`}
                            >
                                {active && (
                                    <svg className="h-2.5 w-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                <span className="truncate px-1">{labelPrefix}{it.name}</span>
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
                        className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-brand-cta/35 bg-white text-brand-text-muted transition-colors hover:border-brand-cta hover:text-brand-cta disabled:opacity-25 disabled:cursor-default"
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
                                i === page ? 'w-4 bg-brand-cta' : 'w-1.5 bg-brand-cta/20 hover:bg-brand-cta/40'
                            }`}
                            aria-label={`Página ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}


export default function ComboEmprendedorShow({ combo, cartCount = 0 }) {
    const [picksMap, setPicksMap]   = useState({});
    const [feedback, setFeedback]   = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [search, setSearch]                       = useState('');
    const [selectedSizeIds, setSelectedSizeIds]     = useState([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [expandedKeys, setExpandedKeys]           = useState(new Set());

    const [previewSlides, setPreviewSlides] = useState([]);
    const [previewIndex, setPreviewIndex]   = useState(-1);

    const openPreview = (product) => {
        const imgs = product.images?.length ? product.images : (product.image ? [product.image] : []);
        if (!imgs.length) return;
        setPreviewSlides(imgs.map((src) => ({ src, alt: product.name })));
        setPreviewIndex(0);
    };

    useEffect(() => {
        setPicksMap({});
        setFeedback(null);
        setSearch('');
        setSelectedSizeIds([]);
        setSelectedCategoryIds([]);
        setExpandedKeys(new Set());
        setPreviewSlides([]);
        setPreviewIndex(-1);
    }, [combo.id]);

    const toggleExpanded = (sizeId, categoryId) => {
        const key = `${sizeId}-${categoryId}`;
        setExpandedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const isCategoryOpen = (sizeId, categoryId) => {
        return expandedKeys.has(`${sizeId}-${categoryId}`);
    };

    const toggleSizeFilter = (sizeId) => {
        setSelectedSizeIds((prev) =>
            prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId]
        );
    };

    const toggleCategoryFilter = (categoryId) => {
        setSelectedCategoryIds((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedSizeIds([]);
        setSelectedCategoryIds([]);
    };

    const availableCategories = useMemo(() => {
        const seen = new Map();
        combo.sizes_groups.forEach((g) => {
            g.products.forEach((p) => {
                if (p.category_id && !seen.has(p.category_id)) {
                    seen.set(p.category_id, { id: p.category_id, name: p.category_name ?? 'Sin categoría' });
                }
            });
        });
        return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }, [combo.sizes_groups]);

    const filteredGroups = useMemo(() => {
        const q = search.trim().toLowerCase();
        return combo.sizes_groups
            .filter((g) => selectedSizeIds.length === 0 || selectedSizeIds.includes(g.id))
            .map((g) => {
                const products = g.products.filter((p) => {
                    if (q && !p.name.toLowerCase().includes(q)) return false;
                    if (selectedCategoryIds.length > 0 && !selectedCategoryIds.includes(p.category_id)) return false;
                    return true;
                });

                const byCategory = new Map();
                products.forEach((p) => {
                    const key = p.category_id ?? 0;
                    if (!byCategory.has(key)) {
                        byCategory.set(key, { id: key, name: p.category_name ?? 'Sin categoría', products: [] });
                    }
                    byCategory.get(key).products.push(p);
                });
                const categories = Array.from(byCategory.values())
                    .sort((a, b) => a.name.localeCompare(b.name, 'es'));

                return { ...g, products, categories };
            })
            .filter((g) => g.products.length > 0);
    }, [combo.sizes_groups, search, selectedSizeIds, selectedCategoryIds]);

    const hasFilters           = !!search.trim() || selectedSizeIds.length > 0 || selectedCategoryIds.length > 0;
    const visibleProductCount  = filteredGroups.reduce((s, g) => s + g.products.length, 0);

    useEffect(() => {
        if (!feedback) return;
        const t = setTimeout(() => setFeedback(null), 2800);
        return () => clearTimeout(t);
    }, [feedback]);

    const totalSelected = useMemo(
        () => Object.values(picksMap).reduce((sum, p) => sum + p.quantity, 0),
        [picksMap]
    );

    const remaining  = combo.max_items - totalSelected;
    const isMaxed    = combo.max_items > 0 && totalSelected >= combo.max_items;

    const categoryLimits = combo.category_limits ?? [];
    const hasCategoryLimits = categoryLimits.length > 0;

    const limitsByCat = useMemo(() => {
        const m = {};
        categoryLimits.forEach((cl) => { m[cl.category_id] = cl.max_items; });
        return m;
    }, [categoryLimits]);

    const productCategoryMap = useMemo(() => {
        const m = {};
        combo.sizes_groups.forEach((g) => g.products.forEach((p) => {
            if (m[p.id] == null && p.category_id != null) m[p.id] = p.category_id;
        }));
        return m;
    }, [combo.sizes_groups]);

    const picksByCategory = useMemo(() => {
        const counts = {};
        Object.values(picksMap).forEach((p) => {
            const cat = productCategoryMap[p.product_id];
            if (cat == null) return;
            counts[cat] = (counts[cat] ?? 0) + p.quantity;
        });
        return counts;
    }, [picksMap, productCategoryMap]);

    const allCategoriesWithinLimits = useMemo(() => {
        if (!hasCategoryLimits) return true;
        return categoryLimits.every((cl) => (picksByCategory[cl.category_id] ?? 0) <= cl.max_items);
    }, [hasCategoryLimits, categoryLimits, picksByCategory]);

    const canSubmit  = totalSelected >= 1 && totalSelected <= combo.max_items && allCategoriesWithinLimits && !submitting;

    const cartButtonRef = useRef(null);

    useEffect(() => {
        if (!isMaxed) return;
        setExpandedKeys(new Set());
        const t = setTimeout(() => {
            const btn = cartButtonRef.current;
            if (!btn) return;
            btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            btn.focus({ preventScroll: true });
        }, 150);
        return () => clearTimeout(t);
    }, [isMaxed]);

    // Auto-expandir cuando se ACTIVA un filtro de categoría (en transición),
    // pero permitiendo después que el usuario colapse manualmente.
    const prevSelectedCatFilterRef = useRef([]);
    useEffect(() => {
        const newlyAdded = selectedCategoryIds.filter(
            (id) => !prevSelectedCatFilterRef.current.includes(id)
        );
        if (newlyAdded.length > 0) {
            setExpandedKeys((prev) => {
                const next = new Set(prev);
                combo.sizes_groups.forEach((g) => {
                    newlyAdded.forEach((cid) => next.add(`${g.id}-${cid}`));
                });
                return next;
            });
        }
        prevSelectedCatFilterRef.current = selectedCategoryIds;
    }, [selectedCategoryIds, combo.sizes_groups]);

    // Auto-expandir cuando la búsqueda PASA a no-vacía (sólo en la transición).
    const prevSearchActiveRef = useRef(false);
    useEffect(() => {
        const active = search.trim().length > 0;
        if (active && !prevSearchActiveRef.current) {
            const q = search.trim().toLowerCase();
            setExpandedKeys((prev) => {
                const next = new Set(prev);
                combo.sizes_groups.forEach((g) => {
                    g.products.forEach((p) => {
                        if (p.category_id != null && p.name.toLowerCase().includes(q)) {
                            next.add(`${g.id}-${p.category_id}`);
                        }
                    });
                });
                return next;
            });
        }
        prevSearchActiveRef.current = active;
    }, [search, combo.sizes_groups]);

    // Auto-colapsar cuando una categoría se completa (transición de "no llena" a "llena").
    const prevFullCatIdsRef = useRef(new Set());
    useEffect(() => {
        if (!hasCategoryLimits) return;
        const currentFull = new Set(
            categoryLimits
                .filter((cl) => (picksByCategory[cl.category_id] ?? 0) >= cl.max_items)
                .map((cl) => cl.category_id)
        );
        const justFilledIds = [];
        currentFull.forEach((id) => {
            if (!prevFullCatIdsRef.current.has(id)) justFilledIds.push(id);
        });

        if (justFilledIds.length > 0 && !isMaxed) {
            setExpandedKeys(new Set());
            const names = categoryLimits
                .filter((cl) => justFilledIds.includes(cl.category_id))
                .map((cl) => cl.category_name)
                .filter(Boolean);
            if (names.length > 0) {
                setFeedback(
                    `✓ Completaste ${names.join(' y ')}. Elegí prendas de otra categoría.`
                );
            }
        }

        prevFullCatIdsRef.current = currentFull;
    }, [picksByCategory, categoryLimits, hasCategoryLimits, isMaxed]);

    const addOne = (product, size) => {
        const key = pickKey(product.id, size.id);
        setPicksMap((prev) => {
            const existing    = prev[key];
            const currentQty  = existing?.quantity ?? 0;
            if (currentQty >= product.stock) return prev;
            const totalNow    = Object.values(prev).reduce((s, p) => s + p.quantity, 0);
            if (totalNow >= combo.max_items) return prev;

            const catId = productCategoryMap[product.id];
            if (hasCategoryLimits && catId != null && limitsByCat[catId] != null) {
                const catCount = Object.values(prev).reduce((s, p) => {
                    if (productCategoryMap[p.product_id] === catId) return s + p.quantity;
                    return s;
                }, 0);
                if (catCount >= limitsByCat[catId]) return prev;
            }

            return {
                ...prev,
                [key]: { product_id: product.id, size_id: size.id, size_name: size.name, quantity: currentQty + 1 },
            };
        });
    };

    const removeOne = (product, size) => {
        const key = pickKey(product.id, size.id);
        setPicksMap((prev) => {
            const existing = prev[key];
            if (!existing) return prev;
            if (existing.quantity <= 1) {
                const { [key]: _omit, ...rest } = prev;
                return rest;
            }
            return { ...prev, [key]: { ...existing, quantity: existing.quantity - 1 } };
        });
    };

    const clearAll = () => setPicksMap({});

    const handleAdd = () => {
        if (!canSubmit) return;
        setSubmitting(true);

        const picks = [];
        for (const p of Object.values(picksMap)) {
            for (let i = 0; i < p.quantity; i++) {
                picks.push({ product_id: p.product_id, size_id: p.size_id });
            }
        }

        router.post('/carrito/combo-emprendedor', {
            combo_emprendedor_id: combo.id,
            picks,
            quantity: 1,
        }, {
            preserveScroll: true,
            preserveState:  true,
            onSuccess: () => {
                setFeedback(`✓ ${combo.name} agregado al carrito.`);
                setPicksMap({});
            },
            onError: (errs) => {
                const msg = errs?.picks ?? 'No pudimos agregar el combo. Intentá de nuevo.';
                setFeedback(msg);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const summaryByPick = Object.values(picksMap);

    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title={`${combo.name} · Combo Emprendedor`} />

            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                {/* Breadcrumb */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <nav className="inline-flex flex-wrap items-center rounded-full border border-brand-cta/45 bg-white/88 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-brand-text-muted shadow-sm backdrop-blur">
                        <Link href="/" className="hover:text-brand-text transition-colors">Inicio</Link>
                        <span className="mx-2 text-brand-text-light">/</span>
                        <Link href="/catalogo" className="hover:text-brand-text transition-colors">Catálogo</Link>
                        <span className="mx-2 text-brand-text-light">/</span>
                        <span className="text-brand-text font-semibold">{combo.name}</span>
                    </nav>
                    <Link
                        href="/catalogo"
                        className="inline-flex items-center gap-2 rounded-full border border-brand-cta/45 bg-white/88 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-text shadow-sm backdrop-blur transition-all hover:-translate-x-0.5 hover:border-brand-cta hover:text-brand-cta"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver al catálogo
                    </Link>
                </div>

                {/* Hero */}
                <header className="grid grid-cols-1 lg:grid-cols-[minmax(0,460px)_1fr] gap-8 lg:gap-14 items-start">
                    <div className="relative overflow-hidden rounded-[1.9rem] bg-brand-secondary-light border border-brand-cta/30 shadow-[0_18px_40px_rgba(41,50,65,0.08)]">
                        <div className="aspect-[4/5] w-full">
                            {combo.image ? (
                                <img src={combo.image} alt={combo.name} className="h-full w-full object-contain" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-brand-primary-surface">
                                    <svg className="h-16 w-16 text-brand-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-brand-text px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white shadow-md">
                            Combo Emprendedor
                        </span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-[1.9rem] border border-brand-cta/25 bg-white p-6 shadow-[0_18px_36px_rgba(41,50,65,0.06)] sm:p-7">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-brand-cta font-bold">
                                Para revendedores · Armá tu pack
                            </p>
                            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-brand-text leading-[1.05]">
                                {combo.name}
                            </h1>

                            <div className="mt-5 flex items-baseline gap-3">
                                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-cta leading-none">
                                    {fmt(combo.price)}
                                </span>
                                <span className="text-xs uppercase tracking-[0.18em] text-brand-text-muted font-semibold">
                                    Precio final
                                </span>
                            </div>

                            {combo.description && (
                                <p className="mt-5 text-base leading-relaxed text-brand-text-muted whitespace-pre-line max-w-xl">
                                    {combo.description}
                                </p>
                            )}

                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-[1.2rem] border border-brand-cta/20 bg-brand-cta/5 px-4 py-3">
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-brand-text-muted font-semibold">
                                        Hasta
                                    </p>
                                    <p className="mt-1 text-xl font-extrabold text-brand-text">
                                        {combo.max_items} prendas
                                    </p>
                                </div>
                                <div className="rounded-[1.2rem] border border-brand-cta/20 bg-brand-cta/5 px-4 py-3">
                                    <p className="text-[10px] uppercase tracking-[0.18em] text-brand-text-muted font-semibold">
                                        Géneros incluidos
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-brand-text">
                                        {combo.genders.length > 0
                                            ? combo.genders.map((g) => g.name).join(' · ')
                                            : 'Mixto'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-[1.4rem] border border-brand-cta/45 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(255,90,78,0.10)]">
                            <svg className="h-5 w-5 flex-shrink-0 text-brand-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <p className="text-sm text-brand-text">
                                Elegí hasta <span className="font-bold text-brand-cta">{combo.max_items} prendas</span> de cualquier talle disponible.
                                Podés repetir el mismo producto en diferentes talles o cantidades.
                            </p>
                        </div>

                        {hasCategoryLimits && (
                            <div className="rounded-[1.4rem] border border-brand-cta/45 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(255,90,78,0.10)]">
                                <div className="flex items-start gap-3">
                                    <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-brand-text">
                                            Máximo por categoría
                                        </p>
                                        <p className="mt-0.5 text-xs text-brand-text-muted">
                                            Las prendas se distribuyen así:
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {categoryLimits.map((cl) => (
                                                <span
                                                    key={cl.category_id}
                                                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-cta/30 bg-brand-cta/5 px-2.5 py-1 text-[11px] font-semibold text-brand-text"
                                                >
                                                    <span className="text-brand-text-muted">{cl.category_name}:</span>
                                                    <span className="font-bold text-brand-cta">hasta {cl.max_items}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-3 rounded-[1.4rem] border border-brand-cta/45 bg-brand-primary-surface/35 px-4 py-4 shadow-[0_12px_28px_rgba(255,90,78,0.08)]">
                            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17h6M11 19h2M4 6h11v8H4zM15 9h2.5l2.5 2.5V14h-5zM7 17a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm10 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                            </svg>
                            <p className="text-sm leading-relaxed text-brand-text">
                                <span className="font-extrabold text-brand-text">A TODO EL PAIS:</span>{' '}
                                Envios a todo el pais por Correo Argentino y Andreani
                            </p>
                        </div>
                    </div>
                </header>

                {/* Layout principal: prendas + aside */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
                    {/* Prendas agrupadas por talle */}
                    <section className="space-y-6">
                        {combo.sizes_groups.length === 0 ? (
                            <div className="rounded-[1.4rem] border border-dashed border-brand-cta/30 bg-brand-secondary-light px-4 py-12 text-center">
                                <p className="text-sm text-brand-text-muted italic">
                                    Este combo no tiene prendas disponibles en este momento.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Filtros */}
                                <div className="sticky top-[110px] z-20 -mx-4 sm:-mx-6 lg:mx-0 bg-brand-bg/95 backdrop-blur-sm border-y border-brand-cta/20 px-4 sm:px-6 lg:px-0 lg:border-x-0 py-4 lg:py-4 space-y-3">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text-light pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 110-16 8 8 0 010 16z" />
                                        </svg>
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Buscar prenda por nombre..."
                                            className="h-11 w-full rounded-full border border-brand-cta/35 bg-white pl-10 pr-10 text-sm text-brand-text placeholder:text-brand-text-light shadow-sm transition-colors focus:border-brand-cta focus:outline-none focus:ring-2 focus:ring-brand-cta/20"
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                onClick={() => setSearch('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-light hover:text-brand-cta"
                                                aria-label="Limpiar búsqueda"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {availableCategories.length > 1 && (
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">
                                                    Filtrar por categoría
                                                </span>
                                            </div>

                                            <div className="sm:hidden">
                                                <FilterChipCarousel
                                                    items={availableCategories}
                                                    selectedIds={selectedCategoryIds}
                                                    onToggle={toggleCategoryFilter}
                                                />
                                            </div>

                                            <div className="hidden sm:flex sm:flex-wrap sm:gap-2">
                                                {availableCategories.map((cat) => {
                                                    const active = selectedCategoryIds.includes(cat.id);
                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => toggleCategoryFilter(cat.id)}
                                                            className={`inline-flex items-center gap-1 h-8 px-3 rounded-full text-xs font-semibold border transition-colors ${
                                                                active
                                                                    ? 'border-brand-cta bg-brand-cta text-white shadow-sm'
                                                                    : 'border-brand-cta/35 bg-white text-brand-text hover:border-brand-cta hover:text-brand-cta'
                                                            }`}
                                                        >
                                                            {active && (
                                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                            {cat.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">
                                                Filtrar por talle
                                            </span>
                                            {hasFilters && (
                                                <button
                                                    type="button"
                                                    onClick={clearFilters}
                                                    className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-text-muted hover:text-brand-cta transition-colors"
                                                >
                                                    Limpiar
                                                </button>
                                            )}
                                        </div>

                                        <div className="sm:hidden">
                                            <FilterChipCarousel
                                                items={combo.sizes_groups}
                                                selectedIds={selectedSizeIds}
                                                onToggle={toggleSizeFilter}
                                                labelPrefix="Talle "
                                            />
                                        </div>

                                        <div className="hidden sm:flex sm:flex-wrap sm:gap-2">
                                            {combo.sizes_groups.map((g) => {
                                                const active = selectedSizeIds.includes(g.id);
                                                return (
                                                    <button
                                                        key={g.id}
                                                        type="button"
                                                        onClick={() => toggleSizeFilter(g.id)}
                                                        className={`inline-flex items-center gap-1 h-8 px-3 rounded-full text-xs font-semibold border transition-colors ${
                                                            active
                                                                ? 'border-brand-cta bg-brand-cta text-white shadow-sm'
                                                                : 'border-brand-cta/35 bg-white text-brand-text hover:border-brand-cta hover:text-brand-cta'
                                                        }`}
                                                    >
                                                        {active && (
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                        Talle {g.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {hasFilters && (
                                        <p className="text-[11px] text-brand-text-muted">
                                            Mostrando <span className="font-bold text-brand-text">{visibleProductCount}</span> prenda{visibleProductCount === 1 ? '' : 's'}
                                            {selectedSizeIds.length > 0 && (
                                                <> en <span className="font-bold text-brand-text">{filteredGroups.length}</span> talle{filteredGroups.length === 1 ? '' : 's'}</>
                                            )}
                                        </p>
                                    )}
                                </div>

                                {/* Tip de uso */}
                                <div className="flex items-start gap-2.5 rounded-[1.2rem] bg-brand-secondary-light/60 border border-brand-cta/20 px-4 py-3 text-[12px] leading-snug text-brand-text">
                                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>
                                        Tocá cada categoría para ver sus prendas y elegir cantidades.
                                        {hasCategoryLimits && ' Cuando completes el máximo de una categoría, se cierra automáticamente para que sigas con otra.'}
                                    </span>
                                </div>

                                {/* Grupos filtrados (Talle → Categoría → Cards) */}
                                {filteredGroups.length === 0 ? (
                                    <div className="rounded-[1.4rem] border border-dashed border-brand-cta/30 bg-brand-secondary-light px-4 py-12 text-center">
                                        <p className="text-sm text-brand-text-muted italic">
                                            No hay prendas que coincidan con tu búsqueda.
                                        </p>
                                        {hasFilters && (
                                            <button
                                                type="button"
                                                onClick={clearFilters}
                                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-cta hover:underline"
                                            >
                                                Limpiar filtros
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {filteredGroups.map((group) => (
                                            <div key={group.id} className="rounded-[1.6rem] border border-brand-cta/45 bg-white p-1.5 shadow-[0_18px_34px_rgba(255,90,78,0.10)]">
                                                <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-brand-cta/15">
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex h-9 items-center justify-center rounded-full bg-brand-text px-4 text-sm font-extrabold uppercase tracking-[0.14em] text-white">
                                                            Talle {group.name}
                                                        </span>
                                                        <p className="text-xs text-brand-text-muted">
                                                            {group.products.length} prenda{group.products.length === 1 ? '' : 's'}
                                                        </p>
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-cta/70">
                                                        Elegí libremente
                                                    </span>
                                                </div>

                                                <div className="p-3 space-y-2">
                                                    {group.categories.map((cat) => {
                                                        const open = isCategoryOpen(group.id, cat.id);
                                                        const pickedInCat = cat.products.reduce(
                                                            (sum, p) => sum + (picksMap[pickKey(p.id, group.id)]?.quantity ?? 0),
                                                            0
                                                        );
                                                        const catLimit       = hasCategoryLimits ? limitsByCat[cat.id] : null;
                                                        const totalInCat     = hasCategoryLimits ? (picksByCategory[cat.id] ?? 0) : 0;
                                                        const catRemaining   = catLimit != null ? Math.max(0, catLimit - totalInCat) : null;
                                                        return (
                                                            <div
                                                                key={`${group.id}-${cat.id}`}
                                                                className={`overflow-hidden rounded-[1.2rem] border transition-colors ${
                                                                    open ? 'border-brand-cta/20 bg-brand-cta/5' : 'border-brand-cta/15 bg-transparent'
                                                                }`}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleExpanded(group.id, cat.id)}
                                                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-cta/5"
                                                                    aria-expanded={open}
                                                                >
                                                                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                                                        <span className="inline-flex items-center rounded-full bg-brand-cta/10 text-brand-cta px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                                                                            {cat.name}
                                                                        </span>
                                                                        <span className="text-[11px] text-brand-text-muted">
                                                                            {cat.products.length} prenda{cat.products.length === 1 ? '' : 's'}
                                                                        </span>
                                                                        {catLimit != null && (
                                                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                                totalInCat >= catLimit
                                                                                    ? 'bg-emerald-600 text-white'
                                                                                    : 'bg-brand-cta/10 text-brand-cta'
                                                                            }`}>
                                                                                {totalInCat >= catLimit && (
                                                                                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                    </svg>
                                                                                )}
                                                                                {totalInCat} / {catLimit}
                                                                                {totalInCat >= catLimit && ' completa'}
                                                                            </span>
                                                                        )}
                                                                        {catLimit == null && pickedInCat > 0 && (
                                                                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-cta px-2 py-0.5 text-[10px] font-bold text-white">
                                                                                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                                {pickedInCat} elegida{pickedInCat === 1 ? '' : 's'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <svg
                                                                        className={`h-4 w-4 flex-shrink-0 text-brand-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth={2}
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </button>

                                                                {open && (
                                                                    <div className="border-t border-brand-cta/10 px-4 py-4">
                                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
                                                                            {cat.products.map((p) => {
                                                                                const key = pickKey(p.id, group.id);
                                                                                const qty = picksMap[key]?.quantity ?? 0;
                                                                                return (
                                                                                    <ProductPickerCard
                                                                                        key={key}
                                                                                        product={p}
                                                                                        size={{ id: group.id, name: group.name }}
                                                                                        quantity={qty}
                                                                                        totalRemaining={remaining}
                                                                                        categoryRemaining={catRemaining}
                                                                                        onAdd={() => addOne(p, { id: group.id, name: group.name })}
                                                                                        onRemove={() => removeOne(p, { id: group.id, name: group.name })}
                                                                                        onImageClick={() => openPreview(p)}
                                                                                    />
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </section>

                    {/* Aside resumen */}
                    <aside className="rounded-[1.8rem] border border-brand-secondary/30 bg-white p-6 shadow-[0_18px_36px_rgba(41,50,65,0.08)] lg:sticky lg:top-32 self-start">
                        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-brand-text">Tu combo</h2>

                        {/* Contador */}
                        <div className="mt-4 flex items-baseline justify-between">
                            <span className="text-xs uppercase tracking-[0.18em] text-brand-text-muted">Prendas</span>
                            <span className="text-2xl font-extrabold text-brand-text">
                                {totalSelected}
                                <span className="text-sm font-semibold text-brand-text-muted"> / {combo.max_items}</span>
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-brand-secondary-light overflow-hidden">
                            <div
                                className="h-full rounded-full bg-brand-cta transition-all"
                                style={{ width: `${Math.min(100, (totalSelected / combo.max_items) * 100)}%` }}
                            />
                        </div>

                        {/* Progreso por categoría */}
                        {hasCategoryLimits && (
                            <div className="mt-4 space-y-2 border-t border-brand-secondary/30 pt-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">
                                    Por categoría
                                </p>
                                {categoryLimits.map((cl) => {
                                    const cnt   = picksByCategory[cl.category_id] ?? 0;
                                    const full  = cnt >= cl.max_items;
                                    const pct   = Math.min(100, (cnt / cl.max_items) * 100);
                                    return (
                                        <div key={cl.category_id}>
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="truncate text-brand-text">{cl.category_name}</span>
                                                <span className={`font-bold ${full ? 'text-brand-cta' : 'text-brand-text-muted'}`}>
                                                    {cnt} / {cl.max_items}
                                                </span>
                                            </div>
                                            <div className="mt-1 h-1 w-full rounded-full bg-brand-secondary-light overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${full ? 'bg-brand-cta' : 'bg-brand-cta/60'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Lista de picks */}
                        {summaryByPick.length > 0 && (
                            <div className="mt-5 max-h-72 overflow-y-auto pr-1 space-y-1.5 border-t border-brand-secondary/30 pt-4">
                                {summaryByPick
                                    .slice()
                                    .sort((a, b) => a.size_name.localeCompare(b.size_name))
                                    .map((p) => {
                                        const product = combo.sizes_groups
                                            .find((g) => g.id === p.size_id)
                                            ?.products.find((pp) => pp.id === p.product_id);
                                        return (
                                            <div
                                                key={pickKey(p.product_id, p.size_id)}
                                                className="flex items-start justify-between gap-2 text-xs text-brand-text"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold truncate">
                                                        {product?.name ?? `Producto #${p.product_id}`}
                                                    </p>
                                                    <p className="text-[10px] uppercase tracking-wide text-brand-text-muted">
                                                        Talle {p.size_name}
                                                    </p>
                                                </div>
                                                <span className="font-bold text-brand-cta whitespace-nowrap">
                                                    ×{p.quantity}
                                                </span>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}

                        {summaryByPick.length > 0 && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-brand-text-muted hover:text-brand-cta transition-colors"
                            >
                                Limpiar selección
                            </button>
                        )}

                        <div className="mt-5 pt-5 border-t border-brand-secondary/30 flex items-baseline justify-between">
                            <span className="text-xs uppercase tracking-[0.18em] text-brand-text-muted">Total</span>
                            <span className="text-xl font-extrabold text-brand-text">{fmt(combo.price)}</span>
                        </div>

                        <button
                            ref={cartButtonRef}
                            type="button"
                            onClick={handleAdd}
                            disabled={!canSubmit}
                            className={`mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-cta text-white text-sm font-bold uppercase tracking-[0.18em] transition-all hover:bg-brand-cta-dark disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-cta/30 ${
                                isMaxed ? 'animate-pulse ring-4 ring-brand-cta/30' : ''
                            }`}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 7h14l-1.5 10.5A2 2 0 0115.52 19H8.48a2 2 0 01-1.98-1.5L5 7zM9 7V5a3 3 0 016 0v2" />
                            </svg>
                            Agregar al carrito
                        </button>

                        {totalSelected === 0 && (
                            <p className="mt-3 text-[11px] text-brand-text-muted text-center">
                                Elegí al menos una prenda para continuar.
                            </p>
                        )}
                        {totalSelected > 0 && totalSelected < combo.max_items && (
                            <p className="mt-3 text-[11px] text-brand-text-muted text-center">
                                Te quedan <span className="font-bold text-brand-text">{remaining}</span> prenda{remaining === 1 ? '' : 's'} disponibles.
                            </p>
                        )}
                        {totalSelected === combo.max_items && (
                            <p className="mt-3 text-[11px] text-brand-cta font-semibold text-center">
                                ¡Llegaste al máximo de {combo.max_items} prendas!
                            </p>
                        )}
                        {feedback && (
                            <p className="mt-3 text-xs text-emerald-700 font-semibold text-center" role="status">
                                {feedback}
                            </p>
                        )}
                    </aside>
                </div>
            </div>

            <Lightbox
                open={previewIndex >= 0}
                index={previewIndex < 0 ? 0 : previewIndex}
                close={() => setPreviewIndex(-1)}
                slides={previewSlides}
                plugins={[Zoom]}
                zoom={{
                    maxZoomPixelRatio: 3,
                    zoomInMultiplier: 2,
                    doubleTapDelay: 300,
                    doubleClickDelay: 300,
                    scrollToZoom: true,
                }}
                carousel={{ finite: previewSlides.length <= 1 }}
                controller={{ closeOnBackdropClick: true }}
                styles={{ container: { backgroundColor: 'rgba(16, 24, 40, 0.92)' } }}
            />
        </StorefrontLayout>
    );
}
