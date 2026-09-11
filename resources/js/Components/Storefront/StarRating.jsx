import { useState } from 'react';

const STAR_PATH =
    'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z';

const SIZES = { xs: 'h-3.5 w-3.5', sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' };

function Star({ filled, className }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={filled ? 0 : 1.5}
            aria-hidden="true"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d={STAR_PATH} />
        </svg>
    );
}

// `onChange` presente → modo interactivo (click + preview al pasar el mouse).
// Sin `onChange` → sólo lectura.
export default function StarRating({ value = 0, onChange, size = 'md', className = '' }) {
    const [hover, setHover] = useState(0);
    const interactive = typeof onChange === 'function';
    const sz = SIZES[size] ?? SIZES.md;

    if (!interactive) {
        const rounded = Math.round(value);
        return (
            <div
                className={`inline-flex items-center gap-0.5 ${className}`}
                role="img"
                aria-label={`${value} de 5 estrellas`}
            >
                {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                        key={n}
                        filled={n <= rounded}
                        className={`${sz} ${n <= rounded ? 'text-amber-400' : 'text-brand-text/20'}`}
                    />
                ))}
            </div>
        );
    }

    const shown = hover || value;

    return (
        <div className={`inline-flex items-center gap-1 ${className}`} role="radiogroup" aria-label="Puntaje">
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={value === n}
                    aria-label={`${n} estrella${n === 1 ? '' : 's'}`}
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    className="rounded-md p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cta"
                >
                    <Star
                        filled={n <= shown}
                        className={`${sz} transition-colors ${n <= shown ? 'text-amber-400' : 'text-brand-text/20'}`}
                    />
                </button>
            ))}
        </div>
    );
}
