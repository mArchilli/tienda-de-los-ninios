import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function fmtMoney(n) {
    const num = Number(n) || 0;
    return '$' + num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(iso) {
    if (! iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function StatCard({ title, value, accent = 'primary' }) {
    const accents = {
        primary: 'text-brand-primary',
        cta:     'text-brand-cta',
        text:    'text-brand-text',
    };
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">{title}</p>
            <p className={'mt-1 text-xl font-bold ' + (accents[accent] ?? accents.primary)}>{value}</p>
        </div>
    );
}

export default function MetricsOrders({ view, period, periodLabel, orders = [], currentStats }) {
    const initialBillable = useMemo(
        () => new Set(orders.filter((o) => o.is_billable).map((o) => o.id)),
        [orders]
    );

    const [billable, setBillable] = useState(initialBillable);
    const [search, setSearch] = useState('');

    const filteredOrders = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (! q) return orders;
        return orders.filter((o) => {
            const fullName = `${o.first_name ?? ''} ${o.last_name ?? ''}`.toLowerCase();
            return (
                String(o.id).includes(q) ||
                fullName.includes(q) ||
                (o.email ?? '').toLowerCase().includes(q)
            );
        });
    }, [orders, search]);

    const liveStats = useMemo(() => {
        let revenue = 0;
        let ordersCount = 0;
        let itemsCount = 0;
        for (const o of orders) {
            if (! billable.has(o.id)) continue;
            revenue     += Number(o.total) || 0;
            ordersCount += 1;
            itemsCount  += Number(o.items_count) || 0;
        }
        const avgTicket = ordersCount > 0 ? revenue / ordersCount : 0;
        return { revenue, ordersCount, itemsCount, avgTicket };
    }, [orders, billable]);

    const dirty = useMemo(() => {
        if (billable.size !== initialBillable.size) return true;
        for (const id of billable) if (! initialBillable.has(id)) return true;
        return false;
    }, [billable, initialBillable]);

    const toggle = (id) => {
        setBillable((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = (check) => {
        setBillable((prev) => {
            const next = new Set(prev);
            for (const o of filteredOrders) {
                if (check) next.add(o.id);
                else next.delete(o.id);
            }
            return next;
        });
    };

    const { processing, patch } = useForm({});
    const [confirmOpen, setConfirmOpen] = useState(false);

    const pendingChanges = useMemo(() => {
        const toCancel = [];
        const toReactivate = [];
        for (const o of orders) {
            const nowBillable = billable.has(o.id);
            if (o.is_billable && ! nowBillable) toCancel.push(o);
            if (! o.is_billable && nowBillable) toReactivate.push(o);
        }
        return { toCancel, toReactivate };
    }, [orders, billable]);

    const submit = (e) => {
        e.preventDefault();
        if (! dirty) return;
        setConfirmOpen(true);
    };

    const confirmSave = () => {
        setConfirmOpen(false);
        router.patch(
            route('admin.metrics.orders.update'),
            {
                view,
                ...(view === 'day' ? { day: period } : { month: period }),
                billable_order_ids: Array.from(billable),
            },
            { preserveScroll: true }
        );
    };

    const reset = () => setBillable(initialBillable);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-brand-text-muted">
                            <Link
                                href={route('admin.metrics.index', view === 'day' ? { view: 'day', day: period } : { month: period })}
                                className="hover:text-brand-primary"
                            >
                                ← Volver a métricas
                            </Link>
                        </div>
                        <h1 className="mt-1 text-xl font-bold text-brand-text">
                            Órdenes facturadas — {periodLabel}
                        </h1>
                        <p className="text-sm text-brand-text-muted">
                            Destildá una orden para excluirla del facturado y devolver el stock.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Órdenes — ${periodLabel}`} />

            <form onSubmit={submit} className="p-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Facturado (nuevo)"
                        value={fmtMoney(liveStats.revenue)}
                        accent="cta"
                    />
                    <StatCard
                        title="Pedidos (nuevo)"
                        value={liveStats.ordersCount}
                        accent="primary"
                    />
                    <StatCard
                        title="Ticket promedio (nuevo)"
                        value={fmtMoney(liveStats.avgTicket)}
                        accent="text"
                    />
                    <StatCard
                        title="Unidades (nuevo)"
                        value={liveStats.itemsCount}
                        accent="text"
                    />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-5 py-4 space-y-3">
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-brand-text-muted">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                                </svg>
                            </span>
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por ID, nombre o email..."
                                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-brand-text shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute inset-y-0 right-2 flex items-center text-brand-text-muted hover:text-brand-text"
                                    aria-label="Limpiar búsqueda"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="text-sm text-brand-text-muted">
                                <span className="font-semibold text-brand-text">{filteredOrders.length}</span>
                                {search ? ' resultado' + (filteredOrders.length === 1 ? '' : 's') : ' orden' + (orders.length === 1 ? '' : 'es') + ' en el período'}
                                {' · '}
                                <span className="font-semibold text-brand-text">{billable.size}</span> tildada{billable.size === 1 ? '' : 's'} en total
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleAll(true)}
                                    disabled={filteredOrders.length === 0}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-text hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Tildar {search ? 'filtradas' : 'todas'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleAll(false)}
                                    disabled={filteredOrders.length === 0}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-text hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Destildar {search ? 'filtradas' : 'todas'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="p-10 text-center text-sm text-brand-text-muted">
                            {orders.length === 0
                                ? `No hay órdenes en este ${view === 'day' ? 'día' : 'mes'}.`
                                : 'No hay órdenes que coincidan con la búsqueda.'}
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {filteredOrders.map((o) => {
                                const checked = billable.has(o.id);
                                const isInitiallyCancelled = ! o.is_billable;
                                return (
                                    <li
                                        key={o.id}
                                        className={
                                            'flex items-center gap-4 px-5 py-3 transition-colors ' +
                                            (checked ? 'bg-white' : 'bg-rose-50/40')
                                        }
                                    >
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggle(o.id)}
                                                className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/30"
                                            />
                                        </label>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('admin.orders.show', o.id)}
                                                    className="text-sm font-bold text-brand-text hover:text-brand-primary"
                                                >
                                                    #{o.id}
                                                </Link>
                                                <span className="text-sm text-brand-text">
                                                    {o.first_name} {o.last_name}
                                                </span>
                                                {isInitiallyCancelled && (
                                                    <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                                                        Cancelada
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-0.5 text-xs text-brand-text-muted truncate">
                                                {o.email} · {fmtDate(o.created_at)} · {o.items_count} unidad{o.items_count === 1 ? '' : 'es'}
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-brand-text">{fmtMoney(o.total)}</p>
                                            {! checked && (
                                                <p className="text-[11px] font-semibold text-rose-600">se restará</p>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-lg">
                    <div className="text-sm text-brand-text-muted">
                        {dirty ? (
                            <>
                                Cambios pendientes:{' '}
                                <span className="font-semibold text-brand-text">
                                    {fmtMoney(currentStats.revenue)} → {fmtMoney(liveStats.revenue)}
                                </span>
                            </>
                        ) : (
                            <>Sin cambios pendientes</>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={reset}
                            disabled={! dirty || processing}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brand-text hover:bg-gray-50 disabled:opacity-50"
                        >
                            Deshacer
                        </button>
                        <button
                            type="submit"
                            disabled={! dirty || processing}
                            className="rounded-lg bg-brand-cta px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-cta/90 disabled:opacity-50"
                        >
                            {processing ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </div>
            </form>

            {confirmOpen && (
                <ConfirmModal
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={confirmSave}
                    processing={processing}
                    toCancel={pendingChanges.toCancel}
                    toReactivate={pendingChanges.toReactivate}
                    currentRevenue={currentStats.revenue}
                    newRevenue={liveStats.revenue}
                />
            )}
        </AuthenticatedLayout>
    );
}

function ConfirmModal({ onCancel, onConfirm, processing, toCancel, toReactivate, currentRevenue, newRevenue }) {
    const delta = newRevenue - currentRevenue;
    const deltaLabel =
        delta > 0 ? `+${fmtMoney(delta)}` : delta < 0 ? `-${fmtMoney(Math.abs(delta))}` : fmtMoney(0);
    const deltaClass = delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-brand-text-muted';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-brand-text">Confirmar cambios</h3>
                    <p className="mt-1 text-xs text-brand-text-muted">
                        Esta acción ajusta las métricas del período y modifica el stock de las prendas involucradas.
                    </p>
                </div>

                <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                    {toCancel.length > 0 && (
                        <ChangeBlock
                            tone="rose"
                            title={`Se cancelarán ${toCancel.length} orden${toCancel.length === 1 ? '' : 'es'}`}
                            note="Se devuelve el stock de los talles comprados."
                            orders={toCancel}
                        />
                    )}
                    {toReactivate.length > 0 && (
                        <ChangeBlock
                            tone="emerald"
                            title={`Se reactivarán ${toReactivate.length} orden${toReactivate.length === 1 ? '' : 'es'}`}
                            note="Se descuenta nuevamente el stock de los talles."
                            orders={toReactivate}
                        />
                    )}

                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="flex items-center justify-between text-xs text-brand-text-muted">
                            <span>Facturado actual</span>
                            <span className="font-semibold text-brand-text">{fmtMoney(currentRevenue)}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-brand-text-muted">
                            <span>Facturado nuevo</span>
                            <span className="font-semibold text-brand-text">{fmtMoney(newRevenue)}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-sm">
                            <span className="font-semibold text-brand-text">Variación</span>
                            <span className={'font-bold ' + deltaClass}>{deltaLabel}</span>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={processing}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-brand-text hover:bg-gray-100 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="rounded-lg bg-brand-cta px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-cta/90 disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ChangeBlock({ tone, title, note, orders }) {
    const tones = {
        rose:    { border: 'border-rose-200', bg: 'bg-rose-50/60', title: 'text-rose-700' },
        emerald: { border: 'border-emerald-200', bg: 'bg-emerald-50/60', title: 'text-emerald-700' },
    };
    const t = tones[tone] ?? tones.rose;
    const preview = orders.slice(0, 5);
    const extra = orders.length - preview.length;

    return (
        <div className={`rounded-xl border ${t.border} ${t.bg} px-4 py-3`}>
            <p className={`text-sm font-bold ${t.title}`}>{title}</p>
            <p className="text-xs text-brand-text-muted mt-0.5">{note}</p>
            <ul className="mt-2 space-y-1">
                {preview.map((o) => (
                    <li key={o.id} className="flex items-center justify-between text-xs text-brand-text">
                        <span className="truncate">
                            #{o.id} · {o.first_name} {o.last_name}
                        </span>
                        <span className="font-semibold shrink-0 ml-2">{fmtMoney(o.total)}</span>
                    </li>
                ))}
                {extra > 0 && (
                    <li className="text-[11px] text-brand-text-muted italic">y {extra} más...</li>
                )}
            </ul>
        </div>
    );
}
