import { useEffect, useState } from 'react';

const WHATSAPP_NUMBER = '5491172397202';
const WHATSAPP_MESSAGE = encodeURIComponent('\u00a1Hola! \u00bfQu\u00e9 tal? Tengo una consulta.');
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function WhatsAppButton() {
    const [showTooltip, setShowTooltip] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowTooltip(true), 1500);
        const hideTimer = setTimeout(() => {
            setShowTooltip(false);
            setDismissed(true);
        }, 8000);
        return () => {
            clearTimeout(timer);
            clearTimeout(hideTimer);
        };
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {showTooltip && (
                <div className="relative max-w-[220px] animate-fade-in rounded-2xl bg-white px-4 py-3 text-sm text-brand-text shadow-lg">
                    <span>{'\u00bfTen\u00e9s alguna duda o necesit\u00e1s ayuda? \u00a1Escribinos!'}</span>
                    <button
                        onClick={() => {
                            setShowTooltip(false);
                            setDismissed(true);
                        }}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs leading-none text-gray-600 hover:bg-gray-300"
                        aria-label="Cerrar"
                    >
                        x
                    </button>
                    <span className="absolute bottom-[-8px] right-6 h-0 w-0 border-l-8 border-r-0 border-t-8 border-l-transparent border-t-white" />
                </div>
            )}

            <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => {
                    if (!dismissed) setShowTooltip(true);
                }}
                onMouseLeave={() => {
                    if (!dismissed) setShowTooltip(false);
                }}
                aria-label="Contactar por WhatsApp"
                className="flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95"
                style={{ backgroundColor: '#25D366' }}
            >
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.833L.057 23.077a.75.75 0 0 0 .92.92l5.184-1.457A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.74 9.74 0 0 1-4.98-1.365l-.356-.213-3.696 1.038 1.05-3.596-.233-.37A9.714 9.714 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                </svg>
            </a>
        </div>
    );
}
