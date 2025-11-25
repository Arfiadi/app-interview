/**
 * Komponen Input Teks Standar
 */
export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-main mb-1.5 ml-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text-main placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary ${error ? "border-red-500 focus:ring-red-200 focus:border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
}