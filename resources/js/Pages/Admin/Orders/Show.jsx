import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR') + ' ARS';
}

function fmtDate(iso) {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        return d.toLocaleString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

const SHIPPING_LABEL = { home: 'A Domicilio', branch: 'A Sucursal' };

const STATUS_BADGE = {
    pending:    'bg-amber-100 text-amber-700 border-amber-200',
    dispatched: 'bg-sky-100 text-sky-700 border-sky-200',
    delivered:  'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const STATUS_LABEL = {
    pending:    'Pendiente',
    dispatched: 'Despachado',
    delivered:  'Entregado',
};

// ─── Flash banner ─────────────────────────────────────────────────────────────

function FlashBanner({ message, onDismiss }) {
    useEffect(() => {
        if (!message) return;
        const t = setTimeout(onDismiss, 3500);
        return () => clearTimeout(t);
    }, [message, onDismiss]);

    if (!message) return null;

    return (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
            <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="flex-1">{message}</span>
            <button onClick={onDismiss} className="text-emerald-400 hover:text-emerald-600 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function Card({ title, children }) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-brand-text">{title}</h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function Row({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
            <span className="text-brand-text-muted">{label}</span>
            <span className="text-right font-medium text-brand-text">{value}</span>
        </div>
    );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────

function Thumb({ src, alt }) {
    if (!src) {
        return (
            <div className="h-28 w-28 shrink-0 rounded-xl bg-brand-primary-surface flex items-center justify-center">
                <svg className="h-10 w-10 text-brand-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={alt}
            className="h-28 w-28 shrink-0 rounded-xl object-cover bg-white border border-gray-100"
        />
    );
}

// ─── Item de prenda (producto simple) ─────────────────────────────────────────

function ProductItem({ item }) {
    return (
        <li className="flex gap-4 py-4">
            <Thumb src={item.image} alt={item.name} />
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <span className="inline-flex items-center rounded-full border border-brand-primary/20 bg-brand-primary-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                            Prenda
                        </span>
                        <p className="mt-1 font-semibold text-brand-text">{item.name}</p>
                    </div>
                    <div className="text-right text-sm shrink-0">
                        <p className="text-brand-text-muted text-xs">{fmt(item.price)} c/u</p>
                        <p className="font-bold text-brand-primary">{fmt(item.subtotal)}</p>
                    </div>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-text-muted">
                    {item.size    && <span>Talle: <strong className="text-brand-text">{item.size}</strong></span>}
                    <span>Cantidad: <strong className="text-brand-text">{item.quantity}</strong></span>
                </div>
            </div>
        </li>
    );
}

// ─── Item de combo ────────────────────────────────────────────────────────────

function ComboItem({ item }) {
    return (
        <li className="py-4">
            <div className="flex gap-4">
                <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover bg-white border border-gray-100"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                                Combo
                            </span>
                            <p className="mt-1 font-semibold text-brand-text">{item.name}</p>
                        </div>
                        <div className="text-right text-sm shrink-0">
                            <p className="text-brand-text-muted text-xs">{fmt(item.price)} c/u</p>
                            <p className="font-bold text-brand-primary">{fmt(item.subtotal)}</p>
                        </div>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-text-muted">
                        {item.size   && <span>Talle: <strong className="text-brand-text">{item.size}</strong></span>}
                        {item.gender && <span>Género: <strong className="text-brand-text">{item.gender}</strong></span>}
                        <span>Cantidad: <strong className="text-brand-text">{item.quantity}</strong></span>
                    </div>
                </div>
            </div>

            {/* Prendas elegidas dentro del combo */}
            {item.picks?.length > 0 && (
                <div className="mt-3 rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                    <p className="mb-3 text-xs font-semibold text-purple-600 uppercase tracking-wider">
                        Prendas incluidas
                    </p>
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {item.picks.map((pick, idx) => (
                            <li key={idx} className="flex flex-col items-center gap-2 text-center">
                                {pick.image ? (
                                    <img
                                        src={pick.image}
                                        alt={pick.name}
                                        className="h-44 w-44 rounded-xl object-cover bg-white border border-purple-100 shadow-sm"
                                    />
                                ) : (
                                    <div className="h-44 w-44 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                                        </svg>
                                    </div>
                                )}
                                <span className="text-xs font-medium text-brand-text leading-tight">{pick.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </li>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersShow({ order }) {
    const flash = usePage().props.flash;
    const [flashMessage, setFlashMessage] = useState(flash?.success ?? null);
    const [processing, setProcessing]     = useState(false);

    useEffect(() => {
        if (flash?.success) setFlashMessage(flash.success);
    }, [flash]);

    const isPending  = order.shipping_status === 'pending';
    const nextStatus = isPending ? 'dispatched' : 'pending';

    const toggleStatus = () => {
        if (processing) return;
        setProcessing(true);
        router.patch(
            route('admin.orders.update-status', order.id),
            { shipping_status: nextStatus },
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('admin.orders.index')}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-brand-text-muted hover:border-brand-primary hover:text-brand-primary transition-colors"
                                title="Volver a pedidos"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-bold text-brand-text">Pedido #{order.id}</h1>
                            <span
                                className={
                                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ' +
                                    (STATUS_BADGE[order.shipping_status] ?? 'bg-gray-100 text-brand-text-muted border-gray-200')
                                }
                            >
                                {STATUS_LABEL[order.shipping_status] ?? order.shipping_status}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-brand-text-muted">
                            Generado el {fmtDate(order.created_at)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={toggleStatus}
                        disabled={processing}
                        className={
                            'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed ' +
                            (isPending ? 'bg-sky-600 hover:bg-sky-700' : 'bg-amber-600 hover:bg-amber-700')
                        }
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isPending ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 12a9 9 0 109-9M3 12l3-3m-3 3l3 3" />
                            )}
                        </svg>
                        {processing ? 'Actualizando…' : isPending ? 'Marcar como Despachado' : 'Volver a Pendiente'}
                    </button>
                </div>
            }
        >
            <Head title={`Pedido #${order.id}`} />

            <div className="p-6 space-y-5">
                <FlashBanner message={flashMessage} onDismiss={() => setFlashMessage(null)} />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
                    {/* ── Columna principal ───────────────────────────── */}
                    <div className="space-y-5">
                        <Card title="Prendas del pedido">
                            <ul className="divide-y divide-gray-100">
                                {order.items.map((it) =>
                                    it.type === 'combo'
                                        ? <ComboItem key={it.id} item={it} />
                                        : <ProductItem key={it.id} item={it} />
                                )}
                            </ul>
                        </Card>

                        <Card title="Información de envío">
                            <Row label="Método"           value={SHIPPING_LABEL[order.shipping_method] ?? order.shipping_method} />
                            <Row label="Empresa de correo" value={order.courier_company} />
                            <Row label="Provincia"        value={order.province} />
                            <Row label="Localidad"        value={order.city} />
                            <Row label="Código postal"    value={order.postal_code} />
                            {order.shipping_method === 'home' && (
                                <Row label="Dirección" value={order.address} />
                            )}
                            {order.observations && (
                                <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                                    <p className="text-xs font-semibold text-brand-text-muted">Observaciones</p>
                                    <p className="mt-1 text-brand-text whitespace-pre-wrap">{order.observations}</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* ── Sidebar ─────────────────────────────────────── */}
                    <aside className="space-y-5">
                        <Card title="Cliente">
                            <Row label="Nombre"    value={`${order.first_name} ${order.last_name}`} />
                            <Row label="DNI"       value={order.dni} />
                            <Row label="Email"     value={order.email} />
                            <Row label="Teléfono"  value={order.phone} />
                        </Card>

                        <Card title="Resumen">
                            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-brand-primary-surface via-brand-cta-surface to-brand-secondary-surface px-4 py-3">
                                <span className="text-sm font-semibold text-brand-primary">Total</span>
                                <span className="text-base font-bold text-brand-primary">{fmt(order.total)}</span>
                            </div>
                            <p className="mt-2 text-xs text-brand-text-muted">
                                El costo del envío se coordina aparte con el cliente.
                            </p>
                        </Card>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
