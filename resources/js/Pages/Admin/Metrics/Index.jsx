import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n) {
    const num = Number(n) || 0;
    return '$' + num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Sólo dígitos → separador de miles "es-AR" (punto) mientras se escribe.
function digitsToArs(digits) {
    if (!digits) return '';
    return Number(digits).toLocaleString('es-AR');
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

// ─── Peso input (separador de miles mientras se escribe) ─────────────────────

function PesoInput({ value, onChange, id }) {
    // El valor de referencia es siempre un entero en pesos; sólo formateamos
    // la representación visual con separador de miles "es-AR".
    const digits = value === '' || value === null || value === undefined ? '' : String(Math.trunc(Number(value) || 0));

    return (
        <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-brand-text-light">$</span>
            <input
                id={id}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={digitsToArs(digits)}
                onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-6 pr-3 text-right text-sm font-semibold text-brand-text outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
        </div>
    );
}

// ─── Ventas por canal (WhatsApp / Instagram / TikTok Live) ───────────────────

const CHANNEL_META = {
    whatsapp: {
        color: 'text-emerald-600 bg-emerald-50',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l1.65-4.95A9 9 0 1112 21a8.96 8.96 0 01-4.95-1.5L3 21z" />,
    },
    instagram: {
        color: 'text-fuchsia-600 bg-fuchsia-50',
        icon: <><rect x="3" y="3" width="18" height="18" rx="5" strokeWidth={2} /><circle cx="12" cy="12" r="4" strokeWidth={2} /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></>,
    },
    tiktok: {
        color: 'text-brand-text bg-gray-100',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 4v10.5a3.5 3.5 0 11-3.5-3.5c.35 0 .68.05 1 .14V8.5A6 6 0 1017 14V8a5 5 0 003 1V6a3 3 0 01-3-3h-3z" />,
    },
};

function ChannelSalesHeader({ totalCount, totalAmount, savedAt }) {
    return (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
                <h2 className="text-base font-bold text-brand-text">Ventas por canal</h2>
                <p className="text-xs text-brand-text-muted">
                    WhatsApp, Instagram y TikTok Live — se suman al Facturado (Bruto).
                </p>
            </div>
            <div className="flex items-center gap-2">
                {savedAt && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                        Guardado
                    </span>
                )}
                <span className="text-xs text-brand-text-muted">
                    Total: <span className="font-bold text-brand-text">{totalCount} venta{totalCount === 1 ? '' : 's'}</span>
                    {' · '}
                    <span className="font-bold text-brand-text">{fmtMoney(totalAmount)}</span>
                </span>
            </div>
        </div>
    );
}

// La carga es siempre diaria: en la vista Día se edita el día que se está
// mirando; en la vista Mes sólo se muestra el acumulado (suma de los días
// del mes que ya se cargaron) de forma sólo-lectura, con un atajo al día.
function ChannelSalesCard({ view, selectedPeriod, selectedStats }) {
    if (view !== 'day') {
        return <ChannelSalesSummary selectedStats={selectedStats} selectedPeriod={selectedPeriod} />;
    }
    return <ChannelSalesForm key={selectedPeriod} date={selectedPeriod} selectedStats={selectedStats} />;
}

function ChannelSalesSummary({ selectedStats, selectedPeriod }) {
    const channelKeys = Object.keys(selectedStats.channel_sales ?? {});
    const todayStr = new Date().toISOString().slice(0, 10);
    const jumpDay = todayStr.slice(0, 7) === selectedPeriod ? todayStr : `${selectedPeriod}-01`;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <ChannelSalesHeader
                totalCount={selectedStats.channel_sales_count}
                totalAmount={selectedStats.channel_revenue}
            />

            <div className="space-y-2">
                {channelKeys.map((key) => {
                    const meta = CHANNEL_META[key] ?? {};
                    const row = selectedStats.channel_sales[key];
                    return (
                        <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2">
                            <div className="flex items-center gap-2">
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.color ?? 'bg-gray-100 text-brand-text'}`}>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {meta.icon}
                                    </svg>
                                </span>
                                <span className="text-sm font-semibold text-brand-text">{row.label}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-brand-text">{fmtMoney(row.amount)}</p>
                                <p className="text-[11px] text-brand-text-muted">{row.sales_count} venta{row.sales_count === 1 ? '' : 's'}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-brand-text-muted">
                    Es la suma de los días del mes ya cargados — los días sin carga cuentan como 0.
                </p>
                <button
                    type="button"
                    onClick={() => router.get(route('admin.metrics.index'), { view: 'day', day: jumpDay }, { preserveScroll: true })}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-primary/30 bg-brand-primary-surface px-3 py-1.5 text-xs font-bold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                >
                    Cargar por día
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

function ChannelSalesForm({ date, selectedStats }) {
    const channelKeys = Object.keys(selectedStats.channel_sales ?? {});

    const [form, setForm] = useState(() => Object.fromEntries(channelKeys.map((key) => {
        const row = selectedStats.channel_sales[key];
        return [key, { sales_count: String(row.sales_count ?? 0), amount: String(row.amount ?? 0) }];
    })));
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);

    const setChannel = (key, field, val) => {
        setForm((f) => ({ ...f, [key]: { ...f[key], [field]: val } }));
        setSavedAt(null);
    };

    const totalCount = channelKeys.reduce((sum, k) => sum + (Number(form[k]?.sales_count) || 0), 0);
    const totalAmount = channelKeys.reduce((sum, k) => sum + (Number(form[k]?.amount) || 0), 0);

    const submit = (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            date,
            channels: Object.fromEntries(channelKeys.map((k) => [k, {
                sales_count: parseInt(form[k]?.sales_count, 10) || 0,
                amount: parseInt(form[k]?.amount, 10) || 0,
            }])),
        };

        router.post(route('admin.metrics.channel-sales.update'), payload, {
            preserveScroll: true,
            onSuccess: () => setSavedAt(Date.now()),
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <ChannelSalesHeader totalCount={totalCount} totalAmount={totalAmount} savedAt={savedAt} />

            <form onSubmit={submit} className="space-y-3">
                <div className="hidden grid-cols-[1fr_140px_160px] gap-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-brand-text-muted sm:grid">
                    <span>Canal</span>
                    <span className="text-right">Ventas</span>
                    <span className="text-right">Monto</span>
                </div>

                {channelKeys.map((key) => {
                    const meta = CHANNEL_META[key] ?? {};
                    const label = selectedStats.channel_sales[key]?.label ?? key;
                    return (
                        <div key={key} className="grid grid-cols-1 items-center gap-2 rounded-xl border border-gray-100 p-2.5 sm:grid-cols-[1fr_140px_160px] sm:gap-3 sm:border-0 sm:p-0">
                            <div className="flex items-center gap-2">
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.color ?? 'bg-gray-100 text-brand-text'}`}>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {meta.icon}
                                    </svg>
                                </span>
                                <span className="text-sm font-semibold text-brand-text">{label}</span>
                            </div>

                            <div>
                                <label htmlFor={`chan-count-${key}`} className="mb-1 block text-[10px] font-medium text-brand-text-muted sm:hidden">Ventas</label>
                                <input
                                    id={`chan-count-${key}`}
                                    type="number"
                                    min="0"
                                    inputMode="numeric"
                                    value={form[key]?.sales_count ?? ''}
                                    onChange={(e) => setChannel(key, 'sales_count', e.target.value.replace(/\D/g, ''))}
                                    placeholder="0"
                                    className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-right text-sm font-semibold text-brand-text outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                                />
                            </div>

                            <div>
                                <label htmlFor={`chan-amount-${key}`} className="mb-1 block text-[10px] font-medium text-brand-text-muted sm:hidden">Monto</label>
                                <PesoInput
                                    id={`chan-amount-${key}`}
                                    value={form[key]?.amount ?? ''}
                                    onChange={(v) => setChannel(key, 'amount', v)}
                                />
                            </div>
                        </div>
                    );
                })}

                <div className="flex justify-end border-t border-gray-100 pt-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? 'Guardando…' : 'Guardar ventas del día'}
                    </button>
                </div>
            </form>
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
                        <Link
                            href={route('admin.metrics.channels', view === 'day' ? { view: 'day', day: selectedPeriod } : { month: selectedPeriod })}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-brand-text-muted shadow-sm transition-colors hover:border-brand-primary hover:text-brand-primary"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                            Por canal
                        </Link>
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
                        title="Facturado (Bruto)"
                        value={fmtMoney(selectedStats.revenue)}
                        sub={
                            <>
                                {previousLabel}: {fmtMoneyCompact(previousStats.revenue)}
                                <br />
                                <span className="text-brand-text-light">
                                    Online {fmtMoneyCompact(selectedStats.online_revenue)} · Canales {fmtMoneyCompact(selectedStats.channel_revenue)}
                                </span>
                            </>
                        }
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

                {/* Ventas por canal */}
                <ChannelSalesCard
                    selectedStats={selectedStats}
                    view={view}
                    selectedPeriod={selectedPeriod}
                />

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
