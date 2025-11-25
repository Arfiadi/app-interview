import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Button from "../components/ui/Button";

export default function InterviewPage() {
  const router = useRouter();
  
  // Ambil parameter dari URL
  const jobFromQuery = router.query.job || router.query.job_role || "";
  const levelFromQuery = router.query.level || router.query.experience_level || "";
  const industryFromQuery = router.query.industry || "";

  // State Management
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 1. Generate Pertanyaan saat halaman dimuat
  useEffect(() => {
    if (!router.isReady) return;
    
    // Jika parameter kosong, kembalikan ke setup (opsional)
    if (!jobFromQuery || !levelFromQuery || !industryFromQuery) {
       // Bisa di-redirect atau biarkan loading (tergantung preferensi)
    }

    async function loadQuestions() {
      setLoading(true);
      setError("");
      try {
        const payload = {
          job_role: jobFromQuery,
          experience_level: levelFromQuery,
          industry: industryFromQuery,
          num_questions: 5
        };

        const res = await fetch("http://127.0.0.1:8000/interview/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Gagal membuat sesi: ${text}`);
        }

        const data = await res.json();
        
        if (!data.session_id || !Array.isArray(data.questions)) {
          throw new Error("Format respon backend tidak valid.");
        }

        setQuestions(data.questions);
        setSessionId(data.session_id);
        setCurrentIndex(0);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat sesi wawancara. Pastikan backend berjalan.");
      } finally {
        setLoading(false);
      }
    }

    if (jobFromQuery && levelFromQuery) {
        loadQuestions();
    }
  }, [router.isReady, jobFromQuery, levelFromQuery, industryFromQuery]);

  // 2. Handle Submit & Next
  const handleNext = async () => {
    if (!sessionId) return;
    
    setSubmitting(true);
    setError("");

    try {
      // Kirim jawaban ke backend
      const body = {
        session_id: sessionId,
        question_index: currentIndex,
        answer: answer || "Tidak ada jawaban" // Handle empty answer
      };

      const res = await fetch("http://127.0.0.1:8000/scoring/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Gagal menyimpan jawaban.");

      // Reset input
      setAnswer("");

      // Cek apakah masih ada pertanyaan
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Jika sudah selesai, lakukan evaluasi akhir
        await handleFinish();
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mengirim jawaban.");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Handle Finish & Evaluate
  const handleFinish = async () => {
    try {
      const evalRes = await fetch("http://127.0.0.1:8000/scoring/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const final = await (evalRes.ok ? evalRes.json() : null);

      // Redirect ke halaman hasil
      if (final) {
        router.push({
          pathname: "/results",
          query: { session_id: sessionId, result: JSON.stringify(final) },
        }, "/results"); // Masking URL agar bersih
      } else {
        // Fallback jika evaluasi gagal tapi submit sukses
        router.push(`/results?session_id=${sessionId}`);
      }
    } catch (err) {
      console.error("Evaluasi gagal:", err);
      // Tetap paksa pindah ke result agar user tidak stuck
      router.push(`/results?session_id=${sessionId}`);
    }
  };

  // --- RENDERING ---

  // Tampilan Loading Awal
  if (loading) {
    return (
      <Layout title="Menyiapkan Sesi...">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-semibold text-primary">Menghubungi AI Coach...</h2>
          <p className="text-text-sub mt-2">Sedang menyusun pertanyaan spesifik untuk role Anda.</p>
        </div>
      </Layout>
    );
  }

  // Tampilan Error
  if (error && questions.length === 0) {
    return (
      <Layout title="Error">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-md text-center">
            <h3 className="font-bold text-lg mb-2">Terjadi Kesalahan</h3>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => router.reload()} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  return (
    <Layout title={`Pertanyaan ${currentIndex + 1} - AI Interview`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Layout Grid 2 Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* KOLOM KIRI: Konteks & Pertanyaan (Sticky pada Desktop) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
            
            {/* Kartu Progress Minimalis */}
            <div className="bg-surface p-6 rounded-2xl shadow-soft border border-gray-100">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Progres Sesi
                </span>
                <span className="text-sm font-medium text-text-sub">
                  {currentIndex + 1} <span className="text-gray-300">/</span> {questions.length}
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-secondary h-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Kartu Pertanyaan */}
            <div className="animate-slide-up">
              <h2 className="text-3xl font-bold text-primary leading-tight mb-4">
                {currentQuestion}
              </h2>
              <div className="bg-accent/50 p-4 rounded-xl border border-teal-100">
                <p className="text-sm text-text-sub flex gap-2">
                  <span className="text-xl">💡</span>
                  <span>
                    <strong>Tips Coach:</strong> Jawablah dengan spesifik. Gunakan contoh nyata dari pengalaman Anda (Metode STAR: Situation, Task, Action, Result).
                  </span>
                </p>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN: Area Jawaban */}
          <div className="lg:col-span-8 animate-fade-in animation-delay-200">
            <div className="bg-surface p-1 rounded-2xl shadow-card border border-gray-100">
              <div className="relative">
                <textarea
                  className="w-full min-h-[400px] p-6 lg:p-8 rounded-xl text-lg text-text-main placeholder-gray-300 bg-transparent focus:outline-none resize-none leading-relaxed"
                  placeholder="Mulai ketik jawaban Anda di sini..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  autoFocus
                />
                
                {/* Status Focus Indicator (Garis bawah halus) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>
              </div>

              {/* Action Bar Bawah */}
              <div className="bg-gray-50/50 p-4 rounded-b-xl border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-text-muted hidden sm:block pl-2">
                  {answer.length > 0 ? `${answer.length} karakter` : "Menunggu input..."}
                </span>
                
                <div className="flex gap-4 w-full sm:w-auto">
                   {/* Tombol Error Reset (jika ada error submit) */}
                   {error && (
                    <span className="text-sm text-red-500 flex items-center mr-auto sm:mr-0">
                      ⚠️ Gagal kirim
                    </span>
                   )}
                   
                   <Button 
                    variant="primary" 
                    onClick={handleNext}
                    disabled={submitting || !answer.trim()}
                    isLoading={submitting}
                    className="w-full sm:w-auto px-8"
                   >
                     {currentIndex + 1 === questions.length ? "Selesaikan Sesi" : "Kirim Jawaban"}
                   </Button>
                </div>
              </div>
            </div>
            
            <p className="text-center text-xs text-text-muted mt-6">
              Tekan <kbd className="font-sans bg-gray-100 px-1 rounded border border-gray-200">Enter</kbd> untuk baris baru. Jawaban akan dianalisis secara otomatis.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
}