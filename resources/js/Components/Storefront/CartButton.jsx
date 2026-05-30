import { useState, useRef, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import CartIcon from './CartIcon';

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR') + ' ARS';
}

function QuantityStepper({ value, onChange, max = 99 }) {
    const effectiveMax = Math.max(1, max);
    return (
        <div className="inline-flex items-center gap-2">
            <button
                type="button"
                onClick={() => onChange(Math.max(1, value - 1))}
                disabled={value <= 1}
                aria-label="Disminuir"
                className="flex h-9 w-9 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-brand-secondary-surface text-brand-text-muted hover:bg-brand-secondary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <svg className="h-3.5 w-3.5 sm:h-2.5 sm:w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
                </svg>
            </button>
            <span className="h-9 w-10 sm:h-6 sm:w-8 rounded border border-brand-primary/30 bg-white text-center text-sm sm:text-xs font-semibold text-brand-text flex items-center justify-center select-none">
                {value}
            </span>
            <button
                type="button"
                onClick={() => onChange(Math.min(effectiveMax, value + 1))}
                disabled={value >= effectiveMax}
                aria-label="Aumentar"
                className="flex h-9 w-9 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-brand-secondary-surface text-brand-text-muted hover:bg-brand-secondary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <svg className="h-3.5 w-3.5 sm:h-2.5 sm:w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
                </svg>
            </button>
        </div>
    );
}

function CartItem({ item }) {
    const [qty, setQty] = useState(item.quantity);

    const maxQty = typeof item.max_quantity === 'number' ? item.max_quantity : 99;
    const outOfStock = maxQty <= 0;
    const insufficient = !outOfStock && qty > maxQty;
    const hasStockIssue = outOfStock || insufficient;

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
        router.delete(`/carrito/${item.key}`, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    return (
        <div className="flex items-start gap-3 px-4 py-4 sm:py-3 border-b border-brand-secondary/15 last:border-0">
            {item.image ? (
                <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 sm:h-14 sm:w-14 rounded-xl object-cover bg-white flex-shrink-0 shadow-sm"
                />
            ) : (
                <div className="flex h-16 w-16 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-brand-primary-surface flex-shrink-0">
                    <svg className="h-6 w-6 sm:h-5 sm:w-5 text-brand-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-xs font-semibold text-brand-text leading-tight truncate">{item.name}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.size_name && (
                        <span className="inline-flex items-center rounded-full bg-brand-primary-surface px-2 py-0.5 text-[11px] sm:text-[10px] font-semibold text-brand-primary">
                            T: {item.size_name}
                        </span>
                    )}
                    {item.type === 'combo' && item.gender_name && (
                        <span className="inline-flex items-center rounded-full bg-brand-cta-surface px-2 py-0.5 text-[11px] sm:text-[10px] font-semibold text-brand-cta">
                            {item.gender_name}
                        </span>
                    )}
                    {item.type === 'combo' && (
                        <span className="inline-flex items-center rounded-full bg-brand-secondary-surface px-2 py-0.5 text-[11px] sm:text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">
                            Combo
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between mt-2.5 sm:mt-2">
                    <QuantityStepper value={qty} onChange={updateQty} max={maxQty} />
                    <p className="text-sm sm:text-xs font-bold text-brand-primary">{fmt(item.subtotal)}</p>
                </div>
                {hasStockIssue && (
                    <p className="mt-1.5 text-[11px] sm:text-[10px] font-semibold text-brand-cta">
                        {outOfStock
                            ? 'Sin stock disponible'
                            : `Solo quedan ${maxQty} unidad${maxQty === 1 ? '' : 'es'}`}
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={remove}
                aria-label="Eliminar"
                className="flex-shrink-0 flex h-9 w-9 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-brand-cta/10 text-brand-cta hover:bg-brand-cta hover:text-white transition-colors"
            >
                <svg className="h-4 w-4 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 0V4a1 1 0 011-1h2a1 1 0 011 1v3m-7 0h10" />
                </svg>
            </button>
        </div>
    );
}

export default function CartButton() {
    const [open, setOpen] = useState(false);
    const { props, url } = usePage();
    const cart  = props.floatingCart ?? { items: [], subtotal: 0 };
    const count = props.cartCount ?? 0;
    const wrapRef = useRef(null);

    // Hide on cart/checkout pages since they already show cart content
    if (url.startsWith('/carrito') || url.startsWith('/checkout')) return null;

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handle = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [open]);

    const isEmpty = cart.items.length === 0;
    const hasStockIssue = cart.items.some((item) => {
        const max = typeof item.max_quantity === 'number' ? item.max_quantity : 99;
        return max <= 0 || item.quantity > max;
    });

    return (
        <div ref={wrapRef} className="fixed bottom-24 right-6 z-50">
            {/* Floating panel */}
            {open && (
                <div className="absolute bottom-full right-0 mb-3 w-[calc(100vw-2rem)] overflow-hidden rounded-[1.6rem] border border-brand-cta/35 bg-white shadow-[0_28px_56px_rgba(41,50,65,0.18)] animate-fade-in sm:w-80">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-brand-cta/20 bg-gradient-to-r from-brand-primary-surface to-brand-cta-surface px-4 py-3.5 sm:py-3">
                        <div className="flex items-center gap-2">
                            <CartIcon className="h-5 w-5 text-brand-primary sm:h-4 sm:w-4" />
                            <h2 className="text-base sm:text-sm font-bold text-brand-primary">Mi Carrito</h2>
                            {count > 0 && (
                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-cta px-1.5 text-[10px] font-bold text-white">
                                    {count}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Cerrar"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-cta/25 bg-white/80 text-brand-text-muted transition-colors hover:border-brand-cta hover:bg-white hover:text-brand-cta sm:h-6 sm:w-6"
                        >
                            <svg className="h-4 w-4 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Items */}
                    <div className="max-h-80 sm:max-h-64 overflow-y-auto">
                        {isEmpty ? (
                            <div className="px-4 py-10 sm:py-8 text-center">
                                <CartIcon className="mx-auto h-12 w-12 text-brand-secondary/40 sm:h-10 sm:w-10" strokeWidth={1.5} />
                                <p className="mt-2 text-sm sm:text-xs font-semibold text-brand-text-muted">Tu carrito está vacío</p>
                                <Link
                                    href="/catalogo"
                                    onClick={() => setOpen(false)}
                                    className="mt-4 inline-flex items-center rounded-full bg-brand-cta px-5 py-2 sm:px-4 sm:py-1.5 text-sm sm:text-xs font-bold text-white hover:bg-brand-cta-dark transition"
                                >
                                    Ir al catálogo
                                </Link>
                            </div>
                        ) : (
                            cart.items.map((item) => (
                                <CartItem key={item.key} item={item} />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {!isEmpty && (
                        <div className="space-y-3 border-t border-brand-cta/20 bg-brand-bg/60 px-4 py-4 sm:space-y-2.5 sm:py-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Subtotal</span>
                                <span className="text-base sm:text-sm font-bold text-brand-primary">{fmt(cart.subtotal)}</span>
                            </div>
                            {hasStockIssue && (
                                <p className="rounded-md bg-brand-cta-surface px-2.5 py-1.5 text-[11px] font-semibold text-brand-cta">
                                    Hay ítems sin stock suficiente. Ajustá las cantidades antes de continuar.
                                </p>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/carrito"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-center rounded-full border border-brand-cta/40 bg-white py-3 text-sm font-semibold text-brand-cta transition hover:bg-brand-cta-surface sm:py-2 sm:text-xs"
                                >
                                    Ver carrito
                                </Link>
                                {hasStockIssue ? (
                                    <button
                                        type="button"
                                        disabled
                                        aria-disabled="true"
                                        title="Ajustá las cantidades sin stock antes de continuar."
                                        className="flex cursor-not-allowed items-center justify-center rounded-full bg-brand-cta/40 py-3 text-sm font-bold text-white sm:py-2 sm:text-xs"
                                    >
                                        Checkout
                                    </button>
                                ) : (
                                    <Link
                                        href="/checkout"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center justify-center rounded-full bg-brand-cta py-3 text-sm font-bold text-white transition-colors hover:bg-brand-cta-dark sm:py-2 sm:text-xs"
                                    >
                                        Checkout
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Floating button */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label={count > 0 ? `Carrito (${count} items)` : 'Carrito'}
                className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95 bg-brand-primary"
            >
                <CartIcon className="h-7 w-7 text-white" />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-cta px-1 text-[10px] font-bold text-white shadow">
                        {count}
                    </span>
                )}
            </button>
        </div>
    );
}
