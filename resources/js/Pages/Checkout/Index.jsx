import { Head, useForm } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

// ─── Checkout ─────────────────────────────────────────────────────────────────
// Resumen de productos + selector de método de envío con dos formularios
// (a domicilio / a sucursal). El envío a sucursal omite dirección y observaciones.

function fmt(p) {
    return '$' + Number(p).toLocaleString('es-AR') + ' ARS';
}

const PROVINCES = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
    'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones',
    'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
    'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
];

const COURIERS = ['Correo Argentino', 'OCA', 'Andreani', 'Vía Cargo', 'Otro'];

function Field({ label, error, children }) {
    return (
        <label className="block text-sm">
            <span className="block font-semibold text-brand-text">{label}</span>
            <div className="mt-1">{children}</div>
            {error && <p className="mt-1 text-xs text-brand-cta-dark font-semibold">{error}</p>}
        </label>
    );
}

const inputCls =
    'w-full rounded-md border border-brand-secondary/40 bg-white px-3 py-2 text-sm text-brand-text shadow-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none';

function ProductsCard({ items }) {
    return (
        <section className="rounded-2xl border border-brand-secondary/30 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-brand-primary bg-clip-text text-transparent">
                Productos
            </h2>
            <ul className="mt-4 divide-y divide-brand-secondary/20">
                {items.map((it) => (
                    <li key={it.key} className="flex items-center gap-4 py-3">
                        {it.image ? (
                            <img src={it.image} alt={it.name} className="h-14 w-14 rounded-lg object-cover bg-white" />
                        ) : (
                            <div className="h-14 w-14 rounded-lg bg-brand-primary-surface" />
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-brand-text">{it.name}</p>
                            <p className="text-xs text-brand-text-muted">
                                {it.size_name && <>Talle: {it.size_name} · </>}
                                Cantidad: {it.quantity}
                            </p>
                        </div>
                        <div className="text-right text-xs">
                            <p className="text-brand-text">Precio: {fmt(it.price)}</p>
                            <p className="font-bold text-brand-primary">Total: {fmt(it.subtotal)}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function MethodToggle({ value, onChange }) {
    const opts = [
        { key: 'home',   label: 'Envío a Domicilio', icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13l9-9 9 9M5 11v9h4v-6h6v6h4v-9" />
            </svg>
        )},
        { key: 'branch', label: 'Envío a Sucursal', icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7l9-4 9 4M4 10h16v10H4zM9 20v-6h6v6" />
            </svg>
        )},
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {opts.map((o) => {
                const active = value === o.key;
                return (
                    <button
                        key={o.key}
                        type="button"
                        onClick={() => onChange(o.key)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                            active
                                ? 'border-transparent bg-gradient-to-r from-purple-600 to-brand-secondary-dark text-white shadow'
                                : 'border-brand-secondary/40 bg-white text-brand-text hover:border-brand-primary'
                        }`}
                    >
                        {o.icon}
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}

export default function CheckoutIndex({ cart }) {
    const items    = cart?.items ?? [];
    const subtotal = cart?.subtotal ?? 0;

    const { data, setData, post, processing, errors } = useForm({
        shipping_method: 'home',
        first_name:      '',
        last_name:       '',
        email:           '',
        dni:             '',
        province:        '',
        locality:        '',
        postal_code:     '',
        courier:         '',
        address:         '',
        phone:           '',
        observations:    '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/checkout');
    };

    const isHome = data.shipping_method === 'home';

    return (
        <StorefrontLayout>
            <Head title="Checkout · Mimos" />

            <form onSubmit={submit} className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        <ProductsCard items={items} />

                        <section className="rounded-2xl border border-brand-secondary/30 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-brand-primary bg-clip-text text-transparent">
                                Información de Envío
                            </h2>

                            <div className="mt-4">
                                <p className="text-sm font-semibold text-brand-text">
                                    Método de Envío <span className="font-normal text-brand-text-muted">(A cargo del comprador)</span>
                                </p>
                                <p className="mt-1 text-xs text-brand-text-muted">
                                    En ambos casos nos comunicaremos con usted para informarle el importe del envío.
                                </p>
                                <div className="mt-3">
                                    <MethodToggle value={data.shipping_method} onChange={(v) => setData('shipping_method', v)} />
                                </div>
                                <div className="mt-3 rounded-md bg-brand-secondary-surface px-3 py-2 text-xs text-brand-text-muted">
                                    {isHome
                                        ? 'Te contactaremos luego de la compra para coordinar el envío y su costo.'
                                        : 'Te contactaremos luego de la compra para coordinar la sucursal de retiro y el costo.'}
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="Nombre" error={errors.first_name}>
                                    <input className={inputCls} value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                                </Field>
                                <Field label="Apellido" error={errors.last_name}>
                                    <input className={inputCls} value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                                </Field>
                                <Field label="Correo Electrónico" error={errors.email}>
                                    <input type="email" className={inputCls} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                </Field>
                                <Field label="DNI" error={errors.dni}>
                                    <input className={inputCls} value={data.dni} onChange={(e) => setData('dni', e.target.value)} />
                                </Field>
                                <Field label="Provincia" error={errors.province}>
                                    <select className={inputCls} value={data.province} onChange={(e) => setData('province', e.target.value)}>
                                        <option value="">Seleccione una provincia</option>
                                        {PROVINCES.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Localidad" error={errors.locality}>
                                    <input
                                        className={inputCls}
                                        value={data.locality}
                                        onChange={(e) => setData('locality', e.target.value)}
                                        placeholder="Ingresá tu localidad"
                                    />
                                </Field>
                                <Field label="Código Postal" error={errors.postal_code}>
                                    <input className={inputCls} value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} />
                                </Field>
                                <Field label="Empresa de Correo" error={errors.courier}>
                                    <select className={inputCls} value={data.courier} onChange={(e) => setData('courier', e.target.value)}>
                                        <option value="">Seleccione una empresa</option>
                                        {COURIERS.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </Field>

                                {isHome && (
                                    <Field label="Dirección" error={errors.address}>
                                        <input className={inputCls} value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                    </Field>
                                )}

                                <Field label="Teléfono de Contacto (solo números, ej: 1123456789)" error={errors.phone}>
                                    <input className={inputCls} value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="1123456789" />
                                </Field>

                                {isHome && (
                                    <div className="sm:col-span-2">
                                        <Field label="Observaciones (opcional)" error={errors.observations}>
                                            <textarea
                                                rows={3}
                                                className={inputCls}
                                                value={data.observations}
                                                onChange={(e) => setData('observations', e.target.value)}
                                                placeholder="Agregue cualquier observación o instrucción especial para la entrega"
                                            />
                                        </Field>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-3 self-start rounded-2xl border border-brand-secondary/30 bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-brand-primary bg-clip-text text-transparent">
                            Resumen
                        </h2>

                        <div className="flex items-center justify-between rounded-xl border border-brand-secondary/30 bg-white px-4 py-3">
                            <span className="text-sm font-semibold text-brand-primary">Subtotal</span>
                            <span className="text-sm font-bold text-brand-text">{fmt(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-brand-secondary/30 bg-white px-4 py-3">
                            <span className="text-sm font-semibold text-brand-primary">Envío</span>
                            <span className="text-sm text-brand-text-muted">A confirmar</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-brand-secondary/30 bg-gradient-to-r from-brand-primary-surface via-brand-cta-surface to-brand-secondary-surface px-4 py-3">
                            <span className="text-sm font-semibold text-brand-primary">Total</span>
                            <span className="text-base font-bold text-brand-primary">{fmt(subtotal)}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 block w-full rounded-full bg-gradient-to-r from-purple-600 to-brand-secondary-dark py-3 text-center text-sm font-bold text-white shadow hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Procesando…' : 'Proceder al Pago'}
                        </button>
                    </aside>
                </div>
            </form>
        </StorefrontLayout>
    );
}
