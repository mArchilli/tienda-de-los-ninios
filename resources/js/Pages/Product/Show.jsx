import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

function fmt(price) {
    return '$' + Number(price).toLocaleString('es-AR');
}

function ImageGallery({ images, name }) {
    const [active, setActive] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState(-1);
    const list = images?.length ? images : [null];
    const slides = list.filter(Boolean).map((src) => ({ src, alt: name }));

    return (
        <>
            <div className="px-1 sm:px-2 lg:px-0">
                <div className="grid gap-4 lg:grid-cols-[86px_minmax(0,1fr)] xl:grid-cols-[94px_minmax(0,1fr)] xl:gap-4">
                    <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:max-h-[560px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pr-1">
                        {list.map((src, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setActive(index)}
                                className={`group relative shrink-0 overflow-hidden rounded-[1.1rem] border bg-white/70 transition-all duration-200 lg:w-full ${
                                    active === index
                                        ? 'border-brand-primary shadow-[0_14px_28px_rgba(61,90,128,0.16)]'
                                        : 'border-brand-primary/25 hover:border-brand-primary hover:bg-white'
                                }`}
                                aria-label={`Imagen ${index + 1}`}
                            >
                                <div className="aspect-[4/5] w-20 bg-white sm:w-24 lg:w-full">
                                    {src ? (
                                        <img
                                            src={src}
                                            alt=""
                                            className="h-full w-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-brand-primary-surface" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="order-1 lg:order-2">
                        <button
                            type="button"
                            onClick={() => list[active] && setLightboxIndex(active)}
                            disabled={!list[active]}
                            className="relative block w-full text-left disabled:cursor-default"
                            aria-label={list[active] ? 'Ver imagen ampliada' : 'Imagen no disponible'}
                        >
                            <div className="relative mx-auto aspect-[4/5] w-full max-w-[440px] overflow-hidden rounded-[1.6rem] border border-brand-cta/45 bg-white xl:max-w-[500px]">
                                {list[active] ? (
                                    <>
                                        <img
                                            src={list[active]}
                                            alt={name}
                                            className="h-full w-full object-contain"
                                        />
                                        <span className="absolute bottom-3 right-3 inline-flex items-center rounded-full bg-brand-cta px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
                                            Tocar para ampliar
                                        </span>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-brand-primary-surface">
                                        <svg className="h-16 w-16 text-brand-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <Lightbox
                open={lightboxIndex >= 0}
                index={lightboxIndex < 0 ? 0 : lightboxIndex}
                close={() => setLightboxIndex(-1)}
                slides={slides}
                plugins={[Zoom]}
                on={{ view: ({ index }) => setActive(index) }}
                zoom={{
                    maxZoomPixelRatio: 3,
                    zoomInMultiplier: 2,
                    doubleTapDelay: 300,
                    doubleClickDelay: 300,
                    scrollToZoom: true,
                }}
                carousel={{ finite: slides.length <= 1 }}
                controller={{ closeOnBackdropClick: true }}
                styles={{
                    container: { backgroundColor: 'rgba(16, 24, 40, 0.92)' },
                }}
            />
        </>
    );
}

function QuantityStepper({ value, onChange, max }) {
    const dec = () => onChange(Math.max(1, value - 1));
    const inc = () => onChange(max ? Math.min(max, value + 1) : value + 1);

    return (
        <div className="inline-flex items-center gap-2">
            <button
                type="button"
                onClick={dec}
                disabled={value <= 1}
                aria-label="Disminuir"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-primary/35 bg-white text-brand-primary shadow-sm transition-colors hover:bg-brand-primary-surface disabled:cursor-not-allowed disabled:opacity-30"
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
                </svg>
            </button>
            <span className="flex h-11 min-w-[3rem] items-center justify-center rounded-full border border-brand-primary/35 bg-white px-4 text-sm font-bold text-brand-text shadow-sm">
                {value}
            </span>
            <button
                type="button"
                onClick={inc}
                disabled={max ? value >= max : false}
                aria-label="Aumentar"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-primary/35 bg-white text-brand-primary shadow-sm transition-colors hover:bg-brand-primary-surface disabled:cursor-not-allowed disabled:opacity-30"
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
        <Link href={`/producto/${item.id}`} className="group block h-full">
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

export default function ProductShow({ product, related = [], cartCount = 0 }) {
    const sizesInStock = product.sizes.filter((size) => size.stock > 0);
    const [sizeId, setSizeId] = useState(null);
    const [qty, setQty] = useState(1);
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        setSizeId(null);
        setQty(1);
        setFeedback(null);
        setError(null);
    }, [product.id]);

    useEffect(() => {
        if (!feedback) return;
        const timeout = setTimeout(() => setFeedback(null), 2500);
        return () => clearTimeout(timeout);
    }, [feedback]);

    const selectedSize = product.sizes.find((size) => size.id === sizeId);
    const maxQty = selectedSize?.stock;

    const handleAdd = () => {
        if (sizesInStock.length > 0 && !sizeId) {
            setError('Selecciona un talle.');
            return;
        }

        setError(null);

        router.post('/carrito/producto', {
            product_id: product.id,
            size_id: sizeId,
            quantity: qty,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setFeedback(`OK: ${product.name} agregado al carrito (${qty} ${qty === 1 ? 'unidad' : 'unidades'}).`);
            },
            onError: () => {
                setError('No pudimos agregar el producto. Intenta de nuevo.');
            },
        });
    };

    return (
        <StorefrontLayout cartCount={cartCount}>
            <Head title={`${product.name} - Mimos`} />

            <section className="relative overflow-hidden bg-brand-bg">
                <div className="store-shell relative pt-1 pb-4 sm:pt-2 sm:pb-5 lg:pt-3 lg:pb-6 xl:pt-4 xl:pb-7">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 sm:mb-4">
                        <nav>
                            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-brand-primary/35 bg-white/88 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-text-muted shadow-sm backdrop-blur sm:text-[11px]">
                                <Link href="/" className="transition-colors hover:text-brand-primary">
                                    Inicio
                                </Link>
                                <span className="text-brand-text-light">/</span>
                                <Link href="/catalogo" className="transition-colors hover:text-brand-primary">
                                    Catalogo
                                </Link>
                                <span className="text-brand-text-light">/</span>
                                <span className="max-w-[16rem] truncate text-brand-text">
                                    {product.name}
                                </span>
                            </div>
                        </nav>
                        <Link
                            href="/catalogo"
                            className="inline-flex items-center gap-2 rounded-full border border-brand-primary/35 bg-white/88 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-text shadow-sm backdrop-blur transition-all hover:-translate-x-0.5 hover:border-brand-cta hover:text-brand-cta sm:text-[11px]"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Volver al catalogo
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.92fr)] xl:items-start xl:gap-7">
                        <ImageGallery images={product.images} name={product.name} />

                        <div className="store-panel px-5 py-5 sm:px-6 sm:py-6 lg:px-6 lg:py-6">
                            <div className="flex flex-col gap-5">
                                <div className="rounded-[1.4rem] border border-brand-cta/40 bg-white/96 px-4 py-4 sm:px-5 sm:py-5">
                                    {product.categories?.[0] && (
                                        <span className="inline-flex rounded-full bg-brand-primary-surface px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                                            {product.categories[0].name}
                                        </span>
                                    )}

                                    <h1 className="mt-3 text-[2rem] font-extrabold leading-[0.95] tracking-[-0.03em] text-brand-text sm:text-[2.45rem]">
                                        {product.name}
                                    </h1>

                                    <div className="mt-5">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-text-muted">
                                            Precio
                                        </p>
                                        <p className="mt-1 text-3xl font-extrabold tracking-[-0.03em] text-brand-cta sm:text-[2.15rem]">
                                            {fmt(product.price)}
                                        </p>
                                    </div>

                                    {product.description && (
                                        <div className="mt-5">
                                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-text">
                                                Descripcion
                                            </p>
                                            <p className="text-sm leading-relaxed text-brand-text-muted whitespace-pre-line">
                                                {product.description}
                                            </p>
                                        </div>
                                    )}
                                    {product.colors?.length > 0 && (
                                        <div className="mt-5">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-text">
                                                Color
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2.5">
                                                {product.colors.map((color) => (
                                                    <span
                                                        key={color.id}
                                                        className="text-sm font-medium text-brand-text"
                                                    >
                                                        {color.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-[1.25rem] border border-brand-primary/35 bg-white/95 px-4 py-4 sm:px-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-text">
                                            Talle
                                        </p>
                                        {sizesInStock.length === 0 && (
                                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-cta">
                                                Sin stock
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 grid grid-cols-3 gap-2.5">
                                        {product.sizes.map((size) => {
                                            const out = size.stock <= 0;
                                            const active = sizeId === size.id;

                                            return (
                                                <button
                                                    key={size.id}
                                                    type="button"
                                                    onClick={() => !out && setSizeId(size.id)}
                                                    disabled={out}
                                                    className={`w-full rounded-[0.75rem] border px-3 py-2.5 text-center text-sm font-semibold transition-all ${
                                                        active
                                                            ? 'border-brand-primary bg-brand-primary text-white shadow-[0_12px_24px_rgba(61,90,128,0.24)]'
                                                            : out
                                                                ? 'cursor-not-allowed border-brand-primary/20 bg-brand-bg text-brand-text-light line-through'
                                                                : 'border-brand-primary/35 bg-white text-brand-text hover:border-brand-primary hover:text-brand-primary'
                                                    }`}
                                                >
                                                    {size.name}
                                                </button>
                                            );
                                        })}

                                        {product.sizes.length === 0 && (
                                            <p className="col-span-3 text-xs italic text-brand-text-muted">
                                                Sin talles cargados.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-1">
                                    <div className="flex items-end gap-3">
                                        {selectedSize && (
                                            <div className="shrink-0">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-text">
                                                    Cantidad
                                                </p>
                                                <div className="mt-3">
                                                    <QuantityStepper value={qty} onChange={setQty} max={maxQty} />
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleAdd}
                                            disabled={sizesInStock.length === 0}
                                            className="home-button inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-brand-cta px-5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-brand-cta-dark disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 7h14l-1.5 10.5A2 2 0 0115.52 19H8.48a2 2 0 01-1.98-1.5L5 7zM9 7V5a3 3 0 016 0v2" />
                                            </svg>
                                            Agregar al carrito
                                        </button>
                                    </div>

                                    {selectedSize && (
                                        <span className="block text-xs font-medium text-brand-text-muted">
                                            {selectedSize.stock} disponible{selectedSize.stock === 1 ? '' : 's'}
                                        </span>
                                    )}

                                    <div className="flex items-start gap-3 rounded-[1.25rem] border border-brand-primary/35 bg-brand-primary-surface/35 px-4 py-3">
                                        <svg className="mt-0.5 h-5 w-5 shrink-0 text-brand-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17h6M11 19h2M4 6h11v8H4zM15 9h2.5l2.5 2.5V14h-5zM7 17a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm10 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                                        </svg>
                                        <p className="text-sm leading-relaxed text-brand-text">
                                            <span className="font-extrabold text-brand-text">A TODO EL PAIS:</span>{' '}
                                            Envios a todo el pais por Corre Argentino y Andreani
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="rounded-[1rem] border border-brand-cta/25 bg-brand-cta-surface px-4 py-3 text-xs font-semibold text-brand-cta-dark" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    {feedback && (
                                        <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700" role="status">
                                            {feedback}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {related.length > 0 && (
                        <section className="mt-14 sm:mt-16 lg:mt-20">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <h2 className="home-section-title">
                                    PRODUCTOS RELACIONADOS
                                </h2>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5 xl:gap-5 2xl:grid-cols-6">
                                {related.map((item) => (
                                    <RelatedCard key={item.id} item={item} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </section>
        </StorefrontLayout>
    );
}
