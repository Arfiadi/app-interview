import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
// Import Komponen Baru
import ScoreSummary from "@/components/results/ScoreSummary";
import ResultQuestionCard from "@/components/results/ResultQuestionCard";

export default function ResultsPage() {
  const router = useRouter();
  const { saveHistory } = useApi();
  const { session_id, result } = router.query;
  const [data, setData] = useState(null);
  const [saved, setSaved] = useState(false);

  // 1. Parsing Data Hasil
  useEffect(() => {
    if (result) {
      try {
        setData(JSON.parse(result));
      } catch (err) {
        console.error("Gagal parse hasil:", err);
      }
    }
  }, [result]);

  // 2. Auto-save ke History
  useEffect(() => {
    if (session_id && !saved) {
      saveHistory(session_id)
        .then(() => setSaved(true))
        .catch(() => console.warn("Gagal auto-save"));
    }
  }, [session_id, saved]);

  // Loading State
  if (!data) {
    return (
      <Layout title="Menganalisis...">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
          <div className="w-12 h-12 border-[3px] border-gray-200 border-t-primary rounded-full animate-spin mb-6"></div>
          <h2 className="text-lg font-semibold text-primary">Sedang Menganalisis Jawaban...</h2>
          <p className="text-sm text-text-sub mt-2">AI Coach sedang menyusun laporan detail untuk Anda.</p>
        </div>
      </Layout>
    );
  }

  const { overall_score, results } = data;

  return (
    <Layout title="Laporan Hasil Interview">
      <div className="bg-background min-h-screen pb-20">
        
        {/* HERO HEADER (Background Color) */}
        <div className="bg-primary pb-32 pt-12 px-4">
            <div className="max-w-3xl mx-auto text-center text-white"> {/* Dipersempit ke max-w-3xl */}
                <h1 className="text-3xl font-bold mb-2">Laporan Evaluasi</h1>
                <p className="text-blue-100 opacity-90">
                  Analisis mendalam performa wawancara Anda pada sesi ini.
                </p>
                {saved && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/20">
                    <span>✅</span> Laporan Tersimpan
                  </div>
                )}
            </div>
        </div>

        {/* CONTAINER KONTEN UTAMA (Floating) */}
        <div className="max-w-3xl mx-auto px-4 -mt-20"> {/* Dipersempit ke max-w-3xl agar fokus */}
            
            {/* Bagian 1: Ringkasan Skor */}
            <ScoreSummary score={overall_score} />

            {/* Bagian 2: Detail Jawaban */}
            <div className="space-y-6 mt-10">
                <div className="flex items-center gap-3 mb-2 px-2">
                    <div className="h-6 w-1 bg-secondary rounded-full"></div>
                    <h2 className="text-xl font-bold text-primary">
                      Detail Umpan Balik
                    </h2>
                </div>
                
                {results.map((item, index) => (
                  <ResultQuestionCard 
                    key={index} 
                    item={item} 
                    index={index} 
                  />
                ))}
            </div>

            {/* Bagian 3: Footer Actions */}
            <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-center gap-4 pb-12">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/history')}
                  className="w-full sm:w-auto px-8 bg-white"
                >
                  Lihat Riwayat
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => router.push('/pre-interview')}
                  className="w-full sm:w-auto px-8 shadow-lg shadow-primary/20"
                >
                  Mulai Sesi Baru
                </Button>
            </div>

        </div>
      </div>
    </Layout>
  );
}