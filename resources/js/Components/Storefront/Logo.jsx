export default function Logo({ className = '' }) {
    return (
        <img
            src="/images/logo.png"
            alt="La Tienda de los Ninos"
            className={`h-auto w-[150px] select-none sm:w-[170px] ${className}`}
        />
    );
}
