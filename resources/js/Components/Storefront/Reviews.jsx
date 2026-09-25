import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';

const MAX_ON_LANDING = 20;

function ArrowButton({ dir, disabled, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={dir < 0 ? 'Anterior' : 'Siguiente'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-secondary bg-white text-brand-text-muted transition-colors hover:border-brand-cta hover:text-brand-cta disabled:cursor-default disabled:opacity-30"
        >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={dir < 0 ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
            </svg>
        </button>
    );
}

export default function Reviews({ reviews = [], stats }) {
    const shown = reviews.slice(0, MAX_ON_LANDING);
    const hasReviews = shown.length > 0;
    const total = stats?.count ?? shown.length;
    const hasMore = total > shown.length;

    const trackRef = useRef(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startScroll: 0, moved: false });

    const syncArrows = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanPrev(el.scrollLeft > 8);
        setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    }, []);

    useEffect(() => {
        syncArrows();
        const el = trackRef.current;
        if (!el) return;
        el.addEventListener('scroll', syncArrows, { passive: true });
        window.addEventListener('resize', syncArrows);
        return () => {
            el.removeEventListener('scroll', syncArrows);
            window.removeEventListener('resize', syncArrows);
        };
    }, [syncArrows, shown.length]);

    const scrollByCard = (dir) => {
        const el = trackRef.current;
        if (!el) return;
        const card = el.querySelector('[data-review-card]');
        const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.85;
        el.scrollBy({ left: dir * step, behavior: 'smooth' });
    };

    const handlePointerDown = (e) => {
        if (e.pointerType !== 'mouse') return;
        const el = trackRef.current;
        if (!el) return;
        dragRef.current = { startX: e.clientX, startScroll: el.scrollLeft, moved: false };
        setIsDragging(true);
        el.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        const el = trackRef.current;
        if (!el) return;
        const delta = e.clientX - dragRef.current.startX;
        if (Math.abs(delta) > 3) dragRef.current.moved = true;
        el.scrollLeft = dragRef.current.startScroll - delta;
    };

    const endDrag = (e) => {
        if (!isDragging) return;
        const el = trackRef.current;
        if (el && e?.pointerId !== undefined) el.releasePointerCapture(e.pointerId);
        setIsDragging(false);
    };

    const handleTrackClickCapture = (e) => {
        if (dragRef.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            dragRef.current.moved = false;
        }
    };

    return (
        <section id="resenas" className="bg-brand-bg">
            <div className="store-shell store-section">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="home-section-title">RESEÑAS DE CLIENTES</h2>
                        {hasReviews && stats?.count > 0 && (
                            <div className="mt-3 flex flex-wrap items-center gap-2.5">
                                <StarRating value={stats.average} size="md" />
                                <span className="text-lg font-extrabold text-brand-text">{stats.average}</span>
                                <span className="text-sm text-brand-text-muted">
                                    · {stats.count} {stats.count === 1 ? 'reseña' : 'reseñas'}
                                </span>
                            </div>
                        )}
                    </div>

                    {hasReviews && (
                        <div className="flex items-center gap-3">
                            <div className="hidden gap-2 sm:flex">
                                <ArrowButton dir={-1} disabled={!canPrev} onClick={() => scrollByCard(-1)} />
                                <ArrowButton dir={1} disabled={!canNext} onClick={() => scrollByCard(1)} />
                            </div>
                            {hasMore && (
                                <Link
                                    href="/reseñas#todas"
                                    className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.1em] text-brand-cta transition-colors hover:text-brand-cta-dark"
                                >
                                    Ver todas ({total})
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {hasReviews ? (
                    <>
                        <div
                            ref={trackRef}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={endDrag}
                            onPointerLeave={endDrag}
                            onPointerCancel={endDrag}
                            onClickCapture={handleTrackClickCapture}
                            className={`mt-6 flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:cursor-grab ${
                                isDragging ? 'snap-none select-none sm:cursor-grabbing' : 'snap-x snap-mandatory'
                            }`}
                        >
                            {shown.map((review) => (
                                <div
                                    key={review.id}
                                    data-review-card
                                    className="w-[84vw] max-w-[320px] shrink-0 snap-start sm:w-[320px]"
                                >
                                    <ReviewCard review={review} />
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-brand-text-muted/50 sm:hidden">
                            deslizá para ver más
                        </p>
                    </>
                ) : (
                    <div className="mt-8 rounded-[1.6rem] border border-dashed border-brand-cta/40 bg-white px-6 py-12 text-center">
                        <p className="text-base font-bold text-brand-text">Todavía no hay reseñas</p>
                        <p className="mt-1 text-sm text-brand-text-muted">
                            Si ya compraste con nosotros, ¡sé la primera familia en dejar tu opinión!
                        </p>
                    </div>
                )}

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/reseñas"
                        className="home-button inline-flex items-center justify-center gap-2 bg-brand-cta px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-brand-cta-dark sm:py-4"
                    >
                        Dejá tu reseña
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
