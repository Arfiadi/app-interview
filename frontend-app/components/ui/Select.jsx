/**
 * Komponen Dropdown Kustom
 */
export default function Select({ label, options = [], placeholder = "Pilih opsi...", error, ...props }) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-main mb-1.5 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={`w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-text-main placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary appearance-none cursor-pointer ${error ? "border-red-500 focus:ring-red-200" : ""}`}
            {...props}
          >
            <option value="" disabled className="text-gray-400">
              {placeholder}
            </option>
            {options.map((opt) => (
              <option key={opt} value={opt} className="text-text-main py-2">
                {opt}
              </option>
            ))}
          </select>
          {/* Ikon Panah Kustom */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-muted">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>}
      </div>
    );
  }