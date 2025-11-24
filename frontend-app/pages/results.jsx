import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown"; // Pastikan sudah install: npm install react-markdown
import { useApi } from "../hooks/useApi";
import Layout from "../components/Layout";
import Button from "../components/ui/Button";

export default function ResultsPage() {
  const router = useRouter();
  const { saveHistory } = useApi();
  const { session_id, result } = router.query;
  const [data, setData] = useState(null);
  const [saved, setSaved] = useState(false);

  // 1. Parsing Data
  useEffect(() => {
    if (result) {
      try {
        setData(JSON.parse(result));
      } catch (err) {
        console.error("Parse error:", err);
      }
    }
  }, [result]);

  // 2. Auto-save History
  useEffect(() => {
    if (session_id && !saved) {
      saveHistory(session_id)
        .then(() => setSaved(true))
        .catch(() => console.warn("Auto-save gagal (mungkin sudah tersimpan)"));
    }
  }, [session_id, saved]);

  if (!data) {
    return (
      <Layout title="Memuat Hasil...">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-text-sub">Mengambil laporan evaluasi...</p>
        </div>
      </Layout>
    );
  }

  const { overall_score, results } = data;

  // Helper warna skor
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    return "text-yellow-600";
  };
  
  const getProgressColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    return "bg-yellow-500";
  };

  return (
    <Layout title="Laporan Hasil Wawancara">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* HEADER LAPORAN */}
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-3xl font-bold text-primary mb-2">Laporan Evaluasi Wawancara</h1>
          <p className="text-text-sub">Berikut adalah analisis mendalam mengenai performa jawaban Anda.</p>
        </div>

        {/* SCORE CARD UTAMA */}
        <div className="bg-surface rounded-2xl shadow-card border border-gray-100 p-8 mb-10 text-center animate-fade-in">
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Skor Keseluruhan</h2>
          
          <div className="flex items-baseline justify-center gap-1 mb-6">
            <span className={`text-6xl font-bold ${getScoreColor(overall_score)}`}>
              {overall_score}
            </span>
            <span className="text-2xl text-gray-400 font-medium">/100</span>
          </div>

          {/* Progress Bar Besar */}
          <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden max-w-lg mx-auto mb-6">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(overall_score)}`}
              style={{ width: `${overall_score}%` }}
            />
          </div>

          {saved && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Laporan tersimpan otomatis
            </div>
          )}
        </div>

        {/* DETAIL PERTANYAAN */}
        <div className="space-y-8">
          <h3 className="text-xl font-bold text-primary border-b border-gray-200 pb-4">
            Detail Jawaban & Masukan
          </h3>

          {results.map((item, i) => (
            <div key={i} className="bg-surface rounded-xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-card transition-shadow duration-300">
              
              {/* Header Item */}
              <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">
                    Pertanyaan {i + 1}
                  </span>
                  <h4 className="text-lg font-semibold text-primary leading-snug">
                    {item.question}
                  </h4>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm h-fit">
                  <div className="text-xs text-text-sub text-right">
                    <span className="block font-bold">Relevansi</span>
                    Skor
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(item.similarity_score)}`}>
                    {item.similarity_score}
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Jawaban User */}
                <div>
                  <p className="text-xs text-text-muted font-bold uppercase mb-2">Jawaban Anda</p>
                  <div className="bg-gray-50 p-4 rounded-lg text-text-sub italic border border-gray-100">
                    "{item.user_answer}"
                  </div>
                </div>

                {/* Grid Analisis (Keywords) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                     <p className="text-xs text-green-700 font-bold uppercase mb-2 flex items-center gap-1">
                       ✅ Poin Tercover
                     </p>
                     <div className="flex flex-wrap gap-2">
                        {item.keywords.user_keywords.length > 0 ? (
                            item.keywords.user_keywords.map((k, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white text-green-700 text-xs rounded border border-green-100 shadow-sm">{k}</span>
                            ))
                        ) : <span className="text-xs text-gray-400">-</span>}
                     </div>
                  </div>
                  <div className="bg-red-50/50 p-4 rounded-lg border border-red-100">
                     <p className="text-xs text-red-700 font-bold uppercase mb-2 flex items-center gap-1">
                       ⚠️ Poin Hilang
                     </p>
                     <div className="flex flex-wrap gap-2">
                        {item.keywords.missing_keywords.length > 0 ? (
                            item.keywords.missing_keywords.slice(0, 5).map((k, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white text-red-700 text-xs rounded border border-red-100 shadow-sm">{k}</span>
                            ))
                        ) : <span className="text-xs text-green-600">Lengkap!</span>}
                     </div>
                  </div>
                </div>

                {/* Feedback AI */}
                <div className="bg-accent/30 p-5 rounded-xl border border-teal-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                    <p className="text-sm font-bold text-secondary mb-3 flex items-center gap-2">
                        <span>🤖</span> Feedback Coach
                    </p>
                    {/* Render Markdown agar rapi (bold, list, dll) */}
                    <div className="prose prose-sm prose-slate max-w-none text-text-main">
                        <ReactMarkdown>{item.feedback}</ReactMarkdown>
                    </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center pb-12">
          <Button 
            variant="outline" 
            onClick={() => router.push("/history")}
            className="w-full sm:w-auto"
          >
            Lihat Riwayat Sesi
          </Button>
          <Button 
            variant="primary" 
            onClick={() => router.push("/pre-interview")}
            className="w-full sm:w-auto shadow-lg shadow-primary/20"
          >
            Mulai Sesi Baru
          </Button>
        </div>

      </div>
    </Layout>
  );
}