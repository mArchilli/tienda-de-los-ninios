import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const inputClass =
        'mt-1.5 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-brand-primary focus:ring-brand-primary';

    return (
        <section className="p-6 sm:p-8">
            <header className="flex items-start gap-3 pb-5 border-b border-gray-100">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary-surface text-brand-primary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </span>
                <div>
                    <h2 className="text-base font-bold text-brand-text">Información del perfil</h2>
                    <p className="mt-0.5 text-sm text-brand-text-muted">
                        Actualizá tu nombre y la dirección de correo asociada a tu cuenta.
                    </p>
                </div>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-5 max-w-xl">
                <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-brand-text">
                        Nombre
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoFocus
                        autoComplete="name"
                        className={inputClass}
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-brand-text">
                        Correo electrónico
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                        className={inputClass}
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                        <p className="text-amber-800">
                            Tu correo electrónico todavía no fue verificado.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-semibold text-amber-900 underline hover:no-underline focus:outline-none"
                            >
                                Reenviar el correo de verificación.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <p className="mt-2 text-sm font-semibold text-emerald-700">
                                Te enviamos un nuevo enlace de verificación a tu correo.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-cta px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors disabled:opacity-50"
                    >
                        Guardar cambios
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Guardado.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
