import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi"; 
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import HistoryItem from "@/components/history/HistoryItem"; // Import komponen baru

export default function HistoryPage() {
  const { getHistory, deleteHistory, loading, error } = useApi();
  const [historyList, setHistoryList] = useState([]);

  // Load Data
  const refreshHistory = async () => {
      try {
        const data = await getHistory(); 
        const sorted = Array.isArray(data) ? data.reverse() : [];
        setHistoryList(sorted);
      } catch (err) { }
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  // Handle Delete
  const handleDelete = async (sessionId) => {
      if(!confirm("Apakah Anda yakin ingin menghapus riwayat ini?")) return;
      
      try {
          await deleteHistory(sessionId);
          // Refresh list setelah hapus
          await refreshHistory();
      } catch(e) {
          alert("Gagal menghapus data.");
      }
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

        {loading && historyList.length === 0 ? (
           <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
           </div>
        ) : error ? (
           <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center border border-red-100">
             Gagal memuat riwayat. Pastikan backend berjalan.
           </div>
        ) : historyList.length === 0 ? (
           <div className="text-center py-20 bg-surface rounded-2xl border border-dashed border-gray-300">
             <p className="text-text-muted mb-4">Belum ada riwayat wawancara.</p>
             <Button onClick={() => window.location.href = '/pre-interview'}>Mulai Sekarang</Button>
           </div>
        ) : (
          <div className="grid gap-4 animate-fade-in">
            {historyList.map((item) => (
              <HistoryItem 
                key={item.session_id} 
                item={item} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}