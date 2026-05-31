const FAQS = [
    {
        question: '\u00bfC\u00f3mo comprar?',
        answer: [
            'Entr\u00e1 al cat\u00e1logo y eleg\u00ed la prenda que te guste, seleccion\u00e1 un talle y agregala al carrito. Si es un combo, sum\u00e1 las prendas que quieras; pod\u00e9s sumar cuantas prendas quieras.',
            'Una vez que tengas tu carrito, segu\u00ed las instrucciones y llen\u00e1 tus datos. Luego nos comunicaremos por WhatsApp para coordinar y despachar tu pedido.',
            {
                type: 'whatsapp-link',
                text: '\u00bfTen\u00e9s alguna duda? Hac\u00e9 click ac\u00e1 y charlamos por WhatsApp.',
            },
        ],
    },
    {
        question: '\u00bfRealizan env\u00edos al interior y a la provincia de Buenos Aires?',
        answer: [
            'Si realizamos envios al interior, a PBA y a todo el pais a traves de Via Cargo, Correo Argentino y Andreani.',
        ],
    },
    {
        question: '\u00bfCu\u00e1ndo despachan los pedidos?',
        answer: [
            'Si realizas la compra por la mañana te lo despachamos el mismo dia. Si compras por la tarde, al otro dia a primera hora.',
        ],
    },
    {
        question: '\u00bfQu\u00e9 talles trabajan?',
        answer: [
            'Beb\u00e9: talles 0, 1, 2, 3, 4, 5 y 6.',
            'Ni\u00f1o/a: talles 4, 6, 8, 10, 12, 14, 16 y 18.',
        ],
    },
    {
        question: '\u00bfVenden por mayor o menor?',
        answer: [
            'Si, realizamos ventas por mayor y por menor. Para compras mayoristas, los minimos y condiciones se informan a traves de nuestro canal de atencion por WhatsApp.',
        ],
    },
    {
        question: '\u00bfCu\u00e1nto demora el env\u00edo?',
        answer: [
            'Los plazos de entrega dependen del transporte seleccionado y de la localidad de destino. Una vez despachado el pedido, se envia al cliente el comprobante correspondiente para su seguimiento.',
        ],
    },
    {
        question: '\u00bfQu\u00e9 m\u00e9todos de pago aceptan?',
        answer: [
            'Aceptamos pagos mediante Mercado Pago y transferencia bancaria. Todas las operaciones se realizan de forma segura y el pedido se confirma una vez acreditado el pago.',
        ],
    },
];

const WHATSAPP_NUMBER = '5491172397202';
const WHATSAPP_MESSAGE = encodeURIComponent('\u00a1Hola! \u00bfQu\u00e9 tal? Tengo una consulta.');
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;
const HOW_TO_BUY_WHATSAPP_MESSAGE = encodeURIComponent('\u00a1Hola! Tengo una duda sobre c\u00f3mo comprar en la web.');
const HOW_TO_BUY_WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${HOW_TO_BUY_WHATSAPP_MESSAGE}`;

function FaqItem({ item, featured = false }) {
    const label = item.question.startsWith('¿') ? item.question : `¿${item.question.replace(/\?$/, '')}?`;

    return (
        <details
            className={`home-surface group border border-brand-cta/35 bg-white transition-colors open:border-brand-cta ${
                featured ? 'shadow-[0_18px_42px_rgba(31,31,31,0.07)]' : 'shadow-[0_12px_30px_rgba(31,31,31,0.05)]'
            }`}
            open={featured}
        >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex items-center gap-4">
                    <span className="home-media flex h-11 w-11 shrink-0 items-center justify-center bg-brand-cta/12 text-base font-bold text-brand-cta">
                        {item.number}
                    </span>
                    <h3 className="text-left text-lg font-extrabold leading-tight text-brand-text sm:text-[1.35rem]">
                        {label}
                    </h3>
                </div>
                <span className="home-media flex h-10 w-10 shrink-0 items-center justify-center border border-brand-cta/45 text-brand-cta transition-colors group-open:border-brand-cta group-open:text-brand-cta">
                    <svg className="h-4 w-4 transition-transform group-open:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                    </svg>
                </span>
            </summary>

            <div className="border-t border-brand-cta/25 px-5 py-5 sm:px-6">
                <div className="space-y-3 text-sm leading-relaxed text-brand-text-muted sm:text-[15px]">
                    {item.answer.map((line, index) => {
                        if (typeof line === 'object' && line?.type === 'whatsapp-link') {
                            const [questionText, linkText] = String(line.text).split(' Hacé ');

                            return (
                                <p key={`${item.question}-${index}`}>
                                    {questionText}{' '}
                                    <a
                                        href={HOW_TO_BUY_WHATSAPP_URL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-semibold text-brand-cta transition-colors hover:text-brand-cta-dark"
                                    >
                                        {'Hacé '}{linkText}
                                    </a>
                                </p>
                            );
                        }

                        return <p key={`${item.question}-${index}`}>{line}</p>;
                    })}
                </div>
            </div>
        </details>
    );
}

export default function FAQ() {
    return (
        <section id="faq" className="bg-brand-bg">
            <div className="store-shell store-section">
                <div className="relative">

                    <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <h2 className="home-section-title">
                                PREGUNTAS FRECUENTES
                            </h2>
                        </div>
                    </div>

                    <div className="relative z-10 mt-8 space-y-4">
                        {FAQS.map((item, index) => (
                            <FaqItem
                                key={item.question}
                                item={{ ...item, number: index + 1 }}
                                featured={index === 0}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 mt-8 rounded-[1.25rem] border border-brand-cta/35 bg-white/90 px-5 py-4 text-sm leading-relaxed text-brand-text-muted sm:text-base">
                        <p>
                            Tenes otra duda que no este resuelta?{' '}
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-brand-cta transition-colors hover:text-brand-cta-dark"
                            >
                                Escribinos por WhatsApp
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
