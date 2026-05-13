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
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}

const SHIPPING_LABEL = { home: 'A Domicilio', branch: 'A Sucursal' };

const STATUS_BADGE = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    dispatched: 'bg-sky-100 text-sky-700 border-sky-200',
    delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const STATUS_LABEL = {
    pending: 'Pendiente',
    dispatched: 'Despachado',
    delivered: 'Entregado',
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

function Card({ title, children, action }) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <header className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-brand-text">{title}</h2>
                {action}
            </header>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
            <span className="text-brand-text-muted">{label}</span>
            <span className="text-right font-medium text-brand-text">{value ?? '—'}</span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersShow({ order }) {
    const flash = usePage().props.flash;
    const [flashMessage, setFlashMessage] = useState(flash?.success ?? null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (flash?.success) setFlashMessage(flash.success);
    }, [flash]);

    const isPending = order.shipping_status === 'pending';
    const nextStatus = isPending ? 'dispatched' : 'pending';

    const toggleStatus = () => {
        if (processing) return;
        setProcessing(true);
        router.patch(
            route('admin.orders.update-status', order.id),
            { shipping_status: nextStatus },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
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
                        <p className="mt-1 text-sm text-brand-text-muted">Generado el {fmtDate(order.created_at)}</p>
                    </div>

                    <button
                        type="button"
                        onClick={toggleStatus}
                        disabled={processing}
                        className={
                            'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed ' +
                            (isPending
                                ? 'bg-sky-600 hover:bg-sky-700'
                                : 'bg-amber-600 hover:bg-amber-700')
                        }
                        title={isPending ? 'Marcar como Despachado' : 'Marcar como Pendiente'}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isPending ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 17h6m-3-3v6m-7-9V5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2z"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12a9 9 0 109-9M3 12l3-3m-3 3l3 3"
                                />
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

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-5">
                        <Card title="Productos">
                            <ul className="divide-y divide-gray-100">
                                {order.items.map((it) => (
                                    <li key={it.id} className="flex items-start justify-between gap-4 py-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={
                                                        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ' +
                                                        (it.type === 'combo'
                                                            ? 'border-purple-200 bg-purple-50 text-purple-700'
                                                            : 'border-brand-primary/20 bg-brand-primary-surface text-brand-primary')
                                                    }
                                                >
                                                    {it.type === 'combo' ? 'Combo' : 'Producto'}
                                                </span>
                                                <p className="font-semibold text-brand-text">{it.name}</p>
                                            </div>
                                            <p className="mt-1 text-xs text-brand-text-muted">
                                                {it.size && <>Talle: {it.size}</>}
                                                {it.gender && <> · Género: {it.gender}</>}
                                                <> · Cantidad: {it.quantity}</>
                                            </p>
                                            {it.picks?.length > 0 && (
                                                <p className="mt-1 text-xs text-brand-text-muted">
                                                    Incluye: {it.picks.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right text-xs shrink-0">
                                            <p className="text-brand-text-muted">{fmt(it.price)} c/u</p>
                                            <p className="font-bold text-brand-primary">{fmt(it.subtotal)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card title="Información de envío">
                            <Row label="Método" value={SHIPPING_LABEL[order.shipping_method] ?? order.shipping_method} />
                            <Row label="Empresa de correo" value={order.courier_company} />
                            <Row label="Provincia" value={order.province} />
                            <Row label="Localidad" value={order.city} />
                            <Row label="Código postal" value={order.postal_code} />
                            {order.shipping_method === 'home' && <Row label="Dirección" value={order.address} />}
                            {order.observations && (
                                <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                                    <p className="text-xs font-semibold text-brand-text-muted">Observaciones</p>
                                    <p className="mt-1 text-brand-text whitespace-pre-wrap">{order.observations}</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    <aside className="space-y-5">
                        <Card title="Cliente">
                            <Row label="Nombre" value={`${order.first_name} ${order.last_name}`} />
                            <Row label="DNI" value={order.dni} />
                            <Row label="Email" value={order.email} />
                            <Row label="Teléfono" value={order.phone} />
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
