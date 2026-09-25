import StarRating from './StarRating';

function initials(name) {
    if (!name) return '★';
    const parts = name.trim().split(/\s+/);
    const raw = parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0];
    return raw.toUpperCase();
}

function formatDate(iso) {
    if (!iso) return null;
    try {
        return new Date(iso).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    } catch {
        return null;
    }
}

export default function ReviewCard({ review }) {
    const name = review.author_name?.trim() || 'Cliente';
    const date = formatDate(review.created_at);

    return (
        <article className="flex h-full flex-col rounded-[1.5rem] border border-brand-secondary/60 bg-white p-5">
            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary-surface text-sm font-bold text-brand-primary">
                    {initials(review.author_name)}
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-brand-text">{name}</p>
                    {date && (
                        <p className="text-[11px] uppercase tracking-[0.12em] text-brand-text-light">{date}</p>
                    )}
                </div>
            </div>

            <StarRating value={review.rating} size="sm" className="mt-3" />

            <p className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-brand-text-muted">
                {review.body}
            </p>
        </article>
    );
}
