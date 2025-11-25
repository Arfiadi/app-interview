/**
 * Komponen Ringkasan Skor
 * Menampilkan skor total dan progress bar visual.
 */
export default function ScoreSummary({ score }) {
  // Tentukan warna dan label berdasarkan skor
  const getScoreAttr = (s) => {
    if (s >= 80) return { color: "text-green-600", bar: "bg-green-500", label: "Sangat Baik" };
    if (s >= 60) return { color: "text-blue-600", bar: "bg-blue-500", label: "Cukup Baik" };
    return { color: "text-orange-500", bar: "bg-orange-500", label: "Perlu Latihan" };
  };

  const { color, bar, label } = getScoreAttr(score);

  return (
    <div className="bg-white rounded-2xl shadow-card p-8 text-center border border-gray-100 mb-8 animate-fade-in">
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
        Skor Keseluruhan
      </h2>
      
      <div className="flex items-baseline justify-center gap-2 mb-4">
        <span className={`text-6xl font-extrabold ${color}`}>
          {score}
        </span>
        <span className="text-xl text-gray-400 font-medium">/100</span>
      </div>

      {/* Badge Label */}
      <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-6 ${color.replace("text-", "bg-").replace("600", "100")} ${color}`}>
        {label}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden relative">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${bar}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}