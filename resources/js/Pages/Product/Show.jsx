import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

// ─── Producto / Detalle ───────────────────────────────────────────────────────
// Vista de detalle: galería + info + selector de talle + cantidad + CTA carrito.
// Debajo, productos relacionados (misma categoría).
//
// NOTA: el backend de carrito todavía no está implementado, así que el botón
// muestra feedback local. Al haber endpoint `cart.add`, reemplazar `handleAdd`
// por un `router.post(route('cart.add'), {...})`.

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR');
}

function ImageGallery({ images, name }) {
    const [active, setActive] = useState(0);
    const list = images?.length ? images : [null];

    return (
        <div className="grid grid-cols-[88px_1fr] gap-3">
            {/* Thumbnails */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[560px] pr-1">
                {list.map((src, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setActive(i)}
                        className={`shrink-0 aspect-[4/5] w-full overflow-hidden bg-white border transition-colors ${
                            active === i ? 'border-brand-text' : 'border-transparent hover:border-brand-secondary/50'
                        }`}
                        aria-label={`Imagen ${i + 1}`}
                    >
                        {src ? (
                            <img src={src} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-brand-primary-surface" />
                        )}
                    </button>
                ))}
            </div>

            {/* Main image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-white">
                {list[active] ? (
                    <img src={list[active]} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-primary-surface">
                        <svg className="h-16 w-16 text-brand-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}

function QuantityStepper({ value, onChange, max }) {
    const dec = () => onChange(Math.max(1, value - 1));
    const inc = () => onChange(max ? Math.min(max, value + 1) : value + 1);

    return (
        <div className="inline-flex items-center border border-brand-text/80">
            <button
                type="button"
                onClick={dec}
                disabled={value <= 1}
                aria-label="Disminuir"
                className="w-10 h-11 flex items-center justify-center text-brand-text hover:bg-brand-primary-surface disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
                </svg>
            </button>
            <span className="w-12 h-11 flex items-center justify-center text-sm font-semibold text-brand-text border-x border-brand-text/80">
                {value}
            </span>
            <button
                type="button"
                onClick={inc}
                disabled={max ? value >= max : false}
                aria-label="Aumentar"
                className="w-10 h-11 flex items-center justify-center text-brand-text hover:bg-brand-primary-surface disabled:opacity-30 disabled:cursor-not-allowed"
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
                </svg>
            </button>
        </div>
    );
}

function RelatedCard({ item }) {
    return (
        <Link href={`/producto/${item.id}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-white">
                {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-primary-surface">
                        <svg className="h-12 w-12 text-brand-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                {item.is_featured && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold tracking-[0.2em] text-brand-text">
                        NEW IN
                    </span>
                )}
            </div>
            <div className="mt-2 px-1">
                <h3 className="text-[13px] font-medium text-brand-text leading-tight truncate">{item.name}</h3>
                <p className="text-[13px] font-bold text-brand-text mt-0.5">{fmt(item.price)}</p>
            </div>
        </Link>
    );
}

export default function ProductShow({ product, related = [], cartCount = 0 }) {
    const sizesInStock = product.sizes.filter((s) => s.stock > 0);
    const [sizeId, setSizeId] = useState(null);
    const [qty, setQty] = useState(1);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState(null);

    // Reset state if user navigates to another product (Inertia keeps component mounted)
    useEffect(() => {
        setSizeId(null);
        setQty(1);
        setFeedback(null);
        setError(null);
    }, [product.id]);

    // Auto-dismiss confirmation
    useEffect(() => {
        if (!feedback) return;
        const t = setTimeout(() => setFeedback(null), 2500);
        return () => clearTimeout(t);
    }, [feedback]);

    const selectedSize = product.sizes.find((s) => s.id === sizeId);
    const maxQty = selectedSize?.stock;

    const handleAdd = () => {
        if (sizesInStock.length > 0 && !sizeId) {
            setError('Seleccioná un talle.');
            return;
        }
        setError(null);
        router.post('/carrito/producto', {
            product_id: product.id,
            size_id:    sizeId,
            quantity:   qty,
        }, {
            preserveScroll: true,
            preserveState:  true,
            onSuccess: () => {
                setFeedback(`✓ ${product.name} agregado al carrito (${qty} ${qty === 1 ? 'unidad' : 'unidades'}).`);
            },
            onError: () => {
                setError('No pudimos agregar el producto. Intentá de nuevo.');
            },
        });
    };

    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title={`${product.name} · Mimos`} />

            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                {/* Breadcrumb */}
                <nav className="text-[11px] uppercase tracking-[0.18em] text-brand-text-muted mb-6">
                    <Link href="/" className="hover:text-brand-text transition-colors">Inicio</Link>
                    <span className="mx-2 text-brand-text-light">/</span>
                    <Link href="/catalogo" className="hover:text-brand-text transition-colors">Catálogo</Link>
                    <span className="mx-2 text-brand-text-light">/</span>
                    <span className="text-brand-text font-semibold">{product.name}</span>
                </nav>

                {/* Detalle: galería + info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
                    <ImageGallery images={product.images} name={product.name} />

                    <div className="flex flex-col">
                        {product.categories?.[0] && (
                            <p className="text-[11px] uppercase tracking-[0.2em] text-brand-text-muted">
                                {product.categories[0].name}
                            </p>
                        )}

                        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text leading-tight">
                            {product.name}
                        </h1>

                        <p className="mt-3 text-2xl font-bold text-brand-text">
                            {fmt(product.price)}
                        </p>

                        {product.description && (
                            <p className="mt-5 text-sm leading-relaxed text-brand-text-muted whitespace-pre-line">
                                {product.description}
                            </p>
                        )}

                        {/* Colores */}
                        {product.colors?.length > 0 && (
                            <div className="mt-6">
                                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-text">
                                    Color
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {product.colors.map((c) => (
                                        <span
                                            key={c.id}
                                            className="inline-flex items-center rounded-full border border-brand-text/20 bg-white px-3 py-1 text-xs text-brand-text"
                                        >
                                            {c.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Talles */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-text">
                                    Talle
                                </p>
                                {sizesInStock.length === 0 && (
                                    <span className="text-[11px] uppercase tracking-wider text-brand-cta font-semibold">
                                        Sin stock
                                    </span>
                                )}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                                {product.sizes.map((s) => {
                                    const out = s.stock <= 0;
                                    const active = sizeId === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => !out && setSizeId(s.id)}
                                            disabled={out}
                                            className={`min-w-[52px] h-10 px-3 text-sm font-semibold border transition-colors ${
                                                active
                                                    ? 'bg-brand-text text-white border-brand-text'
                                                    : out
                                                        ? 'bg-brand-bg text-brand-text-light border-brand-secondary/30 line-through cursor-not-allowed'
                                                        : 'bg-white text-brand-text border-brand-text/30 hover:border-brand-text'
                                            }`}
                                        >
                                            {s.name}
                                        </button>
                                    );
                                })}
                                {product.sizes.length === 0 && (
                                    <p className="text-xs text-brand-text-muted italic">Sin talles cargados.</p>
                                )}
                            </div>
                        </div>

                        {/* Cantidad */}
                        <div className="mt-6">
                            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-text">
                                Cantidad
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                                <QuantityStepper value={qty} onChange={setQty} max={maxQty} />
                                {selectedSize && (
                                    <span className="text-xs text-brand-text-muted">
                                        {selectedSize.stock} disponible{selectedSize.stock === 1 ? '' : 's'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* CTA + feedback */}
                        <div className="mt-8 space-y-3">
                            <button
                                type="button"
                                onClick={handleAdd}
                                disabled={sizesInStock.length === 0}
                                className="w-full h-12 inline-flex items-center justify-center gap-2 bg-brand-cta text-white text-sm font-bold uppercase tracking-[0.18em] hover:bg-brand-cta-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 7h14l-1.5 10.5A2 2 0 0115.52 19H8.48a2 2 0 01-1.98-1.5L5 7zM9 7V5a3 3 0 016 0v2" />
                                </svg>
                                Agregar al carrito
                            </button>

                            {error && (
                                <p className="text-xs text-brand-cta-dark font-semibold" role="alert">{error}</p>
                            )}
                            {feedback && (
                                <p className="text-xs text-emerald-700 font-semibold" role="status">{feedback}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Productos relacionados */}
                {related.length > 0 && (
                    <section className="mt-16 lg:mt-20">
                        <h2 className="text-lg sm:text-xl font-extrabold tracking-wide text-brand-text uppercase">
                            Productos relacionados
                        </h2>
                        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
                            {related.map((p) => (
                                <RelatedCard key={p.id} item={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </StorefrontLayout>
    );
}
