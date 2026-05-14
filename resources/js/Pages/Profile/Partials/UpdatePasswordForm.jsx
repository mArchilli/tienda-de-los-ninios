import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    const inputClass =
        'mt-1.5 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-brand-primary focus:ring-brand-primary';

    return (
        <section className="p-6 sm:p-8">
            <header className="flex items-start gap-3 pb-5 border-b border-gray-100">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-cta-surface text-brand-cta">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                </span>
                <div>
                    <h2 className="text-base font-bold text-brand-text">Cambiar contraseña</h2>
                    <p className="mt-0.5 text-sm text-brand-text-muted">
                        Asegurate de usar una contraseña larga y aleatoria para mantener tu cuenta segura.
                    </p>
                </div>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-5 max-w-xl">
                <div>
                    <label htmlFor="current_password" className="block text-sm font-semibold text-brand-text">
                        Contraseña actual
                    </label>
                    <input
                        id="current_password"
                        type="password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                        className={inputClass}
                    />
                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-brand-text">
                        Nueva contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        className={inputClass}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-semibold text-brand-text">
                        Confirmar nueva contraseña
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        className={inputClass}
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-cta px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-cta-dark transition-colors disabled:opacity-50"
                    >
                        Actualizar contraseña
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
