// ─── Logo MIMOS ───────────────────────────────────────────────────────────────
// Wordmark "MIMOS" + tagline "para ellos". Usa colores de marca.
// Reemplazable en el futuro por <img src="/logo.svg" />.

export default function Logo({ className = '' }) {
    return (
        <div className={`flex flex-col leading-none select-none ${className}`}>
            <span className="font-extrabold tracking-[0.04em] text-brand-text text-[28px] sm:text-[32px]">
                M<span className="text-brand-primary">i</span>MOS
            </span>
            <span className="text-[10px] tracking-[0.3em] text-brand-text-muted uppercase mt-0.5 self-center">
                para ellos
            </span>
        </div>
    );
}
