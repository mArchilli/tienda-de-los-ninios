import Logo from '@/Components/Storefront/Logo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-brand-bg text-brand-text">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(152,193,217,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(238,108,77,0.16),_transparent_32%)]" />
            <div className="absolute left-[-6rem] top-20 h-52 w-52 rounded-full bg-brand-secondary/20 blur-3xl" />
            <div className="absolute bottom-[-4rem] right-[-3rem] h-64 w-64 rounded-full bg-brand-cta/15 blur-3xl" />

            <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="mx-auto mb-5 flex justify-center">
                        <Link href="/" className="inline-flex">
                            <Logo className="w-[170px] sm:w-[190px]" />
                        </Link>
                    </div>

                    <div className="store-panel mx-auto w-full px-6 py-7 sm:px-8 sm:py-9">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
