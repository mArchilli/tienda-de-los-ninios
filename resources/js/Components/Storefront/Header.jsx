import { Link, usePage } from '@inertiajs/react';
import Logo from './Logo';

// ─── Header ───────────────────────────────────────────────────────────────────
// Logo + acciones (buscar, cuenta, carrito). La navegación se delega al Navbar.

function IconButton({ children, label, badge, as: Tag = 'button', ...props }) {
    return (
        <Tag
            type={Tag === 'button' ? 'button' : undefined}
            aria-label={label}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-brand-text hover:bg-brand-primary-surface transition-colors"
            {...props}
        >
            {children}
            {badge !== undefined && badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-cta px-1 text-[10px] font-bold text-white">
                    {badge}
                </span>
            )}
        </Tag>
    );
}

export default function Header({ cartCount }) {
    const { props } = usePage();
    const count = cartCount ?? props?.cartCount ?? 0;
    return (
        <header className="bg-brand-bg/95 backdrop-blur border-b border-brand-secondary/20">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between gap-4">
                    {/* Logo */}
                    <a href="/" className="shrink-0">
                        <Logo />
                    </a>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <IconButton label="Buscar">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </IconButton>
                        <IconButton label="Mi cuenta">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 14a4 4 0 10-8 0M12 11a3 3 0 100-6 3 3 0 000 6zM4 21c0-3.5 3.5-6 8-6s8 2.5 8 6" />
                            </svg>
                        </IconButton>
                        <IconButton as={Link} href="/carrito" label="Carrito" badge={count}>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 7h14l-1.5 10.5A2 2 0 0115.52 19H8.48a2 2 0 01-1.98-1.5L5 7zM9 7V5a3 3 0 016 0v2" />
                            </svg>
                        </IconButton>
                    </div>
                </div>
            </div>
        </header>
    );
}
