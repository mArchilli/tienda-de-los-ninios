import { Head, useForm } from '@inertiajs/react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';

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
            <span className="block font-semibold uppercase tracking-[0.08em] text-brand-text">{label}</span>
            <div className="mt-1.5">{children}</div>
            {error && <p className="mt-1 text-xs font-semibold text-brand-cta-dark">{error}</p>}
        </label>
    );
}

const inputCls =
    'w-full border border-brand-primary/25 bg-white px-3 py-2.5 text-sm text-brand-text shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15';

function ProductsCard({ items }) {
    return (
        <section className="border border-brand-primary/25 bg-white p-5 shadow-[0_18px_36px_rgba(41,50,65,0.06)]">
            <div className="border border-brand-primary bg-brand-primary px-4 py-4 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/72">Pedido</p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">Productos</h2>
            </div>

            <ul className="mt-4 divide-y divide-brand-primary/12">
                {items.map((it) => (
                    <li key={it.key} className="flex items-center gap-4 py-3">
                        {it.image ? (
                            <img src={it.image} alt={it.name} className="h-14 w-14 border border-brand-primary/20 bg-white object-cover" />
                        ) : (
                            <div className="h-14 w-14 border border-brand-primary/20 bg-brand-primary-surface" />
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-extrabold uppercase tracking-[0.04em] text-brand-text">{it.name}</p>
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
        {
            key: 'home',
            label: 'Envío a domicilio',
            icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 13l9-9 9 9M5 11v9h4v-6h6v6h4v-9" />
                </svg>
            ),
        },
        {
            key: 'branch',
            label: 'Envío a sucursal',
            icon: (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7l9-4 9 4M4 10h16v10H4zM9 20v-6h6v6" />
                </svg>
            ),
        },
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
                        className={`flex items-center justify-center gap-2 border px-3 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition ${
                            active
                                ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                                : 'border-brand-primary/25 bg-white text-brand-text hover:border-brand-primary hover:text-brand-primary'
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

function SummaryRow({ label, value, accent }) {
    return (
        <div className={`flex items-center justify-between border px-4 py-3 ${accent ? 'border-brand-primary bg-brand-primary text-white' : 'border-brand-primary/25 bg-white'}`}>
            <span className={`text-sm font-semibold uppercase tracking-[0.12em] ${accent ? 'text-white' : 'text-brand-primary'}`}>{label}</span>
            <span className={`text-sm font-bold ${accent ? 'text-white text-base' : 'text-brand-text'}`}>{value}</span>
        </div>
    );
}

export default function CheckoutIndex({ cart }) {
    const items = cart?.items ?? [];
    const subtotal = cart?.subtotal ?? 0;

    const { data, setData, post, processing, errors } = useForm({
        shipping_method: 'home',
        first_name: '',
        last_name: '',
        email: '',
        dni: '',
        province: '',
        locality: '',
        postal_code: '',
        courier: '',
        address: '',
        phone: '',
        observations: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/checkout');
    };

    const isHome = data.shipping_method === 'home';

    return (
        <StorefrontLayout>
            <Head title="Checkout · Mimos" />

            <form onSubmit={submit} className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <span className="inline-flex border border-brand-primary/25 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                        Checkout
                    </span>
                    <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] text-brand-text">
                        Finalizar compra
                    </h1>
                    <p className="mt-1 text-sm text-brand-text-muted">
                        Completá tus datos para continuar con el pedido.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        <ProductsCard items={items} />

                        <section className="border border-brand-primary/25 bg-white p-5 shadow-[0_18px_36px_rgba(41,50,65,0.06)]">
                            <div className="border border-brand-primary bg-brand-primary px-4 py-4 text-white">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/72">Envío</p>
                                <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">Información de envío</h2>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-text">
                                    Método de envío <span className="font-normal normal-case tracking-normal text-brand-text-muted">(A cargo del comprador)</span>
                                </p>
                                <p className="mt-1 text-xs text-brand-text-muted">
                                    En ambos casos nos comunicaremos con usted para informarle el importe del envío.
                                </p>
                                <div className="mt-3">
                                    <MethodToggle value={data.shipping_method} onChange={(v) => setData('shipping_method', v)} />
                                </div>
                                <div className="mt-3 border border-brand-primary/18 bg-brand-primary-surface px-3 py-2 text-xs text-brand-text-muted">
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
                                <Field label="Correo electrónico" error={errors.email}>
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
                                <Field label="Código postal" error={errors.postal_code}>
                                    <input className={inputCls} value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} />
                                </Field>
                                <Field label="Empresa de correo" error={errors.courier}>
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

                                <Field label="Teléfono de contacto" error={errors.phone}>
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

                    <aside className="space-y-3 self-start border border-brand-primary/25 bg-white p-5 shadow-[0_18px_36px_rgba(41,50,65,0.08)]">
                        <div className="border border-brand-primary bg-brand-primary px-4 py-4 text-white">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/72">Resumen</p>
                            <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.02em]">Tu compra</h2>
                        </div>

                        <SummaryRow label="Subtotal" value={fmt(subtotal)} />
                        <SummaryRow label="Envío" value="A confirmar" />
                        <SummaryRow label="Total" value={fmt(subtotal)} accent />

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 block w-full bg-brand-cta py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-brand-cta-dark disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Procesando…' : 'Proceder al pago'}
                        </button>
                    </aside>
                </div>
            </form>
        </StorefrontLayout>
    );
}
