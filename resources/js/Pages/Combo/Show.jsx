import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
            className={`w-full flex items-center justify-between py-4 text-left ${
                disabled ? 'opacity-40 cursor-not-allowed' : ''
            }`}
        >
            <div className="flex items-center gap-3">
                <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                        completed
                            ? 'bg-brand-cta text-white'
                            : open
                                ? 'bg-brand-text text-white'
                                : 'bg-brand-secondary-surface text-brand-text'
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
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-brand-text">{title}</span>
                {status && (
                    <span className="text-xs text-brand-text-muted normal-case tracking-normal font-normal">
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

function ChipButton({ label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`min-w-[64px] h-10 px-4 text-sm font-semibold border transition-colors ${
                active
                    ? 'bg-brand-text text-white border-brand-text'
                    : 'bg-white text-brand-text border-brand-text/30 hover:border-brand-text'
            }`}
        >
            {label}
        </button>
    );
}

function ProductPickerCard({ product, selected, onToggle }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-pressed={selected}
            className={`group relative flex h-full w-full flex-col overflow-hidden bg-white text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta focus-visible:ring-offset-2 ${
                selected
                    ? 'border-2 border-brand-cta shadow-[0_14px_30px_rgba(255,90,78,0.18)] -translate-y-0.5'
                    : 'border border-brand-secondary/60 shadow-[0_8px_20px_rgba(41,50,65,0.05)] hover:-translate-y-0.5 hover:border-brand-cta/50 hover:shadow-[0_14px_28px_rgba(41,50,65,0.10)]'
            }`}
        >
            <div className="relative aspect-[4/5] overflow-hidden bg-brand-secondary-light">
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

                {/* Velo coral suave cuando está seleccionado */}
                {selected && (
                    <div className="pointer-events-none absolute inset-0 bg-brand-cta/5" />
                )}
            </div>

            <div className="flex flex-1 flex-col px-3 py-3">
                <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-brand-text">
                    {product.name}
                </p>
                <span
                    className={`mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                        selected ? 'text-brand-cta' : 'text-brand-text-light group-hover:text-brand-text-muted'
                    }`}
                >
                    {selected ? (
                        <>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            Seleccionado
                        </>
                    ) : (
                        'Seleccionar'
                    )}
                </span>
            </div>
        </button>
    );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ComboShow({ combo, cartCount = 0 }) {
    const [size, setSize] = useState(null);
    const [picks, setPicks] = useState({});           // { [categoryId]: number[] }
    const [activeStep, setActiveStep] = useState('size');
    const [feedback, setFeedback] = useState(null);

    const stepRefs = useRef({});

    // Reset al cambiar de combo (Inertia mantiene el componente)
    useEffect(() => {
        setSize(null);
        setPicks({});
        setActiveStep('size');
        setFeedback(null);
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
            onError: () => {
                setFeedback('No pudimos agregar el combo. Intentá de nuevo.');
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
            <Head title={`${combo.name} · Mimos`} />

            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                {/* Breadcrumb + volver */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <nav className="text-[11px] uppercase tracking-[0.18em] text-brand-text-muted">
                        <Link href="/" className="hover:text-brand-text transition-colors">Inicio</Link>
                        <span className="mx-2 text-brand-text-light">/</span>
                        <Link href="/catalogo" className="hover:text-brand-text transition-colors">Catálogo</Link>
                        <span className="mx-2 text-brand-text-light">/</span>
                        <span className="text-brand-text font-semibold">{combo.name}</span>
                    </nav>
                    <Link
                        href="/catalogo"
                        className="inline-flex items-center gap-2 border border-brand-secondary bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-text shadow-sm transition-all hover:-translate-x-0.5 hover:border-brand-cta hover:text-brand-cta"
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
                    <div className="relative overflow-hidden bg-brand-secondary-light border border-brand-secondary/60 shadow-[0_18px_40px_rgba(41,50,65,0.08)]">
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
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 bg-brand-text px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white shadow-md">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Combo
                        </span>
                    </div>

                    {/* Detalles */}
                    <div className="flex flex-col">
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
                                <div className="flex flex-wrap gap-2">
                                    {combo.categories.map((cat) => (
                                        <span
                                            key={cat.id}
                                            className="inline-flex items-center gap-2 bg-white border border-brand-secondary px-3.5 py-2 text-sm font-semibold text-brand-text shadow-[0_4px_10px_rgba(41,50,65,0.04)]"
                                        >
                                            <span className="flex h-5 min-w-[20px] items-center justify-center bg-brand-cta px-1.5 text-[11px] font-bold text-white">
                                                ×{cat.quantity}
                                            </span>
                                            {cat.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Talles disponibles */}
                        {combo.sizes.length > 0 && (
                            <div className="mt-6">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-brand-text-muted font-semibold mb-2">
                                    Talles disponibles
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {combo.sizes.map((s) => (
                                        <span
                                            key={s.id}
                                            className="inline-flex h-8 min-w-[36px] items-center justify-center bg-brand-secondary-light border border-brand-secondary px-2.5 text-xs font-bold text-brand-text"
                                        >
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Género del combo */}
                        {combo.gender && (
                            <div className="mt-6">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-brand-text-muted font-semibold mb-2">
                                    Género
                                </p>
                                <span className="inline-flex items-center gap-1.5 bg-brand-cta/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-cta">
                                    {combo.gender.name}
                                </span>
                            </div>
                        )}

                        {/* Pasos / banner inferior */}
                        <div className="mt-7 flex items-center gap-3 border-l-2 border-brand-cta bg-brand-secondary-light/60 px-4 py-3">
                            <svg className="h-5 w-5 flex-shrink-0 text-brand-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <p className="text-sm text-brand-text">
                                Armá tu combo en <span className="font-bold">{1 + combo.categories.length} pasos</span>: elegí talle y los productos de cada categoría.
                            </p>
                        </div>
                    </div>
                </header>

                {/* Pasos */}
                <section className="mt-10 border-y border-brand-secondary/20 divide-y divide-brand-secondary/20">

                    {/* 1. Talle */}
                    <div ref={(el) => (stepRefs.current['size'] = el)}>
                        <StepHeader
                            index={1}
                            title="Talle"
                            status={sizeLabel}
                            completed={!!size}
                            open={activeStep === 'size'}
                            onToggle={() => sizeCanOpen && toggleStep('size')}
                        />
                        {activeStep === 'size' && (
                            <div className="pb-6">
                                {combo.sizes.length === 0 ? (
                                    <p className="text-sm text-brand-text-muted italic">Este combo no tiene talles disponibles.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {combo.sizes.map((s) => (
                                            <ChipButton
                                                key={s.id}
                                                label={s.name}
                                                active={size === s.id}
                                                onClick={() => pickSize(s.id)}
                                            />
                                        ))}
                                    </div>
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
                            <div key={cat.id} ref={(el) => (stepRefs.current[stepKey] = el)}>
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
                                    <div className="pb-6">
                                        {products.length === 0 ? (
                                            <div className="rounded-sm border border-dashed border-brand-secondary bg-brand-secondary-light px-4 py-6 text-center">
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
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
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
                    <aside className="bg-white border border-brand-secondary/30 p-6 lg:sticky lg:top-32 self-start">
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
                            className="mt-5 w-full h-12 inline-flex items-center justify-center gap-2 bg-brand-cta text-white text-sm font-bold uppercase tracking-[0.18em] hover:bg-brand-cta-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        </StorefrontLayout>
    );
}
