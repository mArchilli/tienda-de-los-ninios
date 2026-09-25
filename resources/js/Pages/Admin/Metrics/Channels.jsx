import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n) {
    const num = Number(n) || 0;
    return '$' + num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function shiftDay(ymd, delta) {
    const [y, m, day] = ymd.split('-').map(Number);
    const d = new Date(y, m - 1, day + delta);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const CHANNEL_STYLE = {
    web:       { bar: 'bg-brand-cta', dot: 'bg-brand-cta', text: 'text-brand-cta' },
    whatsapp:  { bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-600' },
    instagram: { bar: 'bg-fuchsia-500', dot: 'bg-fuchsia-500', text: 'text-fuchsia-600' },
    tiktok:    { bar: 'bg-brand-text', dot: 'bg-brand-text', text: 'text-brand-text' },
};

// ─── View toggle / day navigator (mismos controles que Métricas) ─────────────

function ViewToggle({ view, onChange }) {
    return (
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
            {[{ value: 'month', label: 'Mes' }, { value: 'day', label: 'Día' }].map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={
                        'rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ' +
                        (view === opt.value ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-text-muted hover:text-brand-text')
                    }
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function DayNavigator({ selectedDay, bounds, onNavigate }) {
    const prevDisabled = !!bounds?.min && shiftDay(selectedDay, -1) < bounds.min;
    const nextDisabled = !!bounds?.max && shiftDay(selectedDay, 1) > bounds.max;

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => onNavigate(shiftDay(selectedDay, -1))}
                disabled={prevDisabled}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-brand-text-muted shadow-sm hover:border-brand-primary hover:text-brand-primary transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <input
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
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-brand-text-muted shadow-sm hover:border-brand-primary hover:text-brand-primary transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}

// ─── Fila de canal ─────────────────────────────────────────────────────────────

function ChannelRow({ channel, total, active, onToggle, onIsolate }) {
    const pct = active && total > 0 ? (channel.amount / total) * 100 : 0;
    const style = CHANNEL_STYLE[channel.key] ?? {};

    return (
        <div className={`group rounded-xl border p-3.5 transition-opacity ${active ? 'border-gray-100' : 'border-gray-100 opacity-45'}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={active}
                        aria-label={`${active ? 'Ocultar' : 'Mostrar'} ${channel.label} en el consolidado`}
                        onClick={() => onToggle(channel.key)}
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                            active ? (style.bar ?? 'bg-brand-primary') : 'bg-gray-300'
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                active ? 'translate-x-[18px]' : 'translate-x-[2px]'
                            }`}
                        />
                    </button>
                    <span className="truncate text-sm font-bold text-brand-text">{channel.label}</span>
                    {!channel.editable && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-text-muted">
                            Automático
                        </span>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onIsolate(channel.key)}
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-text-light opacity-0 transition-opacity hover:text-brand-primary group-hover:opacity-100 focus:opacity-100"
                    >
                        Sólo este
                    </button>
                    <div className="text-right">
                        <p className="text-sm font-bold text-brand-text">{fmtMoney(channel.amount)}</p>
                        <p className="text-[11px] text-brand-text-muted">
                            {channel.sales_count} venta{channel.sales_count === 1 ? '' : 's'}
                            {active && <> · {pct.toFixed(1)}%</>}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${style.bar ?? 'bg-gray-400'}`} style={{ width: `${Math.max(pct, active && channel.amount > 0 ? 1.5 : 0)}%` }} />
            </div>
        </div>
    );
}

// ─── Barra apilada consolidada ─────────────────────────────────────────────────

function ConsolidatedBar({ channels, total }) {
    if (total <= 0) {
        return (
            <div className="flex h-4 w-full items-center overflow-hidden rounded-full bg-gray-100">
                <span className="px-3 text-[10px] text-brand-text-light">Sin ventas en el período</span>
            </div>
        );
    }

    return (
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100">
            {channels.filter((c) => c.amount > 0).map((c) => (
                <div
                    key={c.key}
                    className={CHANNEL_STYLE[c.key]?.bar ?? 'bg-gray-400'}
                    style={{ width: `${(c.amount / total) * 100}%` }}
                    title={`${c.label}: ${fmtMoney(c.amount)}`}
                />
            ))}
        </div>
    );
}

// ─── Histórico apilado ──────────────────────────────────────────────────────────

const CHANNEL_HISTORY_LABEL = { web: 'Web', whatsapp: 'WhatsApp', instagram: 'Instagram', tiktok: 'TikTok Live' };

function periodSegments(d, activeKeys) {
    return [
        { key: 'web', amount: d.online_revenue },
        { key: 'whatsapp', amount: d.channels?.whatsapp ?? 0 },
        { key: 'instagram', amount: d.channels?.instagram ?? 0 },
        { key: 'tiktok', amount: d.channels?.tiktok ?? 0 },
    ].filter((s) => activeKeys.has(s.key) && s.amount > 0);
}

function HistoryStackedChart({ data, selectedPeriod, onSelect, title, subtitle, activeKeys, onToggleChannel }) {
    const totals = useMemo(
        () => data.map((d) => periodSegments(d, activeKeys).reduce((s, seg) => s + seg.amount, 0)),
        [data, activeKeys]
    );
    const max = useMemo(() => Math.max(1, ...totals), [totals]);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-base font-bold text-brand-text">{title}</h2>
                <p className="text-xs text-brand-text-muted">{subtitle}</p>
            </div>

            <div className="flex items-end gap-1.5 h-56 px-1 overflow-x-auto">
                {data.map((d, idx) => {
                    const isSelected = d.period === selectedPeriod;
                    const periodTotal = totals[idx];
                    const heightPct = max > 0 ? (periodTotal / max) * 100 : 0;
                    const segments = periodSegments(d, activeKeys);

                    return (
                        <button
                            key={d.period}
                            type="button"
                            onClick={() => onSelect(d.period)}
                            className="group relative flex flex-1 flex-col items-center justify-end h-full min-w-[6px]"
                            title={`${d.label}: ${fmtMoney(periodTotal)}`}
                        >
                            <span className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap rounded-md bg-brand-text px-2 py-1.5 text-[11px] text-white shadow-lg">
                                <span className="block font-bold">{fmtMoney(periodTotal)}</span>
                                {segments.map((s) => (
                                    <span key={s.key} className="block text-white/80">{CHANNEL_HISTORY_LABEL[s.key]}: {fmtMoney(s.amount)}</span>
                                ))}
                            </span>

                            <div
                                className={
                                    'flex w-full flex-col-reverse overflow-hidden rounded-t-md transition-all duration-200 ' +
                                    (isSelected ? 'ring-2 ring-brand-cta ring-offset-1' : '')
                                }
                                style={{ height: Math.max(heightPct, periodTotal > 0 ? 4 : 1) + '%' }}
                            >
                                {segments.length > 0 ? segments.map((s) => (
                                    <div key={s.key} className={CHANNEL_STYLE[s.key]?.bar ?? 'bg-gray-400'} style={{ flexGrow: s.amount }} />
                                )) : (
                                    <div className="h-full w-full bg-gray-200" />
                                )}
                            </div>
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

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-gray-100 pt-3">
                {Object.entries(CHANNEL_STYLE).map(([key, style]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onToggleChannel(key)}
                        className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold transition-colors hover:bg-gray-50 ${
                            activeKeys.has(key) ? 'text-brand-text-muted' : 'text-brand-text-light line-through'
                        }`}
                    >
                        <span className={`h-2 w-2 rounded-full ${activeKeys.has(key) ? style.dot : 'bg-gray-300'}`} />
                        {CHANNEL_HISTORY_LABEL[key]}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Página ─────────────────────────────────────────────────────────────────────

export default function MetricsChannels({
    view,
    selectedPeriod,
    selectedLabel,
    dayBounds,
    availableMonths = [],
    channels = [],
    totalRevenue,
    totalSalesCount,
    history = [],
}) {
    const [activeKeys, setActiveKeys] = useState(() => new Set(channels.map((c) => c.key)));

    const toggleChannel = (key) => {
        setActiveKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const showOnly = (key) => setActiveKeys(new Set([key]));
    const showAll = () => setActiveKeys(new Set(channels.map((c) => c.key)));
    const allActive = activeKeys.size === channels.length;

    const activeChannels = channels.filter((c) => activeKeys.has(c.key));
    const filteredRevenue = activeChannels.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    const filteredSalesCount = activeChannels.reduce((sum, c) => sum + (Number(c.sales_count) || 0), 0);

    const navigate = (params) => {
        router.get(route('admin.metrics.channels'), params, {
            preserveScroll: true,
            preserveState: true,
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

    const chartTitle = view === 'day' ? 'Evolución diaria por canal' : 'Evolución mensual por canal';
    const chartSubtitle = view === 'day'
        ? 'Últimos 30 días · click en una barra para ver detalle'
        : 'Últimos 12 meses · click en una barra para ver detalle';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-brand-text-muted">
                            <Link href={route('admin.metrics.index')} className="hover:text-brand-primary">
                                ← Volver a métricas
                            </Link>
                        </div>
                        <h1 className="mt-1 text-xl font-bold text-brand-text">Facturación por canal</h1>
                        <p className="text-sm text-brand-text-muted">Consolidado de Web, WhatsApp, Instagram y TikTok Live</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ViewToggle view={view} onChange={switchView} />
                        {view === 'day' ? (
                            <DayNavigator selectedDay={selectedPeriod} bounds={dayBounds} onNavigate={navigatePeriod} />
                        ) : (
                            <select
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
            <Head title="Facturación por canal" />

            <div className="p-6 space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
                                Consolidado — {selectedLabel}
                                {!allActive && <span className="ml-1 normal-case text-brand-text-light">(canales filtrados)</span>}
                            </p>
                            <p className="mt-1 text-2xl font-bold text-brand-text">{fmtMoney(filteredRevenue)}</p>
                            <p className="text-xs text-brand-text-muted">
                                {filteredSalesCount} venta{filteredSalesCount === 1 ? '' : 's'}
                                {!allActive && <> de {totalSalesCount} en total</>}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {!allActive && (
                                <button
                                    type="button"
                                    onClick={showAll}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-brand-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary"
                                >
                                    Mostrar todos
                                </button>
                            )}
                            <Link
                                href={route('admin.metrics.index', view === 'day' ? { view: 'day', day: selectedPeriod } : { month: selectedPeriod })}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-brand-text-muted transition-colors hover:border-brand-primary hover:text-brand-primary"
                            >
                                {view === 'day' ? 'Cargar ventas de este día' : 'Ir a Métricas'}
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-4">
                        <ConsolidatedBar channels={activeChannels} total={filteredRevenue} />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {channels.map((c) => (
                            <ChannelRow
                                key={c.key}
                                channel={c}
                                total={filteredRevenue}
                                active={activeKeys.has(c.key)}
                                onToggle={toggleChannel}
                                onIsolate={showOnly}
                            />
                        ))}
                    </div>

                    {view === 'month' && (
                        <p className="mt-4 text-[11px] text-brand-text-light">
                            WhatsApp, Instagram y TikTok Live se cargan día a día desde Métricas — un día sin carga cuenta como 0.
                        </p>
                    )}
                </div>

                <HistoryStackedChart
                    data={history}
                    selectedPeriod={selectedPeriod}
                    onSelect={navigatePeriod}
                    title={chartTitle}
                    subtitle={chartSubtitle}
                    activeKeys={activeKeys}
                    onToggleChannel={toggleChannel}
                />
            </div>
        </AuthenticatedLayout>
    );
}
