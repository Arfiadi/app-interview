import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import Layout from "@/components/common/Layout";
import Button from "@/components/ui/Button";
import ScoreSummary from "@/components/results/ScoreSummary";
import ResultQuestionCard from "@/components/results/ResultQuestionCard";

export default function ResultsPage() {
  const router = useRouter();
  const { saveHistory } = useApi();
  const { session_id, result } = router.query;
  const [data, setData] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (result) {
      try {
        setData(JSON.parse(result));
      } catch (err) {
        console.error("Gagal parse hasil:", err);
      }
    }
  }, [result]);

  useEffect(() => {
    if (session_id && !saved) {
      saveHistory(session_id)
        .then(() => setSaved(true))
        .catch(() => console.warn("Gagal auto-save"));
    }
  }, [session_id, saved]);

  if (!data) {
    return (
      <Layout title="Menganalisis...">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
          <div className="w-12 h-12 border-[3px] border-gray-200 border-t-primary rounded-full animate-spin mb-6"></div>
          <h2 className="text-lg font-semibold text-primary">Sedang Menganalisis Jawaban...</h2>
        </div>
      </Layout>
    );
  }

  const { overall_score, results } = data;

  return (
    <Layout title="Laporan Hasil Interview">
      <div className="bg-background min-h-screen pb-20">
        
        {/* HERO HEADER (Dark Navy) */}
        <div className="bg-primary pb-32 pt-10 px-4 border-b border-white/10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-white text-center md:text-left">
                    <h1 className="text-3xl font-bold mb-2">Laporan Evaluasi</h1>
                    <p className="text-blue-100 opacity-90">
                      Analisis performa sesi wawancara Anda.
                    </p>
                </div>
                
                {/* Status Badge */}
                {saved && (
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-white shadow-lg">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Laporan Tersimpan
                  </div>
                )}
            </div>
        </div>

        {/* MAIN CONTENT (Lebar Maksimal 7xl) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
            
            {/* Grid Layout: Skor di Kiri/Atas, Detail di Kanan/Bawah */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* KOLOM KIRI (Sidebar Skor - Sticky) */}
                <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6 order-1">
                    <ScoreSummary score={overall_score} />
                    
                    {/* Action Card Kecil */}
                    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hidden lg:block">
                        <h3 className="font-bold text-primary mb-4">Langkah Selanjutnya</h3>
                        <div className="space-y-3">
                            <Button 
                              variant="primary" 
                              className="w-full justify-center"
                              onClick={() => router.push('/pre-interview')}
                            >
                              Mulai Sesi Baru
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full justify-center"
                              onClick={() => router.push('/history')}
                            >
                              Arsip Riwayat
                            </Button>
                        </div>
                    </div>
                </div>

                {/* KOLOM KANAN (Detail Jawaban - Lebar) */}
                <div className="lg:col-span-8 order-2 space-y-8">
                    
                    <div className="flex items-center gap-3 mb-2 bg-white/50 backdrop-blur p-4 rounded-xl border border-gray-100 shadow-sm lg:bg-transparent lg:shadow-none lg:border-none lg:p-0">
                        <div className="h-8 w-1 bg-secondary rounded-full"></div>
                        <div>
                            <h2 className="text-xl font-bold text-primary">Detail Umpan Balik</h2>
                            <p className="text-sm text-text-sub">Analisis per pertanyaan oleh AI Coach</p>
                        </div>
                    </div>
                    
                    {results.map((item, index) => (
                      <ResultQuestionCard 
                        key={index} 
                        item={item} 
                        index={index} 
                      />
                    ))}

                    {/* Mobile Actions (Hanya muncul di HP) */}
                    <div className="lg:hidden grid grid-cols-1 gap-3 pt-6">
                        <Button onClick={() => router.push('/pre-interview')}>Mulai Sesi Baru</Button>
                        <Button variant="outline" onClick={() => router.push('/history')}>Arsip Riwayat</Button>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </Layout>
  );
}