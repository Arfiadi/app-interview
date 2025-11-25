import Button from "../ui/Button";

/**
 * Komponen Kartu Item Riwayat
 * Menampilkan detail sesi dan tombol hapus.
 */
export default function HistoryItem({ item, onDelete }) {
  
  const getScoreBadgeColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 60) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  return (
    <div className="bg-surface p-6 rounded-xl shadow-soft border border-gray-100 hover:shadow-card hover:border-secondary/30 transition-all duration-200 group relative">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Info Utama */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-primary">
              {item.meta?.job_role || item.job_role || "Unknown Role"}
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-text-sub border border-gray-200 uppercase tracking-wide">
              {item.meta?.experience_level || item.experience_level || "General"}
            </span>
          </div>
          <p className="text-sm text-text-sub">
            {item.meta?.industry || item.industry || "-"} • {item.timestamp || "Tanggal tidak tersedia"}
          </p>
        </div>

        {/* Skor & Action */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className={`px-4 py-1.5 rounded-lg border font-bold text-sm ${getScoreBadgeColor(item.overall_score)}`}>
            Skor: {item.overall_score}
          </div>
          
          <div className="flex gap-2">
             <button 
                className="text-sm font-medium text-secondary hover:text-primary transition-colors underline decoration-transparent hover:decoration-current"
                onClick={() => alert("Fitur lihat detail akan segera hadir!")}
              >
                Detail
              </button>
              
              {/* Tombol Hapus */}
              <button 
                className="text-sm font-medium text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                onClick={() => onDelete(item.session_id)}
                title="Hapus Riwayat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
          </div>
        </div>

      </div>
    </div>
  );
}