import ProtectedRoute from "@/components/auth/ProtectedRoute"; // Import Satpam
import Layout from "@/components/common/Layout";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/interview/ProgressBar";
import QuestionCard from "@/components/interview/QuestionCard";
import { useInterviewSession } from "@/hooks/useInterviewSession";

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};

export default function InterviewPage() {
  const {
      status, errorMsg,
      questions, currentQuestion, currentIndex,
      answer, setAnswer,
      submitAnswer, isSubmitting,
      timer,
      isRecording, toggleVoice
  } = useInterviewSession();

  // --- LOADING & ERROR STATES ---
  if (status === "loading" || status === "idle") {
    return (
      <ProtectedRoute>
        <Layout title="Menyiapkan Sesi...">
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <div className="w-12 h-12 border-[3px] border-gray-200 border-t-primary rounded-full animate-spin mb-6"></div>
            <h2 className="text-lg font-semibold text-primary">Menghubungi AI Coach...</h2>
            <p className="text-sm text-text-sub mt-2">Menganalisis profil Anda.</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (status === "error") {
    return (
      <ProtectedRoute>
        <Layout title="Error">
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <p className="text-red-500 mb-4">{errorMsg || "Gagal memuat sesi."}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Muat Ulang</Button>
            </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // --- MAIN UI ---
  return (
    <ProtectedRoute>
      <Layout title={`Sesi Interview • Soal ${currentIndex + 1}`}>
        
        <div className="fixed inset-0 bg-gray-50/30 -z-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.4 }}>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          
          <div className="max-w-5xl mx-auto mb-10">
              <ProgressBar 
                  current={currentIndex + 1} 
                  total={questions.length} 
                  timerDisplay={formatTime(timer)}
                  isRecording={isRecording}
              />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            <div className="lg:col-span-4 lg:sticky lg:top-24 order-1 space-y-6">
              <QuestionCard question={currentQuestion} />
            </div>

            <div className="lg:col-span-8 order-2 animate-fade-in animation-delay-100">
              <div className="bg-white p-1 rounded-2xl shadow-card border border-gray-200 relative group transition-all focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30">
                
                <div className="px-6 pt-4 pb-3 flex justify-between items-center border-b border-gray-50 bg-gray-50/30 rounded-t-xl">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Area Jawaban Anda</span>
                  </div>
                  {isRecording && (
                      <span className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                          ● Merekam Suara...
                      </span>
                  )}
                </div>

                <textarea
                  className="w-full min-h-[450px] p-6 text-lg text-text-main placeholder-gray-300 bg-transparent focus:outline-none resize-none leading-relaxed font-sans"
                  placeholder="Ketik jawaban Anda di sini secara mendetail..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  autoFocus
                />
                
                <button
                  onClick={toggleVoice}
                  className={`absolute bottom-24 right-6 p-4 rounded-full shadow-lg transition-all duration-300 border z-10 ${isRecording ? "bg-red-500 text-white border-red-600 scale-110 ring-4 ring-red-100" : "bg-white text-text-sub border-gray-200 hover:border-primary hover:text-primary hover:scale-105"}`}
                  title="Rekam Suara"
                >
                  <svg className={`w-6 h-6 ${isRecording ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                </button>

                <div className="bg-gray-50/50 p-4 rounded-b-2xl border-t border-gray-100 flex justify-between items-center">
                   <span className="text-xs text-text-muted pl-2 font-mono">
                      {answer.length} karakter
                   </span>
                   <Button 
                    onClick={submitAnswer}
                    disabled={isSubmitting || !answer.trim()}
                    isLoading={isSubmitting}
                    className="px-8 py-2.5 text-sm shadow-md w-full sm:w-auto"
                   >
                     {currentIndex + 1 === questions.length ? "Selesaikan Sesi" : "Kirim Jawaban"}
                   </Button>
                </div>
              </div>
              
              <p className="text-center text-xs text-text-muted mt-4 opacity-60">
                 Jawaban Anda akan disimpan secara otomatis.
              </p>
            </div>

          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}