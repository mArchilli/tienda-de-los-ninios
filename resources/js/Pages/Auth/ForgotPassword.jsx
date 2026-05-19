import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Recuperar contrasena" />

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
                    Recuperar contrasena
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-text-muted">
                    Ingresa tu email y te enviaremos un enlace para restablecer tu contrasena y volver a tu cuenta.
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
                        isFocused={true}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        className="home-button !flex !w-full !items-center !justify-center !rounded-[0.3rem] !border-0 !bg-brand-cta !px-7 !py-3.5 !text-sm !font-bold !uppercase !tracking-wide !text-white !shadow-md hover:!bg-brand-cta-dark focus:!bg-brand-cta-dark focus:!ring-brand-cta active:!bg-brand-cta-dark disabled:!opacity-60"
                        disabled={processing}
                    >
                        Enviar enlace
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
