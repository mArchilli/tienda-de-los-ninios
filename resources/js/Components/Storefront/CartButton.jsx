import { useState, useRef, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR') + ' ARS';
}

function QuantityStepper({ value, onChange }) {
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
                onClick={() => onChange(Math.min(99, value + 1))}
                disabled={value >= 99}
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

    useEffect(() => {
        setQty(item.quantity);
    }, [item.quantity]);

    const updateQty = (next) => {
        setQty(next);
        router.patch(`/carrito/${item.key}`, { quantity: next }, {
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
                    <QuantityStepper value={qty} onChange={updateQty} />
                    <p className="text-sm sm:text-xs font-bold text-brand-primary">{fmt(item.subtotal)}</p>
                </div>
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

    return (
        <div ref={wrapRef} className="fixed bottom-24 right-6 z-50">
            {/* Floating panel */}
            {open && (
                <div className="absolute bottom-full right-0 mb-3 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-brand-secondary/30 animate-fade-in overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3.5 sm:py-3 border-b border-brand-secondary/15 bg-gradient-to-r from-brand-primary-surface to-brand-secondary-surface">
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 sm:h-4 sm:w-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 7h14l-1.5 10.5A2 2 0 0115.52 19H8.48a2 2 0 01-1.98-1.5L5 7zM9 7V5a3 3 0 016 0v2" />
                            </svg>
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
                            className="flex h-9 w-9 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-white/70 text-brand-text-muted hover:bg-white hover:text-brand-text transition-colors"
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
                                <svg className="h-12 w-12 sm:h-10 sm:w-10 text-brand-secondary/40 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M5 7h14l-1.5 10.5A2 2 0 0115.52 19H8.48a2 2 0 01-1.98-1.5L5 7zM9 7V5a3 3 0 016 0v2" />
                                </svg>
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
                        <div className="border-t border-brand-secondary/15 px-4 py-4 sm:py-3 bg-brand-bg/60 space-y-3 sm:space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider">Subtotal</span>
                                <span className="text-base sm:text-sm font-bold text-brand-primary">{fmt(cart.subtotal)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    href="/carrito"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-center rounded-full border border-brand-primary/40 bg-white py-3 sm:py-2 text-sm sm:text-xs font-semibold text-brand-primary hover:bg-brand-primary-surface transition"
                                >
                                    Ver carrito
                                </Link>
                                <Link
                                    href="/checkout"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary-dark py-3 sm:py-2 text-sm sm:text-xs font-bold text-white hover:opacity-95 transition"
                                >
                                    Checkout
                                </Link>
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
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 7h14l-1.5 10.5A2 2 0 0115.52 19H8.48a2 2 0 01-1.98-1.5L5 7zM9 7V5a3 3 0 016 0v2" />
                </svg>
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-cta px-1 text-[10px] font-bold text-white shadow">
                        {count}
                    </span>
                )}
            </button>
        </div>
    );
}
