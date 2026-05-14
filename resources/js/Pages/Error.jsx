import { Head } from '@inertiajs/react';

const illustrations = {
    404: (
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80" cy="80" r="56" fill="#EBF0F7" stroke="#3D5A80" strokeWidth="7"/>
            <path d="M46 46 Q56 38 70 36" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.6"/>
            <line x1="122" y1="122" x2="160" y2="160" stroke="#3D5A80" strokeWidth="12" strokeLinecap="round"/>
            <text x="53" y="101" fontSize="60" fontWeight="bold" fill="#EE6C4D" fontFamily="Arial, sans-serif">?</text>
        </svg>
    ),
    403: (
        <svg width="160" height="190" viewBox="0 0 160 190" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M38 100 V62 C38 32 122 32 122 62 V100" stroke="#3D5A80" strokeWidth="8" fill="none" strokeLinecap="round"/>
            <rect x="12" y="94" width="136" height="92" rx="14" fill="#EBF0F7" stroke="#3D5A80" strokeWidth="6"/>
            <circle cx="80" cy="134" r="16" fill="#3D5A80"/>
            <rect x="73" y="142" width="14" height="20" rx="5" fill="#3D5A80"/>
        </svg>
    ),
    500: (
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="90" y1="90" x2="90" y2="28" stroke="#EE6C4D" strokeWidth="5" strokeLinecap="round"/>
            <line x1="90" y1="90" x2="134" y2="46" stroke="#EE6C4D" strokeWidth="4" strokeLinecap="round"/>
            <line x1="90" y1="90" x2="152" y2="90" stroke="#EE6C4D" strokeWidth="5" strokeLinecap="round"/>
            <line x1="90" y1="90" x2="134" y2="134" stroke="#EE6C4D" strokeWidth="4" strokeLinecap="round"/>
            <line x1="90" y1="90" x2="90" y2="152" stroke="#EE6C4D" strokeWidth="5" strokeLinecap="round"/>
            <line x1="90" y1="90" x2="46" y2="134" stroke="#EE6C4D" strokeWidth="4" strokeLinecap="round"/>
            <line x1="90" y1="90" x2="28" y2="90" stroke="#EE6C4D" strokeWidth="5" strokeLinecap="round"/>
            <line x1="90" y1="90" x2="46" y2="46" stroke="#EE6C4D" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="90" cy="90" r="26" fill="#EBF0F7" stroke="#3D5A80" strokeWidth="6"/>
            <line x1="90" y1="78" x2="90" y2="92" stroke="#3D5A80" strokeWidth="5" strokeLinecap="round"/>
            <circle cx="90" cy="100" r="3.5" fill="#3D5A80"/>
        </svg>
    ),
    503: (
        <svg width="190" height="190" viewBox="0 0 190 190" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="95" y1="0" x2="95" y2="22" stroke="#3D5A80" strokeWidth="5" strokeLinecap="round"/>
            <rect x="12" y="22" width="166" height="150" rx="14" fill="#EBF0F7" stroke="#3D5A80" strokeWidth="5"/>
            <rect x="12" y="22" width="166" height="48" rx="14" fill="#3D5A80"/>
            <rect x="12" y="56" width="166" height="14" fill="#3D5A80"/>
            <text x="95" y="56" fontSize="21" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif" textAnchor="middle">CERRADO</text>
            <circle cx="95" cy="128" r="34" stroke="#98C1D9" strokeWidth="5" fill="white"/>
            <line x1="95" y1="128" x2="95" y2="104" stroke="#3D5A80" strokeWidth="4" strokeLinecap="round"/>
            <line x1="95" y1="128" x2="113" y2="138" stroke="#3D5A80" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="95" cy="128" r="4" fill="#3D5A80"/>
        </svg>
    ),
};

const pages = {
    403: {
        title: '¡Zona reservada para los grandes!',
        description: 'No tenés permiso para entrar a esta sección. Si creés que es un error, escribinos y te ayudamos.',
        cta: 'Volver a la tienda',
        href: '/',
    },
    404: {
        title: '¡Esta prenda no la encontramos!',
        description: 'La página que buscás parece que se escondió entre los roperos. Puede que haya cambiado de lugar o ya no esté en nuestra tiendita.',
        cta: 'Volver al inicio',
        href: '/',
    },
    500: {
        title: '¡Se enredaron los perchos!',
        description: 'Algo salió mal en nuestra tiendita. Nuestro equipo ya está desenredando todo. Por favor, intentá de nuevo en unos minutos.',
        cta: 'Intentar de nuevo',
        href: null,
    },
    503: {
        title: '¡Tiendita en mantenimiento!',
        description: 'Cerramos un ratito para acomodar toda la ropita y darte la mejor experiencia. Volvemos enseguida con muchas novedades.',
        cta: 'Actualizar página',
        href: null,
    },
};

export default function Error({ status = 500 }) {
    const page = pages[status] ?? {
        title: '¡Ups, algo salió mal!',
        description: 'Ocurrió un error inesperado. Por favor, intentá de nuevo o volvé al inicio.',
        cta: 'Volver al inicio',
        href: '/',
    };

    const illustration = illustrations[status] ?? illustrations[500];

    return (
        <>
            <Head title={`Error ${status} · La Tienda de los Niños`} />

            <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-6 py-16 font-sans text-brand-text">
                {/* Brand */}
                <a href="/" className="group mb-12 flex flex-col items-center text-center">
                    <span className="text-xl font-bold text-brand-primary group-hover:text-brand-primary-dark transition-colors tracking-tight">
                        La Tienda de los Niños
                    </span>
                    <span className="text-[11px] tracking-widest text-brand-text-light uppercase mt-0.5">
                        Ropa para los más chicos
                    </span>
                </a>

                {/* Illustration with watermark number */}
                <div className="relative flex items-center justify-center mb-8">
                    <span className="absolute text-[170px] leading-none font-extrabold text-brand-primary select-none"
                          style={{ opacity: 0.06 }}>
                        {status}
                    </span>
                    <div className="relative z-10">
                        {illustration}
                    </div>
                </div>

                {/* Content */}
                <div className="text-center max-w-sm">
                    <p className="text-xs font-medium tracking-widest uppercase text-brand-text-light mb-3">
                        Error {status}
                    </p>
                    <h1 className="text-2xl font-bold text-brand-text mb-3 leading-snug">
                        {page.title}
                    </h1>
                    <p className="text-sm text-brand-text-muted leading-relaxed">
                        {page.description}
                    </p>
                </div>

                {/* CTA */}
                <div className="mt-10">
                    {page.href ? (
                        <a
                            href={page.href}
                            className="inline-flex items-center gap-2 bg-brand-cta hover:bg-brand-cta-dark text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-sm text-sm"
                        >
                            {page.cta}
                        </a>
                    ) : (
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 bg-brand-cta hover:bg-brand-cta-dark text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-sm text-sm"
                        >
                            {page.cta}
                        </button>
                    )}
                </div>

                {/* Help */}
                <p className="mt-10 text-xs text-brand-text-light">
                    ¿Necesitás ayuda?{' '}
                    <a
                        href="/"
                        className="text-brand-primary underline underline-offset-2 hover:text-brand-primary-dark transition-colors"
                    >
                        Contactanos
                    </a>
                </p>
            </div>
        </>
    );
}
