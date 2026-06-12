import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

// ─── Combo / Builder ──────────────────────────────────────────────────────────
// Vista para construir el combo: el cliente elige talle y luego, por cada
// categoría del combo, los productos. El género viene definido por el combo
// mismo (se fija en la creación). Cada paso es un acordeón; al completarse se
// cierra y avanza al siguiente. Final: resumen + agregar al carrito.

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR');
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function StepHeader({ index, title, status, completed, open, onToggle, disabled }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            className={`flex w-full items-center justify-between rounded-[1.2rem] border border-brand-cta/20 px-5 py-4 text-left transition-colors ${
                open ? 'bg-brand-cta/10' : 'bg-transparent'
            } ${
                disabled ? 'opacity-40 cursor-not-allowed' : ''
            }`}
        >
            <div className="flex items-center gap-3">
                <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                        completed
                            ? 'bg-brand-cta text-white'
                            : open
                                ? 'bg-brand-cta text-white'
                                : 'border border-brand-cta/35 bg-brand-cta/10 text-brand-cta'
                    }`}
                >
                    {completed ? (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        index
                    )}
                </span>
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-brand-cta">{title}</span>
                {status && (
                    <span className="inline-flex items-center rounded-full border border-brand-cta/20 bg-brand-cta/10 px-2.5 py-1 text-xs text-brand-cta/85 normal-case tracking-normal font-normal">
                        · {status}
                    </span>
                )}
            </div>
            <svg
                className={`h-4 w-4 text-brand-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    );
}

function ChipButton({ label, active, onClick, disabled }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={disabled ? 'Sin stock suficiente para completar el combo en este talle' : undefined}
            className={`min-w-[64px] h-10 rounded-full px-4 text-sm font-semibold border shadow-sm transition-colors ${
                disabled
                    ? 'bg-brand-secondary-light text-brand-text-light border-brand-secondary line-through cursor-not-allowed'
                    : active
                        ? 'bg-brand-cta text-white border-brand-cta'
                        : 'bg-white text-brand-cta border-brand-cta/35 hover:border-brand-cta'
            }`}
        >
            {label}
        </button>
    );
}

function ProductPickerCard({ product, selected, onToggle, onImageClick }) {
    return (
        <div
            className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[1.55rem] bg-white text-left transition-all duration-300 ${
                selected
                    ? 'border-2 border-brand-cta shadow-[0_14px_30px_rgba(255,90,78,0.18)] -translate-y-0.5'
                    : 'border border-brand-secondary/60 shadow-[0_8px_20px_rgba(41,50,65,0.05)] hover:-translate-y-0.5 hover:border-brand-cta/50 hover:shadow-[0_14px_28px_rgba(41,50,65,0.10)]'
            }`}
        >
            <button
                type="button"
                onClick={onImageClick}
                disabled={!product.image}
                aria-label={product.image ? `Ampliar imagen de ${product.name}` : 'Imagen no disponible'}
                className="relative block aspect-[4/5] w-full overflow-hidden bg-brand-secondary-light text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2 disabled:cursor-default"
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

                {/* Indicador de selección (siempre visible, cambia de estado) */}
                <span
                    aria-hidden="true"
                    className={`absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200 ${
                        selected
                            ? 'bg-brand-cta border-brand-cta text-white scale-100 shadow-md'
                            : 'bg-white/90 border-brand-secondary text-transparent scale-90 group-hover:scale-100 group-hover:border-brand-cta/60'
                    }`}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </span>

                {/* Hint de ampliar */}
                {product.image && (
                    <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-brand-text/75 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 7v8M7 11h8M11 19a8 8 0 110-16 8 8 0 010 16z" />
                        </svg>
                        Ampliar
                    </span>
                )}

                {/* Velo coral suave cuando está seleccionado */}
                {selected && (
                    <div className="pointer-events-none absolute inset-0 bg-brand-cta/5" />
                )}
            </button>

            <div className="flex flex-1 flex-col px-3 py-3">
                <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-brand-text">
                    {product.name}
                </p>

                {product.colors?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {product.colors.map((c) => (
                            <span
                                key={c.id}
                                className="inline-flex items-center rounded-full bg-brand-secondary-light px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-brand-text-muted"
                            >
                                {c.name}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-3">
                    {selected ? (
                        <button
                            type="button"
                            onClick={onToggle}
                            aria-pressed={selected}
                            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-brand-cta bg-brand-cta/5 text-brand-cta text-[11px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-brand-cta hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Seleccionado
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onToggle}
                            aria-pressed={selected}
                            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-brand-cta text-white text-[11px] font-bold uppercase tracking-[0.14em] transition-colors hover:bg-brand-cta-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ComboShow({ combo, cartCount = 0 }) {
    const [size, setSize] = useState(null);
    const [picks, setPicks] = useState({});           // { [categoryId]: number[] }
    const [activeStep, setActiveStep] = useState('size');
    const [feedback, setFeedback] = useState(null);
    const [previewSlides, setPreviewSlides] = useState([]);
    const [previewIndex, setPreviewIndex] = useState(-1);

    const stepRefs = useRef({});

    const openPreview = (product) => {
        const imgs = product.images?.length ? product.images : (product.image ? [product.image] : []);
        if (!imgs.length) return;
        setPreviewSlides(imgs.map((src) => ({ src, alt: product.name })));
        setPreviewIndex(0);
    };

    // Reset al cambiar de combo (Inertia mantiene el componente)
    useEffect(() => {
        setSize(null);
        setPicks({});
        setActiveStep('size');
        setFeedback(null);
        setPreviewSlides([]);
        setPreviewIndex(-1);
    }, [combo.id]);

    // ─── Derivados ────────────────────────────────────────────────────────────

    // Productos disponibles por categoría según talle + stock. El género ya está
    // pre-filtrado al crear el combo.
    const availableByCategory = useMemo(() => {
        const map = {};
        if (!size) return map;
        for (const cat of combo.categories) {
            map[cat.id] = cat.products.filter((p) =>
                p.sizes.some((s) => s.id === size && s.stock > 0)
            );
        }
        return map;
    }, [size, combo.categories]);

    // Talles para los que el combo SÍ puede completarse con el stock actual:
    // cada categoría debe tener al menos `quantity` productos DISTINTOS con
    // stock > 0 en ese talle (cada slot de la categoría exige un producto
    // distinto). Si alguna categoría no llega, el talle se tacha.
    const feasibleSizes = useMemo(() => {
        const set = new Set();
        for (const s of combo.sizes) {
            const ok = combo.categories.every((cat) => {
                const inStock = cat.products.filter((p) =>
                    p.sizes.some((ps) => ps.id === s.id && ps.stock > 0)
                ).length;
                return inStock >= cat.quantity;
            });
            if (ok) set.add(s.id);
        }
        return set;
    }, [combo.sizes, combo.categories]);

    const hasBlockedSizes = combo.sizes.some((s) => !feasibleSizes.has(s.id));

    const isCategoryComplete = (cat) =>
        (picks[cat.id]?.length ?? 0) >= cat.quantity;

    const allCategoriesComplete = combo.categories.every(isCategoryComplete);
    const allComplete = !!size && allCategoriesComplete;

    // ─── Auto-advance ─────────────────────────────────────────────────────────

    // Al elegir talle → primera categoría (o resumen si no hay categorías)
    useEffect(() => {
        if (size && activeStep === 'size') {
            const first = combo.categories[0];
            setActiveStep(first ? `cat-${first.id}` : 'summary');
        }
    }, [size]);

    // Al completar la categoría activa → siguiente
    useEffect(() => {
        if (typeof activeStep !== 'string' || !activeStep.startsWith('cat-')) return;
        const catId = Number(activeStep.slice(4));
        const cat = combo.categories.find((c) => c.id === catId);
        if (!cat) return;
        if ((picks[catId]?.length ?? 0) >= cat.quantity) {
            const t = setTimeout(() => {
                const idx = combo.categories.findIndex((c) => c.id === catId);
                const next = combo.categories[idx + 1];
                setActiveStep(next ? `cat-${next.id}` : 'summary');
            }, 350);
            return () => clearTimeout(t);
        }
    }, [picks]);

    // Scroll suave al paso activo, dejando espacio para el navbar sticky
    useEffect(() => {
        const el = stepRefs.current[activeStep];
        if (!el) return;
        // El layout del storefront envuelve TopBar + Header en un .sticky.top-0
        const stickyHeader = document.querySelector('.sticky.top-0');
        const headerHeight = stickyHeader?.getBoundingClientRect().height ?? 110;
        const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
    }, [activeStep]);

    // Auto-dismiss feedback
    useEffect(() => {
        if (!feedback) return;
        const t = setTimeout(() => setFeedback(null), 2800);
        return () => clearTimeout(t);
    }, [feedback]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const pickSize = (sid) => {
        if (sid === size) return;
        if (!feasibleSizes.has(sid)) return;   // talle sin stock para completar el combo
        setSize(sid);
        setPicks({});                    // las picks dependen del talle
    };

    const togglePick = (cat, productId) => {
        setPicks((prev) => {
            const current = prev[cat.id] ?? [];
            let next;
            if (current.includes(productId)) {
                next = current.filter((id) => id !== productId);
            } else if (current.length < cat.quantity) {
                next = [...current, productId];
            } else if (cat.quantity === 1) {
                // Reemplazar la única selección
                next = [productId];
            } else {
                // Reemplazar la última (FIFO)
                next = [...current.slice(1), productId];
            }
            return { ...prev, [cat.id]: next };
        });
    };

    const toggleStep = (key) => {
        setActiveStep((prev) => (prev === key ? null : key));
    };

    const handleAdd = () => {
        if (!allComplete) return;
        router.post('/carrito/combo', {
            combo_id: combo.id,
            size_id:  size,
            picks,
            quantity: 1,
        }, {
            preserveScroll: true,
            preserveState:  true,
            onSuccess: () => {
                setFeedback(`✓ ${combo.name} agregado al carrito.`);
            },
            onError: (errs) => {
                setFeedback(errs?.picks || errs?.stock || 'No pudimos agregar el combo. Intentá de nuevo.');
            },
        });
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    const sizeLabel   = size ? combo.sizes.find((s) => s.id === size)?.name : null;
    const genderLabel = combo.gender?.name ?? null;

    const sizeCanOpen = true;
    const catCanOpen  = !!size;

    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title={`${combo.name} · La Tienda de los Niños`} />

            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                {/* Breadcrumb + volver */}
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

                {/* Hero del combo */}
                <header className="grid grid-cols-1 lg:grid-cols-[minmax(0,460px)_1fr] gap-8 lg:gap-14 items-start">
                    {/* Imagen — se muestra completa (object-contain) sobre fondo crema */}
                    <div className="relative overflow-hidden rounded-[1.9rem] bg-brand-secondary-light border border-brand-cta/30 shadow-[0_18px_40px_rgba(41,50,65,0.08)]">
                        <div className="aspect-[4/5] w-full">
                            {combo.image ? (
                                <img
                                    src={combo.image}
                                    alt={combo.name}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-brand-primary-surface">
                                    <svg className="h-16 w-16 text-brand-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-brand-text px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white shadow-md">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Combo
                        </span>
                    </div>

                    {/* Detalles */}
                    <div className="flex flex-col gap-4">
                        <div className="rounded-[1.9rem] border border-brand-cta/25 bg-white p-6 shadow-[0_18px_36px_rgba(41,50,65,0.06)] sm:p-7">
                            <p className="text-[11px] uppercase tracking-[0.24em] text-brand-cta font-bold">
                                Combo · Armalo a tu medida
                            </p>
                            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-brand-text leading-[1.05]">
                                {combo.name}
                            </h1>

                            {/* Precio destacado */}
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

                            {/* Incluye — chips de categorías */}
                            {combo.categories.length > 0 && (
                                <div className="mt-7">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-brand-text font-bold mb-3">
                                        Tu combo incluye
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-5">
                                        {combo.categories.map((cat) => (
                                            <span
                                                key={cat.id}
                                                className="inline-flex items-center gap-2 rounded-full bg-white border border-brand-secondary px-3.5 py-2 text-sm font-semibold text-brand-text shadow-[0_4px_10px_rgba(41,50,65,0.04)]"
                                            >
                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-cta px-1.5 text-[11px] font-bold text-white">
                                                    ×{cat.quantity}
                                                </span>
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Talles disponibles — sólo informativo (la selección se hace más abajo) */}
                            {combo.sizes.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-brand-text-muted font-semibold mb-2">
                                        Talles disponibles
                                    </p>
                                    <p className="text-sm font-semibold leading-relaxed text-brand-text">
                                        {combo.sizes.map((s, i) => {
                                            const feasible = feasibleSizes.has(s.id);
                                            return (
                                                <span key={s.id}>
                                                    <span
                                                        title={feasible ? undefined : 'Sin stock suficiente para completar el combo'}
                                                        className={feasible ? 'text-brand-text' : 'text-brand-text-light line-through'}
                                                    >
                                                        {s.name}
                                                    </span>
                                                    {i < combo.sizes.length - 1 && (
                                                        <span className="mx-1.5 text-brand-text-light">·</span>
                                                    )}
                                                </span>
                                            );
                                        })}
                                    </p>
                                </div>
                            )}

                            {/* Género del combo */}
                            {combo.gender && (
                                <div className="mt-6">
                                    <p className="text-[11px] uppercase tracking-[0.2em] text-brand-text-muted font-semibold mb-2">
                                        Género
                                    </p>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-cta/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-cta">
                                        {combo.gender.name}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 rounded-[1.4rem] border border-brand-cta/45 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(255,90,78,0.10)]">
                            <svg className="h-5 w-5 flex-shrink-0 text-brand-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <p className="text-sm leading-relaxed text-brand-text">
                                Armá tu combo en <span className="font-bold text-brand-cta">{1 + combo.categories.length} pasos</span>: elegí talle y los productos de cada categoría.
                            </p>
                        </div>

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

                {/* Pasos */}
                <section className="mt-10 space-y-4">

                    {/* 1. Talle */}
                    <div ref={(el) => (stepRefs.current['size'] = el)} className="rounded-[1.6rem] border border-brand-cta/45 bg-white p-1.5 shadow-[0_18px_34px_rgba(255,90,78,0.10)]">
                        <StepHeader
                            index={1}
                            title="Talle"
                            status={sizeLabel}
                            completed={!!size}
                            open={activeStep === 'size'}
                            onToggle={() => sizeCanOpen && toggleStep('size')}
                        />
                        {activeStep === 'size' && (
                            <div className="px-5 pb-6 mt-5">
                                {combo.sizes.length === 0 ? (
                                    <p className="text-sm text-brand-text-muted italic">Este combo no tiene talles disponibles.</p>
                                ) : (
                                    <>
                                        <div className="flex flex-wrap gap-2 mt-5">
                                            {combo.sizes.map((s) => (
                                                <ChipButton
                                                    key={s.id}
                                                    label={s.name}
                                                    active={size === s.id}
                                                    disabled={!feasibleSizes.has(s.id)}
                                                    onClick={() => pickSize(s.id)}
                                                />
                                            ))}
                                        </div>
                                        {hasBlockedSizes && (
                                            <p className="mt-3 text-[11px] text-brand-text-muted">
                                                Los talles <span className="line-through">tachados</span> no tienen stock suficiente para completar el combo. Volvé a revisar más adelante.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2..N. Categorías */}
                    {combo.categories.map((cat, i) => {
                        const stepKey  = `cat-${cat.id}`;
                        const products = availableByCategory[cat.id] ?? [];
                        const picked   = picks[cat.id] ?? [];
                        const status   = catCanOpen
                            ? `${picked.length} de ${cat.quantity} seleccionado${cat.quantity === 1 ? '' : 's'}`
                            : 'Elegí el talle primero';

                        return (
                            <div key={cat.id} ref={(el) => (stepRefs.current[stepKey] = el)} className="rounded-[1.6rem] border border-brand-cta/45 bg-white p-1.5 shadow-[0_18px_34px_rgba(255,90,78,0.10)]">
                                <StepHeader
                                    index={2 + i}
                                    title={cat.name}
                                    status={status}
                                    completed={isCategoryComplete(cat)}
                                    open={activeStep === stepKey}
                                    onToggle={() => catCanOpen && toggleStep(stepKey)}
                                    disabled={!catCanOpen}
                                />
                                {activeStep === stepKey && (
                                    <div className="px-5 pb-6 mt-5">
                                        {products.length === 0 ? (
                                            <div className="rounded-[1.15rem] border border-dashed border-brand-cta/45 bg-brand-secondary-light px-4 py-6 text-center">
                                                <p className="text-sm text-brand-text-muted italic">
                                                    No hay productos disponibles para esta categoría con el talle elegido.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-l-2 border-brand-cta pl-3">
                                                    <p className="text-xs text-brand-text-muted">
                                                        Elegí <span className="font-semibold text-brand-text">{cat.quantity}</span> {cat.quantity === 1 ? 'producto' : 'productos'} de esta categoría.
                                                    </p>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                                                            isCategoryComplete(cat)
                                                                ? 'bg-brand-cta/10 text-brand-cta'
                                                                : 'bg-brand-secondary-light text-brand-text-muted'
                                                        }`}
                                                    >
                                                        {picked.length} / {cat.quantity}
                                                        {isCategoryComplete(cat) && (
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
                                                    {products.map((p) => (
                                                        <ProductPickerCard
                                                            key={p.id}
                                                            product={p}
                                                            selected={picked.includes(p.id)}
                                                            onToggle={() => togglePick(cat, p.id)}
                                                            onImageClick={() => openPreview(p)}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </section>

                {/* Resumen + CTA */}
                <section className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8" ref={(el) => (stepRefs.current['summary'] = el)}>
                    <div />
                    <aside className="self-start rounded-[1.8rem] border border-brand-secondary/30 bg-white p-6 shadow-[0_18px_36px_rgba(41,50,65,0.08)] lg:sticky lg:top-32">
                        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-brand-text">Resumen</h2>

                        <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between gap-3">
                                <dt className="text-brand-text-muted">Talle</dt>
                                <dd className="font-semibold text-brand-text">{sizeLabel ?? '—'}</dd>
                            </div>
                            {genderLabel && (
                                <div className="flex justify-between gap-3">
                                    <dt className="text-brand-text-muted">Género</dt>
                                    <dd className="font-semibold text-brand-text">{genderLabel}</dd>
                                </div>
                            )}

                            {combo.categories.map((cat) => {
                                const picked = picks[cat.id] ?? [];
                                const names = picked
                                    .map((pid) => cat.products.find((p) => p.id === pid)?.name)
                                    .filter(Boolean);
                                return (
                                    <div key={cat.id} className="flex justify-between gap-3">
                                        <dt className="text-brand-text-muted">{cat.name}</dt>
                                        <dd className="text-right font-semibold text-brand-text">
                                            {names.length ? names.join(', ') : `— (0 de ${cat.quantity})`}
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>

                        <div className="mt-5 pt-5 border-t border-brand-secondary/30 flex items-baseline justify-between">
                            <span className="text-xs uppercase tracking-[0.18em] text-brand-text-muted">Total</span>
                            <span className="text-xl font-extrabold text-brand-text">{fmt(combo.price)}</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={!allComplete}
                            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-cta text-white text-sm font-bold uppercase tracking-[0.18em] transition-colors hover:bg-brand-cta-dark disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 7h14l-1.5 10.5A2 2 0 0115.52 19H8.48a2 2 0 01-1.98-1.5L5 7zM9 7V5a3 3 0 016 0v2" />
                            </svg>
                            Agregar al carrito
                        </button>

                        {!allComplete && (
                            <p className="mt-3 text-[11px] text-brand-text-muted text-center">
                                Completá todos los pasos para continuar.
                            </p>
                        )}
                        {feedback && (
                            <p className="mt-3 text-xs text-emerald-700 font-semibold text-center" role="status">
                                {feedback}
                            </p>
                        )}
                    </aside>
                </section>
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
