import { useEffect, useState } from "react";
// Gunakan path import alias @ (berkat jsconfig.json)
import { useApi } from "@/hooks/useApi"; 
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";

export default function HistoryPage() {
  const { getHistory, loading, error } = useApi();
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        // Panggil fungsi getHistory tanpa ID untuk mengambil semua data
        // Ini akan menembak ke /api/history/all
        const data = await getHistory(); 
        const sorted = Array.isArray(data) ? data.reverse() : [];
        setHistoryList(sorted);
      } catch (err) {
        // Error handled by hook
      }
    }
    load();
  }, []);

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 60) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  return (
    <Layout title="Riwayat Sesi">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex justify-between items-center mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold text-primary">Riwayat Sesi</h1>
            <p className="text-text-sub mt-1">Arsip perjalanan latihan wawancara Anda.</p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/pre-interview'} className="hidden sm:flex">
            + Sesi Baru
          </Button>
        </div>

        {loading ? (
           <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
           </div>
        ) : error ? (
           <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center border border-red-100">
             Gagal memuat riwayat. Pastikan backend Python berjalan.
           </div>
        ) : historyList.length === 0 ? (
           <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-gray-300">
             <p className="text-text-muted mb-4">Belum ada riwayat wawancara.</p>
             <Button onClick={() => window.location.href = '/pre-interview'}>Mulai Sekarang</Button>
           </div>
        ) : (
          <div className="grid gap-4 animate-fade-in">
            {historyList.map((item, index) => (
              <div 
                key={index} 
                className="bg-surface p-6 rounded-xl shadow-soft border border-gray-100 hover:shadow-card hover:border-secondary/30 transition-all duration-200 group"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                      {item.meta?.industry || item.industry || "-"} • {item.timestamp || "Baru saja"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className={`px-4 py-1.5 rounded-lg border font-bold text-sm ${getScoreBadgeColor(item.overall_score)}`}>
                      Skor: {item.overall_score}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}