import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

function fmt(price) {
    return '$' + Number(price).toLocaleString('es-AR') + ' ARS';
}

function QuantityStepper({ value, onChange, min = 1, max = 99 }) {
    const dec = () => onChange(Math.max(min, value - 1));
    const inc = () => onChange(Math.min(max, value + 1));

    return (
        <div className="inline-flex items-center gap-2">
            <button
                type="button"
                onClick={dec}
                disabled={value <= min}
                aria-label="Disminuir"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-primary/35 bg-white text-brand-primary shadow-sm transition-colors hover:bg-brand-primary-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
                </svg>
            </button>

            <input
                type="text"
                inputMode="numeric"
                value={value}
                readOnly
                className="h-10 w-14 rounded-full border border-brand-primary/35 bg-white text-center text-sm font-semibold text-brand-text shadow-sm focus:outline-none"
            />

            <button
                type="button"
                onClick={inc}
                disabled={value >= max}
                aria-label="Aumentar"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-primary/35 bg-white text-brand-primary shadow-sm transition-colors hover:bg-brand-primary-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
                </svg>
            </button>
        </div>
    );
}

function ItemThumb({ src, alt }) {
    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                className="h-28 w-24 rounded-[1.1rem] border border-brand-primary/20 bg-white object-cover sm:h-32 sm:w-32 sm:rounded-[1.2rem]"
            />
        );
    }

    return (
        <div className="flex h-28 w-24 items-center justify-center rounded-[1.1rem] border border-brand-primary/20 bg-brand-primary-surface sm:h-32 sm:w-32 sm:rounded-[1.2rem]">
            <svg className="h-8 w-8 text-brand-primary/30 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
    );
}

function CartLine({ item }) {
    const [qty, setQty] = useState(item.quantity);

    const maxQty = typeof item.max_quantity === 'number' ? item.max_quantity : 99;
    const outOfStock = maxQty <= 0;
    const insufficient = !outOfStock && qty > maxQty;

    useEffect(() => {
        setQty(item.quantity);
    }, [item.quantity]);

    const updateQty = (next) => {
        const clamped = Math.min(Math.max(1, next), Math.max(1, maxQty));
        setQty(clamped);
        router.patch(`/carrito/${item.key}`, { quantity: clamped }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const remove = () => {
        router.delete(`/carrito/${item.key}`, { preserveScroll: true });
    };

    const hasStockIssue = outOfStock || insufficient;

    return (
        <div className={`rounded-[1.4rem] border bg-white p-4 shadow-[0_16px_34px_rgba(41,50,65,0.07)] sm:p-5 ${hasStockIssue ? 'border-brand-cta/60 ring-1 ring-brand-cta/40' : 'border-brand-primary/25'}`}>
            <div className="flex items-start gap-4">
                <ItemThumb src={item.image} alt={item.name} />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                            <h3 className="text-base font-extrabold leading-tight text-brand-text sm:text-[1.35rem]">{item.name}</h3>

                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {item.size_name && (
                                    <span className="inline-flex items-center rounded-full border border-brand-primary/25 bg-brand-primary-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-primary sm:px-3 sm:text-[12px]">
                                        Talle: {item.size_name}
                                    </span>
                                )}

                                {item.type === 'combo' && item.gender_name && (
                                    <span className="inline-flex items-center rounded-full border border-brand-cta/20 bg-brand-cta-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-cta sm:px-3 sm:text-[12px]">
                                        {item.gender_name}
                                    </span>
                                )}

                                {item.type === 'combo' && (
                                    <span className="inline-flex items-center rounded-full border border-brand-primary/20 bg-brand-secondary-surface px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-text-muted sm:px-3 sm:text-[12px]">
                                        Combo
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0 sm:text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-text-muted sm:text-[11px]">Precio</p>
                            <p className="mt-1 text-base font-extrabold text-brand-cta sm:text-xl">{fmt(item.price)}</p>
                        </div>
                    </div>

                    {item.type === 'combo' && item.picks_display?.length > 0 && (
                        <div className="mt-3 space-y-1 border-l-2 border-brand-primary/20 pl-2.5">
                            {item.picks_display.map((group, index) => (
                                <div key={index} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[11px]">
                                    <span className="shrink-0 font-bold uppercase tracking-[0.08em] text-brand-text-muted">
                                        {group.category_name}:
                                    </span>
                                    <span className="text-brand-text">{group.products.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {hasStockIssue && (
                <div className="mt-3 flex items-start gap-2 rounded-[0.9rem] border border-brand-cta/35 bg-brand-cta-surface px-3 py-2 text-[12px] font-semibold text-brand-cta">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span>
                        {outOfStock
                            ? 'Sin stock disponible en el talle seleccionado. Eliminá este ítem o probá otro talle.'
                            : `Solo quedan ${maxQty} unidad${maxQty === 1 ? '' : 'es'} disponibles. Ajustá la cantidad para continuar.`}
                    </span>
                </div>
            )}

            <div className="mt-4 flex flex-col gap-4 border-t border-brand-primary/12 pt-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col items-start">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-text-muted">Cantidad</p>
                    <div className="mt-1">
                        <QuantityStepper value={qty} onChange={updateQty} max={Math.max(1, maxQty)} />
                    </div>
                </div>

                <div className="flex items-end justify-between gap-4 sm:justify-end">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-text-muted">Total</p>
                        <p className="mt-1 text-lg font-bold text-brand-primary">{fmt(item.subtotal)}</p>
                    </div>

                    <button
                        type="button"
                        onClick={remove}
                        aria-label="Eliminar"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cta text-white shadow-md transition-colors hover:bg-brand-cta-dark"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 0V4a1 1 0 011-1h2a1 1 0 011 1v3m-7 0h10" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

function SummaryRow({ label, value, accent }) {
    return (
        <div className="flex items-center justify-between py-3">
            <span className={`text-sm font-semibold uppercase tracking-[0.12em] ${accent ? 'text-brand-primary' : 'text-brand-text-muted'}`}>{label}</span>
            <span className={`font-bold ${accent ? 'text-lg text-brand-primary' : 'text-sm text-brand-text'}`}>{value}</span>
        </div>
    );
}

export default function CartIndex({ cart }) {
    const items = cart?.items ?? [];
    const subtotal = cart?.subtotal ?? 0;
    const isEmpty = items.length === 0;

    const hasStockIssue = items.some((item) => {
        const max = typeof item.max_quantity === 'number' ? item.max_quantity : 99;
        return max <= 0 || item.quantity > max;
    });

    const clear = () => {
        if (confirm('Vaciar el carrito?')) {
            router.delete('/carrito', { preserveScroll: true });
        }
    };

    return (
        <StorefrontLayout>
            <Head title="Mi carrito · Mimos" />

            <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <span className="inline-flex rounded-full border border-brand-primary/25 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                        Pedido
                    </span>
                    <h1 className="home-section-title mt-3">
                        Mi carrito
                    </h1>
                    <p className="mt-1 text-sm text-brand-text-muted">
                        Revisa tus productos antes de finalizar la compra
                    </p>
                </div>

                <div className="mt-6">
                    <Link
                        href="/catalogo"
                        className="inline-flex items-center gap-2 rounded-full border border-brand-primary/35 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-brand-primary shadow-sm transition-colors hover:bg-brand-primary hover:text-white"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver
                    </Link>
                </div>

                {isEmpty ? (
                    <div className="mt-12 rounded-[1.5rem] border border-brand-primary/25 bg-white p-12 text-center shadow-[0_18px_36px_rgba(41,50,65,0.06)]">
                        <p className="text-lg font-extrabold uppercase tracking-[0.08em] text-brand-text">Tu carrito esta vacio</p>
                        <p className="mt-2 text-sm text-brand-text-muted">Agrega productos o combos del catalogo para verlos aqui.</p>
                        <Link
                            href="/catalogo"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-cta px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-brand-cta-dark"
                        >
                            Ir al catalogo
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <CartLine key={item.key} item={item} />
                            ))}
                        </div>

                        <aside className="space-y-3 self-start rounded-[1.5rem] border border-brand-primary/25 bg-white p-5 shadow-[0_18px_36px_rgba(41,50,65,0.08)]">
                            <div className="rounded-[1rem] border border-brand-primary bg-brand-primary px-4 py-4 text-white">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/72">Resumen</p>
                                <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">Tu compra</h2>
                            </div>

                            <div className="rounded-[1.2rem] border border-brand-primary/25 bg-brand-primary-surface/45 px-4">
                                <SummaryRow label="Subtotal" value={fmt(subtotal)} />
                                <div className="border-t border-brand-primary/12">
                                    <SummaryRow label="Envio" value="Se calcula en el checkout" />
                                </div>
                                <div className="border-t border-brand-primary/12">
                                    <SummaryRow label="Total" value={fmt(subtotal)} accent />
                                </div>
                            </div>

                            {hasStockIssue ? (
                                <button
                                    type="button"
                                    disabled
                                    aria-disabled="true"
                                    className="block w-full cursor-not-allowed rounded-full bg-brand-cta/40 py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-white"
                                    title="Ajustá las cantidades sin stock antes de continuar."
                                >
                                    Continuar compra
                                </button>
                            ) : (
                                <Link
                                    href="/checkout"
                                    className="block w-full rounded-full bg-brand-cta py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-brand-cta-dark"
                                >
                                    Continuar compra
                                </Link>
                            )}

                            {hasStockIssue && (
                                <p className="text-center text-[11px] font-semibold text-brand-cta">
                                    Hay ítems sin stock suficiente. Revisá las cantidades antes de seguir.
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={clear}
                                className="w-full rounded-full border border-brand-cta bg-white py-3 text-sm font-bold uppercase tracking-[0.12em] text-brand-cta transition-colors hover:bg-brand-cta hover:text-white"
                            >
                                Vaciar carrito
                            </button>
                        </aside>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
