import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
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

function timeAgo(iso) {
    if (!iso) return '';
    const then = new Date(iso);
    const s = Math.floor((Date.now() - then.getTime()) / 1000);
    if (s < 60) return 'recién';
    const m = Math.floor(s / 60);
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.floor(h / 24);
    if (d < 30) return `hace ${d} día${d === 1 ? '' : 's'}`;
    const mo = Math.floor(d / 30);
    return `hace ${mo} mes${mo === 1 ? '' : 'es'}`;
}

function pctDelta(curr, prev) {
    const c = Number(curr) || 0;
    const p = Number(prev) || 0;
    if (p === 0 && c === 0) return { value: 0, kind: 'flat' };
    if (p === 0) return { value: 100, kind: 'up' };
    const d = ((c - p) / p) * 100;
    if (Math.abs(d) < 0.05) return { value: 0, kind: 'flat' };
    return { value: d, kind: d > 0 ? 'up' : 'down' };
}

function shiftMonth(ym, delta) {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function currentMonthStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const SHIPPING_LABEL = { home: 'Envío a Domicilio', branch: 'Envío a Sucursal' };

const STATUS_BADGE = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    dispatched: 'bg-sky-100 text-sky-700 border-sky-200',
    delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
};

const STATUS_LABEL = {
    pending: 'Pendiente',
    dispatched: 'Despachado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

const STATUS_ACCENT = {
    pending: 'bg-amber-400',
    dispatched: 'bg-sky-400',
    delivered: 'bg-emerald-400',
    cancelled: 'bg-rose-400',
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

// ─── Month navigator ──────────────────────────────────────────────────────────

function MonthNavigator({ selectedMonth, availableMonths, onNavigate }) {
    const nextDisabled = selectedMonth >= currentMonthStr();

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => onNavigate(shiftMonth(selectedMonth, -1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-brand-text-muted shadow-sm hover:border-brand-primary hover:text-brand-primary transition-colors"
                title="Mes anterior"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="relative">
                <select
                    value={selectedMonth}
                    onChange={(e) => onNavigate(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm font-bold text-brand-text shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                >
                    {availableMonths.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            <button
                type="button"
                onClick={() => onNavigate(shiftMonth(selectedMonth, 1))}
                disabled={nextDisabled}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-brand-text-muted shadow-sm hover:border-brand-primary hover:text-brand-primary transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-brand-text-muted"
                title="Mes siguiente"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function DeltaBadge({ delta }) {
    const styles = {
        up: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        down: 'bg-rose-50 text-rose-700 border-rose-200',
        flat: 'bg-gray-50 text-brand-text-muted border-gray-200',
    };
    const arrow = {
        up: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />,
        down: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />,
        flat: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />,
    };

    return (
        <span className={'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ' + styles[delta.kind]}>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {arrow[delta.kind]}
            </svg>
            {delta.kind === 'flat' ? '0%' : Math.abs(delta.value).toFixed(1) + '%'}
        </span>
    );
}

function MetricCard({ title, value, sub, delta, accent = 'primary', icon }) {
    const accents = {
        primary: 'bg-brand-primary-surface text-brand-primary',
        amber: 'bg-amber-50 text-amber-600',
        sky: 'bg-sky-50 text-sky-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">{title}</p>
                    <p className="mt-2 text-2xl font-bold text-brand-text truncate">{value}</p>
                    {sub && <p className="mt-1 text-xs text-brand-text-muted">{sub}</p>}
                </div>
                <span className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ' + (accents[accent] ?? accents.primary)}>
                    {icon}
                </span>
            </div>
            {delta && (
                <div className="mt-3 flex items-center gap-1.5">
                    <DeltaBadge delta={delta} />
                    <span className="text-xs text-brand-text-muted">vs. mes anterior</span>
                </div>
            )}
        </div>
    );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function Tabs({ active, onChange, counts }) {
    const tabs = [
        { key: 'pending', label: 'Pendientes', count: counts.pending },
        { key: 'dispatched', label: 'Despachados', count: counts.dispatched },
        { key: 'cancelled', label: 'Cancelados', count: counts.cancelled },
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
                            (isActive ? 'bg-brand-primary text-white shadow' : 'text-brand-text-muted hover:bg-gray-50')
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

// ─── Order card ───────────────────────────────────────────────────────────────

function InfoRow({ icon, children }) {
    return (
        <div className="flex items-center gap-2 text-sm text-brand-text-muted min-w-0">
            <svg className="h-3.5 w-3.5 shrink-0 text-brand-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icon}
            </svg>
            <span className="truncate">{children}</span>
        </div>
    );
}

function OrderCard({ o }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-brand-primary/30">
            <span className={'absolute left-0 top-0 h-full w-1 ' + (STATUS_ACCENT[o.shipping_status] ?? 'bg-gray-300')} />

            <div className="p-5 pl-6">
                {/* Encabezado */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-bold text-brand-text">#{o.id}</span>
                            <span
                                className={
                                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ' +
                                    (STATUS_BADGE[o.shipping_status] ?? 'bg-gray-100 text-brand-text-muted border-gray-200')
                                }
                            >
                                {STATUS_LABEL[o.shipping_status] ?? o.shipping_status}
                            </span>
                        </div>
                        <p className="mt-2 truncate text-base font-bold text-brand-text">{o.first_name} {o.last_name}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-brand-primary">{fmt(o.total)}</p>
                        <p className="text-[11px] text-brand-text-muted">{o.items_count} ítem{o.items_count === 1 ? '' : 's'}</p>
                    </div>
                </div>

                {/* Datos de contacto y envío */}
                <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    <InfoRow icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />}>
                        {o.phone || '—'}
                    </InfoRow>
                    <InfoRow icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}>
                        {o.email || '—'}
                    </InfoRow>
                    <InfoRow icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM3 5h11v8H3V5zm11 3h4l3 3v2h-7V8z" />}>
                        {SHIPPING_LABEL[o.shipping_method] ?? o.shipping_method}
                    </InfoRow>
                    <InfoRow icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />}>
                        {o.address || 'Sin dirección'}
                    </InfoRow>
                </div>

                {/* Pie */}
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                    <div className="min-w-0">
                        <p className="text-xs text-brand-text-muted">{fmtDate(o.created_at)}</p>
                        <p className="text-[11px] font-medium text-brand-text-light">{timeAgo(o.created_at)}</p>
                    </div>
                    <Link
                        href={route('admin.orders.show', o.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-brand-text transition-colors hover:border-brand-primary hover:bg-brand-primary hover:text-white"
                    >
                        Ver detalle
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function OrdersGrid({ orders, emptyText }) {
    if (orders.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="mt-3 text-sm text-brand-text-muted">{emptyText}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            {orders.map((o) => <OrderCard key={o.id} o={o} />)}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersIndex({
    selectedMonth,
    selectedLabel,
    previousLabel,
    availableMonths = [],
    pending = [],
    dispatched = [],
    cancelled = [],
    metrics = {},
}) {
    const flash = usePage().props.flash;
    const [flashMessage, setFlashMessage] = useState(flash?.success ?? null);

    useEffect(() => {
        if (flash?.success) setFlashMessage(flash.success);
    }, [flash]);

    const [tab, setTab] = useState('pending');
    const [q, setQ] = useState('');

    const navigateMonth = (m) => {
        router.get(route('admin.orders.index'), { month: m }, {
            preserveScroll: true,
            preserveState: true,
            only: ['selectedMonth', 'selectedLabel', 'previousLabel', 'pending', 'dispatched', 'cancelled', 'metrics'],
        });
    };

    const list = tab === 'pending' ? pending : tab === 'dispatched' ? dispatched : cancelled;

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return list;
        return list.filter((o) => {
            const haystack = [String(o.id), o.first_name, o.last_name, o.email, o.phone]
                .filter(Boolean).join(' ').toLowerCase();
            return haystack.includes(needle);
        });
    }, [list, q]);

    const ordersDelta = pctDelta(metrics.orders_total, metrics.orders_prev);
    const olderPending = (metrics.pending_total ?? 0) - (metrics.pending_count ?? 0);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-brand-text">Pedidos</h1>
                        <p className="text-sm text-brand-text-muted">Gestión y seguimiento · {selectedLabel}</p>
                    </div>
                    <MonthNavigator
                        selectedMonth={selectedMonth}
                        availableMonths={availableMonths}
                        onNavigate={navigateMonth}
                    />
                </div>
            }
        >
            <Head title="Pedidos" />

            <div className="p-6 space-y-6">
                <FlashBanner message={flashMessage} onDismiss={() => setFlashMessage(null)} />

                {/* KPIs */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <MetricCard
                        title="Pedidos del mes"
                        value={metrics.orders_total ?? 0}
                        sub={`${previousLabel}: ${metrics.orders_prev ?? 0}`}
                        delta={ordersDelta}
                        accent="primary"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        }
                    />
                    <MetricCard
                        title="A sucursal"
                        value={metrics.branch_count ?? 0}
                        sub="Retiro en sucursal"
                        accent="primary"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-2m-8 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                            </svg>
                        }
                    />
                    <MetricCard
                        title="A domicilio"
                        value={metrics.home_count ?? 0}
                        sub="Envío a domicilio"
                        accent="emerald"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        }
                    />
                    <MetricCard
                        title="Pendientes"
                        value={metrics.pending_count ?? 0}
                        sub={olderPending > 0 ? `+${olderPending} en otros meses` : 'Listos para despachar'}
                        accent="amber"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <MetricCard
                        title="Despachados"
                        value={metrics.dispatched_count ?? 0}
                        sub="En camino / entregados"
                        accent="sky"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM3 5h11v8H3V5zm11 3h4l3 3v2h-7V8z" />
                            </svg>
                        }
                    />
                </div>

                {/* Controles de lista */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Tabs
                        active={tab}
                        onChange={setTab}
                        counts={{ pending: pending.length, dispatched: dispatched.length, cancelled: cancelled.length }}
                    />

                    <div className="relative w-full max-w-sm">
                        <input
                            type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por #, nombre, email o teléfono…"
                            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                        />
                        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                {/* Aviso de pendientes en otros meses */}
                {tab === 'pending' && olderPending > 0 && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                            Hay <strong>{olderPending}</strong> pedido{olderPending === 1 ? '' : 's'} pendiente{olderPending === 1 ? '' : 's'} en otros meses. Cambiá de mes para verlos.
                        </span>
                    </div>
                )}

                <OrdersGrid
                    orders={filtered}
                    emptyText={
                        q
                            ? 'No hay pedidos que coincidan con la búsqueda.'
                            : tab === 'pending'
                                ? `No hay pedidos pendientes en ${selectedLabel}.`
                                : tab === 'dispatched'
                                    ? `No hay pedidos despachados en ${selectedLabel}.`
                                    : `No hay pedidos cancelados en ${selectedLabel}.`
                    }
                />
            </div>
        </AuthenticatedLayout>
    );
}
