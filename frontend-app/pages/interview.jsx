import Layout from "../components/Layout";
import Button from "../components/ui/Button";
// Import Komponen Modular Baru
import ProgressBar from "../components/interview/ProgressBar";
import QuestionCard from "../components/interview/QuestionCard";
import { useInterviewSession } from "../hooks/useInterviewSession";

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
      <Layout title="Menyiapkan Sesi...">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-semibold text-primary">Menghubungi AI Coach...</h2>
        </div>
      </Layout>
    );
  }

  if (status === "error") {
    return (
        <Layout title="Error">
            <div className="text-center py-20 text-red-500">
                {errorMsg || "Gagal memuat sesi."}
            </div>
        </Layout>
    );
  }

  // --- MAIN UI ---
  return (
    <Layout title={`Pertanyaan ${currentIndex + 1}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* KOLOM KIRI: Informasi & Konteks */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
            <ProgressBar 
                current={currentIndex + 1} 
                total={questions.length} 
                timerDisplay={formatTime(timer)}
                isRecording={isRecording}
            />
            
            <QuestionCard 
                question={currentQuestion} 
            />
          </div>

          {/* KOLOM KANAN: Input & Kontrol */}
          <div className="lg:col-span-8 animate-fade-in animation-delay-200">
            <div className="bg-surface p-1 rounded-2xl shadow-card border border-gray-100 relative group">
              <textarea
                className="w-full min-h-[400px] p-6 lg:p-8 rounded-xl text-lg text-text-main placeholder-gray-300 bg-transparent focus:outline-none resize-none leading-relaxed"
                placeholder="Ketik jawaban atau gunakan mikrofon..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                autoFocus
              />
              
              <button
                onClick={toggleVoice}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all border ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white text-gray-400 hover:text-primary"}`}
                title={isRecording ? "Stop Rekam" : "Mulai Rekam"}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </button>

              <div className="bg-gray-50/50 p-4 rounded-b-xl border-t border-gray-100 flex justify-end">
                 <Button 
                  onClick={submitAnswer}
                  disabled={isSubmitting || !answer.trim()}
                  isLoading={isSubmitting}
                  className="px-8"
                 >
                   {currentIndex + 1 === questions.length ? "Selesaikan" : "Kirim Jawaban"}
                 </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}