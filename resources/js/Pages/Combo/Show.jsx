import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

// ─── Combo / Builder ──────────────────────────────────────────────────────────
// Vista para construir el combo: el cliente elige talle, género, y luego, por
// cada categoría del combo, los productos. Cada paso es un acordeón; al
// completarse se cierra y avanza al siguiente. Final: resumen + agregar al carrito.
//
// NOTA: el endpoint de carrito todavía no existe. El botón muestra feedback
// local. Cuando exista `cart.add` reemplazar `handleAdd` por
// `router.post(route('cart.add'), { combo_id, size_id, gender_id, picks })`.

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
            className="text-left group block"
        >
            <div
                className={`relative aspect-[4/5] overflow-hidden bg-white border-2 transition-colors ${
                    selected ? 'border-brand-cta' : 'border-transparent hover:border-brand-secondary/60'
                }`}
            >
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-primary-surface">
                        <svg className="h-10 w-10 text-brand-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                {selected && (
                    <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-cta text-white shadow">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </span>
                )}
            </div>
            <p className="mt-2 px-1 text-[12px] font-medium text-brand-text leading-tight truncate">
                {product.name}
            </p>
        </button>
    );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ComboShow({ combo, genders = [], cartCount = 0 }) {
    const [size, setSize] = useState(null);
    const [gender, setGender] = useState(null);
    const [picks, setPicks] = useState({});           // { [categoryId]: number[] }
    const [activeStep, setActiveStep] = useState('size');
    const [feedback, setFeedback] = useState(null);

    const stepRefs = useRef({});

    // Reset al cambiar de combo (Inertia mantiene el componente)
    useEffect(() => {
        setSize(null);
        setGender(null);
        setPicks({});
        setActiveStep('size');
        setFeedback(null);
    }, [combo.id]);

    // ─── Derivados ────────────────────────────────────────────────────────────

    // Productos disponibles por categoría según talle + género + stock
    const availableByCategory = useMemo(() => {
        const map = {};
        if (!size || !gender) return map;
        for (const cat of combo.categories) {
            map[cat.id] = cat.products.filter((p) => {
                const hasStock  = p.sizes.some((s) => s.id === size && s.stock > 0);
                const hasGender = p.genders.includes(gender);
                return hasStock && hasGender;
            });
        }
        return map;
    }, [size, gender, combo.categories]);

    const isCategoryComplete = (cat) =>
        (picks[cat.id]?.length ?? 0) >= cat.quantity;

    const allCategoriesComplete = combo.categories.every(isCategoryComplete);
    const allComplete = !!size && !!gender && allCategoriesComplete;

    // ─── Auto-advance ─────────────────────────────────────────────────────────

    // Al elegir talle → género
    useEffect(() => {
        if (size && activeStep === 'size') setActiveStep('gender');
    }, [size]);

    // Al elegir género → primera categoría (o resumen si no hay categorías)
    useEffect(() => {
        if (gender && activeStep === 'gender') {
            const first = combo.categories[0];
            setActiveStep(first ? `cat-${first.id}` : 'summary');
        }
    }, [gender]);

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

    // Scroll suave al paso activo
    useEffect(() => {
        const el = stepRefs.current[activeStep];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const pickGender = (gid) => {
        if (gid === gender) return;
        setGender(gid);
        setPicks({});                    // las picks dependen del género
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
            combo_id:  combo.id,
            size_id:   size,
            gender_id: gender,
            picks,
            quantity:  1,
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

    const sizeLabel   = size   ? combo.sizes.find((s) => s.id === size)?.name      : null;
    const genderLabel = gender ? genders.find((g) => g.id === gender)?.name        : null;

    const sizeCanOpen   = true;
    const genderCanOpen = !!size;
    const catCanOpen    = !!size && !!gender;

    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title={`${combo.name} · Mimos`} />

            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                {/* Breadcrumb */}
                <nav className="text-[11px] uppercase tracking-[0.18em] text-brand-text-muted mb-6">
                    <Link href="/" className="hover:text-brand-text transition-colors">Inicio</Link>
                    <span className="mx-2 text-brand-text-light">/</span>
                    <Link href="/catalogo" className="hover:text-brand-text transition-colors">Catálogo</Link>
                    <span className="mx-2 text-brand-text-light">/</span>
                    <span className="text-brand-text font-semibold">{combo.name}</span>
                </nav>

                {/* Hero del combo */}
                <header className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 lg:gap-12 items-start">
                    <div className="aspect-[4/5] overflow-hidden bg-white">
                        {combo.image ? (
                            <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand-primary-surface">
                                <svg className="h-16 w-16 text-brand-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-brand-cta font-semibold">
                            Combo
                        </p>
                        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text leading-tight">
                            {combo.name}
                        </h1>
                        <p className="mt-3 text-2xl font-bold text-brand-text">{fmt(combo.price)}</p>
                        {combo.description && (
                            <p className="mt-5 text-sm leading-relaxed text-brand-text-muted whitespace-pre-line">
                                {combo.description}
                            </p>
                        )}
                        <p className="mt-6 text-xs text-brand-text-muted">
                            Armá tu combo en {2 + combo.categories.length} pasos: elegí talle, género y los productos de cada categoría.
                        </p>
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

                    {/* 2. Género */}
                    <div ref={(el) => (stepRefs.current['gender'] = el)}>
                        <StepHeader
                            index={2}
                            title="Género"
                            status={genderLabel}
                            completed={!!gender}
                            open={activeStep === 'gender'}
                            onToggle={() => genderCanOpen && toggleStep('gender')}
                            disabled={!genderCanOpen}
                        />
                        {activeStep === 'gender' && (
                            <div className="pb-6">
                                {genders.length === 0 ? (
                                    <p className="text-sm text-brand-text-muted italic">No hay géneros configurados.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {genders.map((g) => (
                                            <ChipButton
                                                key={g.id}
                                                label={g.name}
                                                active={gender === g.id}
                                                onClick={() => pickGender(g.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 3..N. Categorías */}
                    {combo.categories.map((cat, i) => {
                        const stepKey  = `cat-${cat.id}`;
                        const products = availableByCategory[cat.id] ?? [];
                        const picked   = picks[cat.id] ?? [];
                        const status   = catCanOpen
                            ? `${picked.length} de ${cat.quantity} seleccionado${cat.quantity === 1 ? '' : 's'}`
                            : 'Elegí talle y género primero';

                        return (
                            <div key={cat.id} ref={(el) => (stepRefs.current[stepKey] = el)}>
                                <StepHeader
                                    index={3 + i}
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
                                            <p className="text-sm text-brand-text-muted italic">
                                                No hay productos disponibles para esta categoría con el talle y género elegidos.
                                            </p>
                                        ) : (
                                            <>
                                                <p className="text-xs text-brand-text-muted mb-3">
                                                    Elegí {cat.quantity} {cat.quantity === 1 ? 'producto' : 'productos'} de esta categoría.
                                                </p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
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
                            <div className="flex justify-between gap-3">
                                <dt className="text-brand-text-muted">Género</dt>
                                <dd className="font-semibold text-brand-text">{genderLabel ?? '—'}</dd>
                            </div>

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
