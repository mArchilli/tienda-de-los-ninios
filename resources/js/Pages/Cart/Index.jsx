import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR') + ' ARS';
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
                className="flex h-10 w-10 items-center justify-center border border-brand-primary/35 bg-white text-brand-primary shadow-sm transition-colors hover:bg-brand-primary-surface disabled:cursor-not-allowed disabled:opacity-40"
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
                className="h-10 w-14 border border-brand-primary/35 bg-white text-center text-sm font-semibold text-brand-text shadow-sm focus:outline-none"
            />
            <button
                type="button"
                onClick={inc}
                disabled={value >= max}
                aria-label="Aumentar"
                className="flex h-10 w-10 items-center justify-center border border-brand-primary/35 bg-white text-brand-primary shadow-sm transition-colors hover:bg-brand-primary-surface disabled:cursor-not-allowed disabled:opacity-40"
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
        return <img src={src} alt={alt} className="h-24 w-24 border border-brand-primary/20 bg-white object-cover" />;
    }

    return (
        <div className="flex h-24 w-24 items-center justify-center border border-brand-primary/20 bg-brand-primary-surface">
            <svg className="h-8 w-8 text-brand-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
    );
}

function CartLine({ item }) {
    const [qty, setQty] = useState(item.quantity);

    const updateQty = (next) => {
        setQty(next);
        router.patch(`/carrito/${item.key}`, { quantity: next }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const remove = () => {
        router.delete(`/carrito/${item.key}`, { preserveScroll: true });
    };

    return (
        <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-6 border border-brand-primary/25 bg-white p-4 shadow-[0_16px_34px_rgba(41,50,65,0.07)]">
            <ItemThumb src={item.image} alt={item.name} />

            <div className="min-w-0">
                <h3 className="text-sm font-extrabold uppercase tracking-[0.04em] text-brand-text">{item.name}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                    {item.size_name && (
                        <span className="inline-flex items-center border border-brand-primary/25 bg-brand-primary-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-primary">
                            Talle: {item.size_name}
                        </span>
                    )}
                    {item.type === 'combo' && item.gender_name && (
                        <span className="inline-flex items-center border border-brand-cta/20 bg-brand-cta-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-cta">
                            {item.gender_name}
                        </span>
                    )}
                    {item.type === 'combo' && (
                        <span className="inline-flex items-center border border-brand-primary/20 bg-brand-secondary-surface px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-text-muted">
                            Combo
                        </span>
                    )}
                </div>

                <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-primary">Precio</p>
                    <p className="text-sm font-semibold text-brand-text">{fmt(item.price)}</p>
                </div>
            </div>

            <div className="flex flex-col items-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-text-muted">Cantidad</p>
                <div className="mt-1">
                    <QuantityStepper value={qty} onChange={updateQty} />
                </div>
            </div>

            <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-text-muted">Total</p>
                <p className="mt-1 text-lg font-bold text-brand-primary">{fmt(item.subtotal)}</p>
            </div>

            <button
                type="button"
                onClick={remove}
                aria-label="Eliminar"
                className="col-start-4 row-start-1 -mt-2 ml-auto flex h-10 w-10 items-center justify-center bg-brand-cta text-white shadow-md transition-colors hover:bg-brand-cta-dark"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 0V4a1 1 0 011-1h2a1 1 0 011 1v3m-7 0h10" />
                </svg>
            </button>
        </div>
    );
}

function SummaryRow({ label, value, accent }) {
    return (
        <div className={`flex items-center justify-between border px-4 py-3 ${accent ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-primary/25 bg-white'}`}>
            <span className={`text-sm font-semibold uppercase tracking-[0.12em] ${accent ? 'text-white' : 'text-brand-primary'}`}>{label}</span>
            <span className={`text-sm font-bold ${accent ? 'text-white text-base' : 'text-brand-text'}`}>{value}</span>
        </div>
    );
}

export default function CartIndex({ cart }) {
    const items = cart?.items ?? [];
    const subtotal = cart?.subtotal ?? 0;
    const isEmpty = items.length === 0;

    const clear = () => {
        if (confirm('\u00bfVaciar el carrito?')) {
            router.delete('/carrito', { preserveScroll: true });
        }
    };

    return (
        <StorefrontLayout>
            <Head title="Mi carrito · Mimos" />

            <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <span className="inline-flex border border-brand-primary/25 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                        Pedido
                    </span>
                    <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-brand-text">
                        Mi carrito
                    </h1>
                    <p className="mt-1 text-sm text-brand-text-muted">
                        Revisá tus productos antes de finalizar la compra
                    </p>
                </div>

                <div className="mt-6">
                    <Link
                        href="/catalogo"
                        className="inline-flex items-center gap-2 border border-brand-primary/35 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-brand-primary shadow-sm transition-colors hover:bg-brand-primary hover:text-white"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver
                    </Link>
                </div>

                {isEmpty ? (
                    <div className="mt-12 border border-brand-primary/25 bg-white p-12 text-center shadow-[0_18px_36px_rgba(41,50,65,0.06)]">
                        <p className="text-lg font-extrabold uppercase tracking-[0.08em] text-brand-text">Tu carrito está vacío</p>
                        <p className="mt-2 text-sm text-brand-text-muted">Agregá productos o combos del catálogo para verlos aquí.</p>
                        <Link
                            href="/catalogo"
                            className="mt-6 inline-flex items-center gap-2 bg-brand-cta px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-brand-cta-dark"
                        >
                            Ir al catálogo
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <CartLine key={item.key} item={item} />
                            ))}
                        </div>

                        <aside className="space-y-3 self-start border border-brand-primary/25 bg-white p-5 shadow-[0_18px_36px_rgba(41,50,65,0.08)]">
                            <div className="border border-brand-primary bg-brand-primary px-4 py-4 text-white">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/72">Resumen</p>
                                <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">Tu compra</h2>
                            </div>

                            <SummaryRow label="Subtotal" value={fmt(subtotal)} />
                            <SummaryRow label="Envío" value="Se calcula en el checkout" />
                            <SummaryRow label="Total" value={fmt(subtotal)} accent />

                            <button
                                type="button"
                                onClick={clear}
                                className="w-full border border-brand-cta bg-white py-3 text-sm font-bold uppercase tracking-[0.12em] text-brand-cta transition-colors hover:bg-brand-cta hover:text-white"
                            >
                                Vaciar carrito
                            </button>

                            <Link
                                href="/checkout"
                                className="block w-full bg-brand-cta py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-brand-cta-dark"
                            >
                                Continuar compra
                            </Link>
                        </aside>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
