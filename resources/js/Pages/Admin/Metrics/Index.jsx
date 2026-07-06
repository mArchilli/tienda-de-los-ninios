import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n) {
    const num = Number(n) || 0;
    return '$' + num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtMoneyCompact(n) {
    const num = Number(n) || 0;
    if (num >= 1_000_000) return '$' + (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return '$' + (num / 1_000).toFixed(1) + 'k';
    return '$' + num.toFixed(0);
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

function shiftDay(ymd, delta) {
    const [y, m, day] = ymd.split('-').map(Number);
    const d = new Date(y, m - 1, day + delta);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, delta, deltaCaption, accent = 'primary', icon, action }) {
    const accents = {
        primary:   'bg-brand-primary-surface text-brand-primary',
        cta:       'bg-brand-cta-surface text-brand-cta',
        secondary: 'bg-brand-secondary-surface text-brand-primary-dark',
        text:      'bg-gray-100 text-brand-text',
    };

    return (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
                        {title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-brand-text truncate">{value}</p>
                    {sub && <p className="mt-1 text-xs text-brand-text-muted">{sub}</p>}
                </div>
                <span className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ' + (accents[accent] ?? accents.primary)}>
                    {icon}
                </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
                {delta ? (
                    <div className="flex items-center gap-1.5">
                        <DeltaBadge delta={delta} />
                        <span className="text-xs text-brand-text-muted">{deltaCaption}</span>
                    </div>
                ) : <span />}
                {action}
            </div>
        </div>
    );
}

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
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {arrow[delta.kind]}
            </svg>
            {delta.kind === 'flat' ? '0%' : Math.abs(delta.value).toFixed(1) + '%'}
        </span>
    );
}

// ─── Bar chart (CSS) ──────────────────────────────────────────────────────────

function PeriodChart({ data, selectedPeriod, onSelect, title, subtitle }) {
    const max = useMemo(() => Math.max(1, ...data.map((d) => d.revenue)), [data]);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-base font-bold text-brand-text">{title}</h2>
                    <p className="text-xs text-brand-text-muted">{subtitle}</p>
                </div>
            </div>

            <div className="flex items-end gap-1.5 h-56 px-1 overflow-x-auto">
                {data.map((d) => {
                    const isSelected = d.period === selectedPeriod;
                    const heightPct = max > 0 ? (d.revenue / max) * 100 : 0;
                    return (
                        <button
                            key={d.period}
                            type="button"
                            onClick={() => onSelect(d.period)}
                            className="group relative flex flex-1 flex-col items-center justify-end h-full min-w-[6px]"
                            title={`${d.label}: ${fmtMoney(d.revenue)} · ${d.orders_count} pedidos`}
                        >
                            {/* Tooltip */}
                            <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap rounded-md bg-brand-text px-2 py-1 text-[11px] text-white shadow-lg">
                                {fmtMoney(d.revenue)} · {d.orders_count} ped.
                            </span>

                            <span
                                className={
                                    'w-full rounded-t-md transition-all duration-200 ' +
                                    (isSelected
                                        ? 'bg-brand-cta shadow-md'
                                        : 'bg-brand-primary/70 group-hover:bg-brand-primary')
                                }
                                style={{ height: Math.max(heightPct, d.revenue > 0 ? 4 : 1) + '%' }}
                            />
                        </button>
                    );
                })}
            </div>

            <div className="mt-2 flex gap-1.5 px-1">
                {data.map((d) => (
                    <div
                        key={d.period + '-label'}
                        className={
                            'flex-1 text-center text-[10px] font-semibold uppercase truncate ' +
                            (d.period === selectedPeriod ? 'text-brand-cta' : 'text-brand-text-muted')
                        }
                    >
                        {d.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Top sellers list ─────────────────────────────────────────────────────────

function TopSellersCard({ title, subtitle, items, emptyText, accent }) {
    const accents = {
        primary: { bar: 'bg-brand-primary', text: 'text-brand-primary' },
        cta:     { bar: 'bg-brand-cta', text: 'text-brand-cta' },
    };
    const a = accents[accent] ?? accents.primary;

    const maxUnits = Math.max(1, ...items.map((i) => i.units || 0));

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-base font-bold text-brand-text">{title}</h2>
                {subtitle && <p className="text-xs text-brand-text-muted">{subtitle}</p>}
            </div>

            {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-brand-bg/50 p-6 text-center text-sm text-brand-text-muted">
                    {emptyText}
                </div>
            ) : (
                <ul className="space-y-3">
                    {items.map((it, idx) => (
                        <li key={(it.id ?? 'x') + '-' + idx} className="flex items-center gap-3">
                            <span className={'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ' + a.bar}>
                                {idx + 1}
                            </span>

                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                                {it.image ? (
                                    <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-brand-text-light">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-brand-text">{it.name}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className={'h-full rounded-full ' + a.bar}
                                            style={{ width: ((it.units / maxUnits) * 100).toFixed(1) + '%' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <p className={'text-sm font-bold ' + a.text}>{it.units}</p>
                                <p className="text-[11px] text-brand-text-muted">{fmtMoney(it.revenue)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// ─── Day navigator ────────────────────────────────────────────────────────────

function DayNavigator({ selectedDay, bounds, onNavigate }) {
    const prevDisabled = !!bounds?.min && shiftDay(selectedDay, -1) < bounds.min;
    const nextDisabled = !!bounds?.max && shiftDay(selectedDay, 1) > bounds.max;

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => onNavigate(shiftDay(selectedDay, -1))}
                disabled={prevDisabled}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-brand-text-muted shadow-sm hover:border-brand-primary hover:text-brand-primary transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-brand-text-muted"
                title="Día anterior"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <input
                id="day-select"
                type="date"
                value={selectedDay}
                min={bounds?.min}
                max={bounds?.max}
                onChange={(e) => e.target.value && onNavigate(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm font-semibold text-brand-text shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
            />

            <button
                type="button"
                onClick={() => onNavigate(shiftDay(selectedDay, 1))}
                disabled={nextDisabled}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-brand-text-muted shadow-sm hover:border-brand-primary hover:text-brand-primary transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-brand-text-muted"
                title="Día siguiente"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

// ─── View toggle ────────────────────────────────────────────────────────────

function ViewToggle({ view, onChange }) {
    return (
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
            {[
                { value: 'month', label: 'Mes' },
                { value: 'day', label: 'Día' },
            ].map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={
                        'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ' +
                        (view === opt.value
                            ? 'bg-brand-primary text-white shadow-sm'
                            : 'text-brand-text-muted hover:text-brand-text')
                    }
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MetricsIndex({
    view,
    selectedPeriod,
    selectedLabel,
    previousLabel,
    selectedStats,
    previousStats,
    history = [],
    availableMonths = [],
    dayBounds,
    topProducts = [],
    topCombos = [],
    allTime,
}) {
    const navigate = (params) => {
        router.get(route('admin.metrics.index'), params, {
            preserveScroll: true,
            preserveState: true,
            only: [
                'view', 'selectedPeriod', 'selectedLabel', 'previousLabel',
                'selectedStats', 'previousStats', 'history', 'availableMonths',
                'dayBounds', 'topProducts', 'topCombos',
            ],
        });
    };

    const navigatePeriod = (period) => {
        if (view === 'day') navigate({ view: 'day', day: period });
        else navigate({ view: 'month', month: period });
    };

    const switchView = (nextView) => {
        if (nextView === view) return;
        navigate({ view: nextView });
    };

    const revenueDelta = pctDelta(selectedStats.revenue, previousStats.revenue);
    const ordersDelta  = pctDelta(selectedStats.orders_count, previousStats.orders_count);
    const ticketDelta  = pctDelta(selectedStats.avg_ticket, previousStats.avg_ticket);
    const itemsDelta   = pctDelta(selectedStats.items_count, previousStats.items_count);

    const deltaCaption = view === 'day' ? 'vs. día anterior' : 'vs. mes anterior';
    const chartTitle = view === 'day' ? 'Facturación diaria' : 'Facturación mensual';
    const chartSubtitle = view === 'day'
        ? 'Últimos 30 días · click en una barra para ver detalle'
        : 'Últimos 12 meses · click en una barra para ver detalle';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-brand-text">Métricas</h1>
                        <p className="text-sm text-brand-text-muted">
                            Resumen de facturación y prendas más vendidas
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ViewToggle view={view} onChange={switchView} />

                        {view === 'day' ? (
                            <DayNavigator
                                selectedDay={selectedPeriod}
                                bounds={dayBounds}
                                onNavigate={navigatePeriod}
                            />
                        ) : (
                            <select
                                id="month-select"
                                value={selectedPeriod}
                                onChange={(e) => navigatePeriod(e.target.value)}
                                className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm font-semibold text-brand-text shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                            >
                                {availableMonths.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Métricas" />

            <div className="p-6 space-y-6">
                {/* Period banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-primary/20 bg-brand-primary-surface/60 px-5 py-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary-dark">
                            Período seleccionado
                        </p>
                        <p className="text-lg font-bold text-brand-text">{selectedLabel}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
                            Histórico total
                        </p>
                        <p className="text-lg font-bold text-brand-primary">{fmtMoney(allTime.revenue)}</p>
                        <p className="text-[11px] text-brand-text-muted">
                            {allTime.orders_count} pedido{allTime.orders_count === 1 ? '' : 's'} confirmados
                        </p>
                    </div>
                </div>

                {/* KPI grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard
                        title="Facturado"
                        value={fmtMoney(selectedStats.revenue)}
                        sub={`${previousLabel}: ${fmtMoneyCompact(previousStats.revenue)}`}
                        delta={revenueDelta}
                        deltaCaption={deltaCaption}
                        accent="cta"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m-9-4h18" />
                            </svg>
                        }
                        action={
                            <Link
                                href={route('admin.metrics.orders', view === 'day' ? { view: 'day', day: selectedPeriod } : { month: selectedPeriod })}
                                className="inline-flex items-center gap-1 rounded-lg border border-brand-cta/30 bg-brand-cta-surface px-2.5 py-1 text-[11px] font-bold text-brand-cta hover:bg-brand-cta hover:text-white transition-colors"
                            >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                            </Link>
                        }
                    />
                    <KpiCard
                        title="Pedidos"
                        value={selectedStats.orders_count}
                        sub={`${previousLabel}: ${previousStats.orders_count}`}
                        delta={ordersDelta}
                        deltaCaption={deltaCaption}
                        accent="primary"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        }
                    />
                    <KpiCard
                        title="Ticket promedio"
                        value={fmtMoney(selectedStats.avg_ticket)}
                        sub={`${previousLabel}: ${fmtMoneyCompact(previousStats.avg_ticket)}`}
                        delta={ticketDelta}
                        deltaCaption={deltaCaption}
                        accent="secondary"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        }
                    />
                    <KpiCard
                        title="Unidades"
                        value={selectedStats.items_count}
                        sub={`${previousLabel}: ${previousStats.items_count}`}
                        delta={itemsDelta}
                        deltaCaption={deltaCaption}
                        accent="text"
                        icon={
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        }
                    />
                </div>

                {/* Chart */}
                <PeriodChart
                    data={history}
                    selectedPeriod={selectedPeriod}
                    onSelect={navigatePeriod}
                    title={chartTitle}
                    subtitle={chartSubtitle}
                />

                {/* Top sellers */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <TopSellersCard
                        title="Prendas más vendidas"
                        subtitle={`Top 10 · ${selectedLabel}`}
                        items={topProducts}
                        emptyText={view === 'day' ? 'No hay prendas vendidas en este día.' : 'No hay prendas vendidas en este mes.'}
                        accent="primary"
                    />
                    <TopSellersCard
                        title="Combos más vendidos"
                        subtitle={`Top 10 · ${selectedLabel}`}
                        items={topCombos}
                        emptyText={view === 'day' ? 'No hay combos vendidos en este día.' : 'No hay combos vendidos en este mes.'}
                        accent="cta"
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
