import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────
// Reemplazar con props reales desde el controlador Laravel cuando estén disponibles.

const kpis = [
    {
        label: 'Ventas del mes',
        value: '$125.430',
        sub: '+12% vs. mes anterior',
        positive: true,
        bgIcon: 'bg-brand-primary-surface',
        colorIcon: 'text-brand-primary',
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
    },
    {
        label: 'Pedidos nuevos',
        value: '48',
        sub: 'recibidos hoy',
        positive: true,
        bgIcon: 'bg-brand-secondary-surface',
        colorIcon: 'text-brand-primary',
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
            </svg>
        ),
    },
    {
        label: 'Clientes activos',
        value: '312',
        sub: '+8 esta semana',
        positive: true,
        bgIcon: 'bg-brand-secondary-surface',
        colorIcon: 'text-brand-secondary-dark',
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
            </svg>
        ),
    },
    {
        label: 'Prendas disponibles',
        value: '89',
        sub: '3 con stock bajo',
        positive: false,
        bgIcon: 'bg-brand-cta-surface',
        colorIcon: 'text-brand-cta',
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
            </svg>
        ),
    },
];

const recentOrders = [
    { id: 'ORD-001', customer: 'Ana García',       items: 'Combo Invierno 2-3 años',   total: '$2.500', status: 'Entregado',  date: '08/05' },
    { id: 'ORD-002', customer: 'Carlos Ruiz',       items: 'Campera Nena + Pantalón',   total: '$1.800', status: 'Procesando', date: '07/05' },
    { id: 'ORD-003', customer: 'María López',       items: 'Combo Verano 4-5 años',     total: '$3.200', status: 'Pendiente',  date: '07/05' },
    { id: 'ORD-004', customer: 'Juan Martínez',     items: 'Set Nene 0-6 meses',        total: '$1.450', status: 'Entregado',  date: '06/05' },
    { id: 'ORD-005', customer: 'Laura Fernández',   items: 'Oferta Día del Niño',       total: '$4.800', status: 'Procesando', date: '06/05' },
    { id: 'ORD-006', customer: 'Pablo Soto',        items: 'Remeras x3 Unisex',         total: '$900',   status: 'Cancelado',  date: '05/05' },
];

const statusStyles = {
    Entregado:  'bg-emerald-50 text-emerald-700',
    Procesando: 'bg-brand-secondary-surface text-brand-primary',
    Pendiente:  'bg-amber-50 text-amber-700',
    Cancelado:  'bg-red-50 text-red-600',
};

const lowStock = [
    { name: 'Combo Verano 0-3 meses',    qty: 2 },
    { name: 'Remera Unisex 4-6 años',    qty: 3 },
    { name: 'Pantalón Nena talle 2',     qty: 1 },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-brand-text">
                            Panel de Administración
                        </h2>
                        <p className="text-sm text-brand-text-muted mt-0.5">
                            Resumen general de la tienda
                        </p>
                    </div>
                    <a
                        href="#"
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-cta px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva Prenda
                    </a>
                </div>
            }
        >
            <Head title="Dashboard Admin" />

            <div className="p-6 space-y-6">

                {/* ── KPI Cards ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {kpis.map((kpi) => (
                        <div
                            key={kpi.label}
                            className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4"
                        >
                            <div className={`${kpi.bgIcon} ${kpi.colorIcon} rounded-xl p-3 shrink-0`}>
                                {kpi.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-brand-text-muted truncate">
                                    {kpi.label}
                                </p>
                                <p className="text-2xl font-bold text-brand-text mt-0.5">
                                    {kpi.value}
                                </p>
                                <p className={`text-xs mt-1 ${kpi.positive ? 'text-emerald-600' : 'text-brand-cta'}`}>
                                    {kpi.sub}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main grid ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Últimos pedidos (2 cols) */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-brand-text">Últimos Pedidos</h3>
                            <a
                                href="#"
                                className="text-sm font-medium text-brand-primary hover:text-brand-primary-dark transition-colors"
                            >
                                Ver todos →
                            </a>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-left text-xs font-semibold text-brand-text-muted uppercase tracking-wide">
                                        <th className="px-5 py-3">Pedido</th>
                                        <th className="px-5 py-3">Cliente</th>
                                        <th className="px-5 py-3 hidden md:table-cell">Prendas</th>
                                        <th className="px-5 py-3">Total</th>
                                        <th className="px-5 py-3">Estado</th>
                                        <th className="px-5 py-3 hidden sm:table-cell">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-brand-bg transition-colors"
                                        >
                                            <td className="px-5 py-3.5 font-mono text-xs text-brand-text-muted">
                                                {order.id}
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-brand-text">
                                                {order.customer}
                                            </td>
                                            <td className="px-5 py-3.5 text-brand-text-muted hidden md:table-cell max-w-[180px] truncate">
                                                {order.items}
                                            </td>
                                            <td className="px-5 py-3.5 font-semibold text-brand-text">
                                                {order.total}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[order.status]}`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-brand-text-muted hidden sm:table-cell">
                                                {order.date}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Columna derecha */}
                    <div className="space-y-4">

                        {/* Acciones rápidas */}
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="font-semibold text-brand-text mb-4">Acciones Rápidas</h3>
                            <div className="space-y-2.5">
                                <a
                                    href="#"
                                    className="flex items-center gap-3 w-full rounded-lg bg-brand-cta px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-cta-dark transition-colors"
                                >
                                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Agregar Prenda
                                </a>

                                <a
                                    href="#"
                                    className="flex items-center gap-3 w-full rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-primary-dark transition-colors"
                                >
                                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Ver Pedidos
                                </a>

                                <a
                                    href="#"
                                    className="flex items-center gap-3 w-full rounded-lg border border-brand-secondary text-brand-primary px-4 py-2.5 text-sm font-semibold hover:bg-brand-secondary-surface transition-colors"
                                >
                                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    Gestionar Ofertas
                                </a>

                                <a
                                    href="#"
                                    className="flex items-center gap-3 w-full rounded-lg border border-gray-200 text-brand-text-muted px-4 py-2.5 text-sm font-semibold hover:bg-brand-bg hover:text-brand-text transition-colors"
                                >
                                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Ver Clientes
                                </a>
                            </div>
                        </div>

                        {/* Alerta de stock bajo */}
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <svg className="h-4 w-4 text-brand-cta shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h3 className="font-semibold text-brand-text">Stock Bajo</h3>
                            </div>
                            <ul className="space-y-2.5">
                                {lowStock.map((item) => (
                                    <li
                                        key={item.name}
                                        className="flex items-center justify-between text-sm gap-2"
                                    >
                                        <span className="text-brand-text-muted truncate">{item.name}</span>
                                        <span className="shrink-0 inline-flex items-center rounded-full bg-brand-cta-surface px-2 py-0.5 text-xs font-semibold text-brand-cta">
                                            {item.qty} ud.
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
