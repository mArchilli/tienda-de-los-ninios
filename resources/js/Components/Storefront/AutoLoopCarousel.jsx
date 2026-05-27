import { useEffect, useState } from 'react';

export default function AutoLoopCarousel({
    items,
    renderItem,
    ariaLabel,
    intervalMs = 3000,
    className = '',
    itemClassName = '',
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const total = items.length;

    useEffect(() => {
        if (total <= 1) return undefined;

        const timer = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % total);
        }, intervalMs);

        return () => window.clearInterval(timer);
    }, [intervalMs, total]);

    if (total === 0) return null;

    return (
        <div className={className}>
            <div className="overflow-hidden" aria-label={ariaLabel}>
                <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {items.map((item, index) => (
                        <div key={item.title ?? item.label ?? index} className={`min-w-full ${itemClassName}`}>
                            {renderItem(item, index)}
                        </div>
                    ))}
                </div>
            </div>

            {total > 1 && (
                <div className="mt-3 flex items-center justify-center gap-1.5">
                    {items.map((_, index) => (
                        <span
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                index === activeIndex
                                    ? 'w-5 bg-brand-primary'
                                    : 'w-1.5 bg-brand-secondary/70'
                            }`}
                            aria-hidden="true"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
