import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar sesion" />

            {status && (
                <div className="mb-5 rounded-2xl border border-brand-secondary/35 bg-brand-secondary-surface px-4 py-3 text-sm font-medium text-brand-primary">
                    {status}
                </div>
            )}

            <div className="mb-7">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-cta-surface px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-cta">
                    Mi cuenta
                </span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-brand-text">
                    Inicia sesion
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">
                    Entra para revisar tu carrito, seguir pedidos y mantener tu experiencia conectada con toda la tienda.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Email"
                        className="!text-sm !font-semibold !text-brand-text"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="!mt-2 !block !w-full !rounded-2xl !border-brand-secondary/45 !bg-brand-bg/70 !px-4 !py-3 !text-sm !text-brand-text !shadow-none placeholder:!text-brand-text-light focus:!border-brand-primary focus:!ring-brand-primary"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Contrasena"
                        className="!text-sm !font-semibold !text-brand-text"
                    />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="!mt-2 !block !w-full !rounded-2xl !border-brand-secondary/45 !bg-brand-bg/70 !px-4 !py-3 !text-sm !text-brand-text !shadow-none placeholder:!text-brand-text-light focus:!border-brand-primary focus:!ring-brand-primary"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className="!rounded !border-brand-secondary/50 !text-brand-primary focus:!ring-brand-primary"
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-3 text-sm text-brand-text-muted">
                            Recordarme
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-brand-primary underline decoration-brand-secondary/80 underline-offset-4 transition hover:text-brand-primary-light focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-white"
                        >
                            Olvidaste tu contrasena?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="home-button !flex !w-full !items-center !justify-center !rounded-[0.3rem] !border-0 !bg-brand-cta !px-7 !py-3.5 !text-sm !font-bold !uppercase !tracking-wide !text-white !shadow-md hover:!bg-brand-cta-dark focus:!bg-brand-cta-dark focus:!ring-brand-cta active:!bg-brand-cta-dark disabled:!opacity-60"
                        disabled={processing}
                    >
                        Ingresar
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
