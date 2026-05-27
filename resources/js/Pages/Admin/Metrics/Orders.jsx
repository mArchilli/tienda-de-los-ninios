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

export default function MetricsOrders({ month, monthLabel, orders = [], currentStats }) {
    const initialBillable = useMemo(
        () => new Set(orders.filter((o) => o.is_billable).map((o) => o.id)),
        [orders]
    );

    const [billable, setBillable] = useState(initialBillable);

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
        if (check) setBillable(new Set(orders.map((o) => o.id)));
        else setBillable(new Set());
    };

    const { processing, patch } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        if (! dirty) return;
        if (! confirm('Vas a actualizar el estado de las órdenes seleccionadas. Esta acción ajusta las métricas y el stock. ¿Continuar?')) return;

        router.patch(
            route('admin.metrics.orders.update'),
            { month, billable_order_ids: Array.from(billable) },
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
                                href={route('admin.metrics.index', { month })}
                                className="hover:text-brand-primary"
                            >
                                ← Volver a métricas
                            </Link>
                        </div>
                        <h1 className="mt-1 text-xl font-bold text-brand-text">
                            Órdenes facturadas — {monthLabel}
                        </h1>
                        <p className="text-sm text-brand-text-muted">
                            Destildá una orden para excluirla del facturado y devolver el stock.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`Órdenes — ${monthLabel}`} />

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
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
                        <div className="text-sm text-brand-text-muted">
                            <span className="font-semibold text-brand-text">{orders.length}</span> orden{orders.length === 1 ? '' : 'es'} en el período
                            {' · '}
                            <span className="font-semibold text-brand-text">{billable.size}</span> tildada{billable.size === 1 ? '' : 's'}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => toggleAll(true)}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-text hover:bg-gray-50"
                            >
                                Tildar todas
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleAll(false)}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-text hover:bg-gray-50"
                            >
                                Destildar todas
                            </button>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-10 text-center text-sm text-brand-text-muted">
                            No hay órdenes en este mes.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {orders.map((o) => {
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
        </AuthenticatedLayout>
    );
}
