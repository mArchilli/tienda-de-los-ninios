import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

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

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function Tabs({ active, onChange, counts }) {
    const tabs = [
        { key: 'pending',    label: 'Pendientes',  count: counts.pending },
        { key: 'dispatched', label: 'Despachados', count: counts.dispatched },
    ];

    return (
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {tabs.map((t) => {
                const isActive = active === t.key;
                return (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => onChange(t.key)}
                        className={
                            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ' +
                            (isActive
                                ? 'bg-brand-primary text-white shadow'
                                : 'text-brand-text-muted hover:bg-gray-50')
                        }
                    >
                        {t.label}
                        <span
                            className={
                                'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ' +
                                (isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-brand-text-muted')
                            }
                        >
                            {t.count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

// ─── Orders table ─────────────────────────────────────────────────────────────

function OrdersTable({ orders }) {
    if (orders.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <p className="text-sm text-brand-text-muted">No hay pedidos en esta categoría.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3">Contacto</th>
                            <th className="px-4 py-3">Envío</th>
                            <th className="px-4 py-3">Items</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((o) => (
                            <tr key={o.id} className="hover:bg-brand-secondary-surface/40 transition-colors">
                                <td className="px-4 py-3 font-semibold text-brand-text">#{o.id}</td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-brand-text">{o.first_name} {o.last_name}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-brand-text">{o.phone}</p>
                                    <p className="text-xs text-brand-text-muted truncate">{o.email}</p>
                                </td>
                                <td className="px-4 py-3 text-brand-text-muted">
                                    {SHIPPING_LABEL[o.shipping_method] ?? o.shipping_method}
                                </td>
                                <td className="px-4 py-3 text-brand-text-muted">{o.items_count}</td>
                                <td className="px-4 py-3 font-bold text-brand-primary">{fmt(o.total)}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={
                                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ' +
                                            (STATUS_BADGE[o.shipping_status] ?? 'bg-gray-100 text-brand-text-muted border-gray-200')
                                        }
                                    >
                                        {STATUS_LABEL[o.shipping_status] ?? o.shipping_status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-brand-text-muted">{fmtDate(o.created_at)}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link
                                        href={route('admin.orders.show', o.id)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-brand-text hover:border-brand-primary hover:text-brand-primary transition-colors"
                                    >
                                        Ver detalle
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersIndex({ pending = [], dispatched = [] }) {
    const flash = usePage().props.flash;
    const [flashMessage, setFlashMessage] = useState(flash?.success ?? null);

    useEffect(() => {
        if (flash?.success) setFlashMessage(flash.success);
    }, [flash]);

    const [tab, setTab] = useState('pending');
    const [q, setQ] = useState('');

    const list = tab === 'pending' ? pending : dispatched;

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return list;
        return list.filter((o) => {
            const haystack = [
                String(o.id),
                o.first_name,
                o.last_name,
                o.email,
                o.phone,
            ].filter(Boolean).join(' ').toLowerCase();
            return haystack.includes(needle);
        });
    }, [list, q]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-brand-text">Pedidos</h1>
                        <p className="text-sm text-brand-text-muted">
                            {pending.length} pendiente{pending.length === 1 ? '' : 's'} ·{' '}
                            {dispatched.length} despachado{dispatched.length === 1 ? '' : 's'}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Pedidos" />

            <div className="p-6 space-y-5">
                <FlashBanner message={flashMessage} onDismiss={() => setFlashMessage(null)} />

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Tabs
                        active={tab}
                        onChange={setTab}
                        counts={{ pending: pending.length, dispatched: dispatched.length }}
                    />

                    <div className="relative w-full max-w-sm">
                        <input
                            type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por #, nombre, email o teléfono…"
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                        />
                        <svg
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 110-16 8 8 0 010 16z" />
                        </svg>
                        {q && (
                            <button
                                onClick={() => setQ('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-brand-text-muted hover:bg-gray-100"
                                title="Limpiar"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <OrdersTable orders={filtered} />
            </div>
        </AuthenticatedLayout>
    );
}
