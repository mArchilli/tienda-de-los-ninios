import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n) {
    const num = Number(n) || 0;
    return '$' + num.toLocaleString('es-AR', { maximumFractionDigits: 0 });
}

function fmtMoneyCompact(n) {
    const num = Number(n) || 0;
    if (num >= 1_000_000) return '$' + (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return '$' + (num / 1_000).toFixed(1) + 'k';
    return '$' + num.toFixed(0);
}

function fmtDate(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
        });
    } catch {
        return iso;
    }
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

const SHIPPING_BADGE = {
    pending:    'bg-amber-100 text-amber-700 border-amber-200',
    dispatched: 'bg-sky-100 text-sky-700 border-sky-200',
    delivered:  'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const SHIPPING_LABEL = {
    pending:    'Pendiente',
    dispatched: 'Despachado',
    delivered:  'Entregado',
};

// ─── KPI card ─────────────────────────────────────────────────────────────────

function DeltaBadge({ delta }) {
    const styles = {
        up:   'bg-emerald-50 text-emerald-700 border-emerald-200',
        down: 'bg-rose-50 text-rose-700 border-rose-200',
        flat: 'bg-gray-50 text-brand-text-muted border-gray-200',
    };
    const arrow = {
        up:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />,
        down: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />,
        flat: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />,
    };
    return (
        <span className={'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ' + styles[delta.kind]}>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">{arrow[delta.kind]}</svg>
            {delta.kind === 'flat' ? '0%' : Math.abs(delta.value).toFixed(1) + '%'}
        </span>
    );
}

function KpiCard({ title, value, sub, accent = 'primary', delta, icon }) {
    const accents = {
        primary:   'bg-brand-primary-surface text-brand-primary',
        cta:       'bg-brand-cta-surface text-brand-cta',
        secondary: 'bg-brand-secondary-surface text-brand-primary-dark',
        amber:     'bg-amber-50 text-amber-600',
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

// ─── 7-day sparkline ──────────────────────────────────────────────────────────

function WeeklySparkline({ data }) {
    const max = useMemo(() => Math.max(1, ...data.map((d) => d.revenue)), [data]);
    const total = useMemo(() => data.reduce((s, d) => s + d.revenue, 0), [data]);
    const orders = useMemo(() => data.reduce((s, d) => s + d.orders_count, 0), [data]);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-base font-bold text-brand-text">Últimos 7 días</h2>
                    <p className="text-xs text-brand-text-muted">
                        {fmtMoney(total)} · {orders} pedido{orders === 1 ? '' : 's'}
                    </p>
                </div>
                <Link
                    href={route('admin.metrics.index')}
                    className="text-xs font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors"
                >
                    Ver métricas →
                </Link>
            </div>

            <div className="flex items-end gap-2 h-32 px-1">
                {data.map((d) => {
                    const heightPct = max > 0 ? (d.revenue / max) * 100 : 0;
                    return (
                        <div
                            key={d.date}
                            className="group relative flex flex-1 flex-col items-center justify-end h-full"
                            title={`${d.label}: ${fmtMoney(d.revenue)}`}
                        >
                            <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap rounded-md bg-brand-text px-2 py-1 text-[11px] text-white shadow-lg">
                                {fmtMoney(d.revenue)}
                            </span>
                            <span
                                className="w-full rounded-t-md bg-brand-primary/70 group-hover:bg-brand-primary transition-colors"
                                style={{ height: Math.max(heightPct, d.revenue > 0 ? 4 : 1) + '%' }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="mt-2 flex gap-2 px-1">
                {data.map((d) => (
                    <div key={d.date + '-l'} className="flex-1 text-center text-[10px] font-semibold uppercase text-brand-text-muted">
                        {d.short}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Quick access ─────────────────────────────────────────────────────────────

function QuickCard({ href, label, count, icon, accent }) {
    const accents = {
        primary:   'group-hover:bg-brand-primary group-hover:text-white',
        cta:       'group-hover:bg-brand-cta group-hover:text-white',
        secondary: 'group-hover:bg-brand-secondary-dark group-hover:text-white',
    };
    const base = {
        primary:   'bg-brand-primary-surface text-brand-primary',
        cta:       'bg-brand-cta-surface text-brand-cta',
        secondary: 'bg-brand-secondary-surface text-brand-primary-dark',
    };

    return (
        <Link
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all"
        >
            <span className={'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ' + (base[accent] ?? base.primary) + ' ' + (accents[accent] ?? accents.primary)}>
                {icon}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-text">{label}</p>
                {count !== undefined && (
                    <p className="text-xs text-brand-text-muted">
                        {count} {count === 1 ? 'registro' : 'registros'}
                    </p>
                )}
            </div>
            <svg className="h-4 w-4 text-brand-text-light shrink-0 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </Link>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard({
    currentMonth = { revenue: 0, orders_count: 0, avg_ticket: 0 },
    previousMonth = { revenue: 0, orders_count: 0, avg_ticket: 0 },
    monthLabel = '',
    pendingOrdersCount = 0,
    todayOrdersCount = 0,
    totals = { products: 0, combos: 0, categories: 0, colors: 0, sizes: 0 },
    last7Days = [],
    recentOrders = [],
    topProducts = [],
}) {
    const revenueDelta = pctDelta(currentMonth.revenue, previousMonth.revenue);
    const ordersDelta  = pctDelta(currentMonth.orders_count, previousMonth.orders_count);

    const today = new Date().toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-brand-text">Dashboard</h1>
                        <p className="text-sm text-brand-text-muted capitalize">{today}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.orders.index')}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brand-text hover:border-brand-primary hover:text-brand-primary transition-colors shadow-sm"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Ver pedidos
                        </Link>
                        <Link
                            href={route('admin.metrics.index')}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 15l4-4 4 4 5-6" />
                            </svg>
                            Ver métricas
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="p-6 space-y-6">
                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        title={`Facturado · ${monthLabel}`}
                        value={fmtMoney(currentMonth.revenue)}
                        sub={`Mes anterior: ${fmtMoneyCompact(previousMonth.revenue)}`}
                        delta={revenueDelta}
                        accent="cta"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m-9-4h18" />
                            </svg>
                        }
                    />
                    <KpiCard
                        title="Pedidos del mes"
                        value={currentMonth.orders_count}
                        sub={`Ticket prom.: ${fmtMoneyCompact(currentMonth.avg_ticket)}`}
                        delta={ordersDelta}
                        accent="primary"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        }
                    />
                    <KpiCard
                        title="Pedidos pendientes"
                        value={pendingOrdersCount}
                        sub={pendingOrdersCount > 0 ? 'Esperando despacho' : 'Sin pendientes'}
                        accent="amber"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <KpiCard
                        title="Pedidos hoy"
                        value={todayOrdersCount}
                        sub={`${totals.products} prendas · ${totals.combos} combos`}
                        accent="secondary"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        }
                    />
                </div>

                {/* Sparkline + Top sellers */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <WeeklySparkline data={last7Days} />
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-bold text-brand-text">Más vendidos</h2>
                                <p className="text-xs text-brand-text-muted">{monthLabel}</p>
                            </div>
                        </div>

                        {topProducts.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 bg-brand-bg/50 p-6 text-center text-sm text-brand-text-muted">
                                Aún no hay ventas este mes.
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {topProducts.map((p, idx) => (
                                    <li key={p.id} className="flex items-center gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[11px] font-bold text-white">
                                            {idx + 1}
                                        </span>
                                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                                            {p.image ? (
                                                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-brand-text-light">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <p className="flex-1 truncate text-sm font-medium text-brand-text">{p.name}</p>
                                        <span className="shrink-0 text-sm font-bold text-brand-primary">{p.units}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Quick access */}
                <div>
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-text-muted">
                        Accesos rápidos
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <QuickCard
                            href={route('admin.orders.index')}
                            label="Pedidos"
                            count={pendingOrdersCount + ' pendiente' + (pendingOrdersCount === 1 ? '' : 's')}
                            accent="cta"
                            icon={
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            }
                        />
                        <QuickCard
                            href={route('admin.metrics.index')}
                            label="Métricas"
                            count="Facturación y top sellers"
                            accent="primary"
                            icon={
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M7 15l4-4 4 4 5-6" />
                                </svg>
                            }
                        />
                        <QuickCard
                            href={route('admin.products.index')}
                            label="Prendas"
                            count={totals.products}
                            accent="primary"
                            icon={
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            }
                        />
                        <QuickCard
                            href={route('admin.combos.index')}
                            label="Combos"
                            count={totals.combos}
                            accent="cta"
                            icon={
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            }
                        />
                        <QuickCard
                            href={route('admin.categories.index')}
                            label="Categorías"
                            count={totals.categories}
                            accent="secondary"
                            icon={
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            }
                        />
                        <QuickCard
                            href={route('admin.colors.index')}
                            label="Colores"
                            count={totals.colors}
                            accent="secondary"
                            icon={
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            }
                        />
                        <QuickCard
                            href={route('admin.sizes.index')}
                            label="Talles"
                            count={totals.sizes}
                            accent="secondary"
                            icon={
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M12 17h.01M15 17h.01M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                                </svg>
                            }
                        />
                        <QuickCard
                            href={route('profile.edit')}
                            label="Perfil"
                            count="Configuración de cuenta"
                            accent="primary"
                            icon={
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            }
                        />
                    </div>
                </div>

                {/* Recent orders */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <div>
                            <h2 className="text-base font-bold text-brand-text">Pedidos recientes</h2>
                            <p className="text-xs text-brand-text-muted">Últimos {recentOrders.length} pedidos confirmados</p>
                        </div>
                        <Link
                            href={route('admin.orders.index')}
                            className="text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors"
                        >
                            Ver todos →
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="p-10 text-center text-sm text-brand-text-muted">
                            Todavía no hay pedidos.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
                                    <tr>
                                        <th className="px-5 py-3">#</th>
                                        <th className="px-5 py-3">Cliente</th>
                                        <th className="px-5 py-3">Items</th>
                                        <th className="px-5 py-3">Total</th>
                                        <th className="px-5 py-3">Estado</th>
                                        <th className="px-5 py-3">Fecha</th>
                                        <th className="px-5 py-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentOrders.map((o) => (
                                        <tr key={o.id} className="hover:bg-brand-secondary-surface/40 transition-colors">
                                            <td className="px-5 py-3 font-semibold text-brand-text">#{o.id}</td>
                                            <td className="px-5 py-3 text-brand-text">{o.customer}</td>
                                            <td className="px-5 py-3 text-brand-text-muted">{o.items_count}</td>
                                            <td className="px-5 py-3 font-bold text-brand-primary">{fmtMoney(o.total)}</td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={
                                                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ' +
                                                        (SHIPPING_BADGE[o.shipping_status] ?? 'bg-gray-100 text-brand-text-muted border-gray-200')
                                                    }
                                                >
                                                    {SHIPPING_LABEL[o.shipping_status] ?? o.shipping_status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-brand-text-muted">{fmtDate(o.created_at)}</td>
                                            <td className="px-5 py-3 text-right">
                                                <Link
                                                    href={route('admin.orders.show', o.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-brand-text hover:border-brand-primary hover:text-brand-primary transition-colors"
                                                >
                                                    Ver
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
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
