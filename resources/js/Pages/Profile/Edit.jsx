import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-brand-text">Mi perfil</h1>
                    <p className="text-sm text-brand-text-muted">
                        Administrá tu información personal y tus credenciales de acceso.
                    </p>
                </div>
            }
        >
            <Head title="Perfil" />

            <div className="p-6 space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <UpdatePasswordForm />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
