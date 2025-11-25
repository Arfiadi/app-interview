import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

// Hook ini mengelola seluruh logika sesi wawancara
export function useInterviewSession() {
  const router = useRouter();
  
  // Ambil params dari URL
  // 'n' adalah parameter untuk jumlah pertanyaan (num_questions)
  const { job, job_role, level, experience_level, industry, n } = router.query;
  
  // Normalisasi parameter agar konsisten
  const jobQuery = job || job_role || "";
  const levelQuery = level || experience_level || "";
  const industryQuery = industry || "";

  // --- Core State (Status Sesi) ---
  const [status, setStatus] = useState("idle"); // idle, loading, ready, error
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // --- Feature State: Timer & Voice ---
  const [timer, setTimer] = useState(0); // Timer dalam detik
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // 1. INITIALIZE SESSION (Saat halaman dimuat)
  useEffect(() => {
    // Tunggu sampai router siap membaca URL query
    if (!router.isReady) return;
    
    // Validasi parameter wajib
    if (!jobQuery || !levelQuery) {
        setStatus("error");
        setErrorMsg("Parameter sesi tidak lengkap (Role/Level hilang).");
        return;
    }

    async function initSession() {
      setStatus("loading");
      try {
        // Parse jumlah pertanyaan dari URL (default: 5)
        let numQ = 5;
        if (n) {
           // Kadang formatnya "5 (Default)", jadi kita ambil angka depannya saja
           const parsed = parseInt(n);
           if (!isNaN(parsed)) numQ = parsed;
        }

        // Payload untuk dikirim ke Backend via Next.js API Route
        const payload = { 
            job_role: jobQuery, 
            experience_level: levelQuery, 
            industry: industryQuery, 
            num_questions: numQ // <-- Menggunakan jumlah pertanyaan dinamis
        };
        
        // Panggil API Route Next.js (bukan Python langsung)
        const res = await fetch("/api/interview/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Gagal menghubungi AI Coach.");
        const data = await res.json();
        
        // Simpan data sesi ke state
        setQuestions(data.questions);
        setSessionId(data.session_id);
        setStatus("ready");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err.message);
      }
    }

    // Hindari pemanggilan ganda (double-fetch) di React Strict Mode
    if (status === 'idle') initSession();
    
  }, [router.isReady, jobQuery, levelQuery, industryQuery, n]); // Dependency array

  // 2. TIMER LOGIC
  useEffect(() => {
    let interval;
    if (status === "ready") {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // 3. VOICE RECOGNITION LOGIC (Web Speech API)
  useEffect(() => {
    if (typeof window !== "undefined") {
        const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (Speech) {
            const recognition = new Speech();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "id-ID"; // Set bahasa ke Indonesia
            
            recognition.onresult = (e) => {
                // Hanya ambil hasil final untuk menghindari duplikasi teks
                if (e.results[0].isFinal) {
                    setAnswer(prev => (prev ? prev + " " : "") + e.results[0][0].transcript);
                }
            };
            recognitionRef.current = recognition;
        }
    }
  }, []);

  const toggleVoice = () => {
      if (!recognitionRef.current) return alert("Browser ini tidak mendukung fitur Voice-to-Text.");
      
      if (isRecording) {
          recognitionRef.current.stop();
          setIsRecording(false);
      } else {
          recognitionRef.current.start();
          setIsRecording(true);
      }
  };

  // 4. SUBMIT ANSWER LOGIC
  const submitAnswer = async () => {
      if (!sessionId) return;
      setIsSubmitting(true);
      
      // Matikan rekaman suara otomatis jika masih aktif
      if (isRecording) toggleVoice();

      try {
          // Kirim jawaban ke API
          await fetch("/api/scoring/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  session_id: sessionId,
                  question_index: currentIndex,
                  answer: answer || "Tidak ada jawaban"
              })
          });

          // Reset input dan pindah ke pertanyaan berikutnya
          setAnswer("");
          if (currentIndex + 1 < questions.length) {
              setCurrentIndex(p => p + 1);
          } else {
              // Jika pertanyaan sudah habis, selesaikan sesi
              await finishSession();
          }
      } catch (e) {
          alert("Gagal mengirim jawaban. Coba lagi.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const finishSession = async () => {
      try {
        // Trigger evaluasi akhir di backend
        const res = await fetch("/api/scoring/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId })
        });
        const result = await res.json();
        
        // Redirect ke halaman Results dengan membawa data hasil
        router.push({
            pathname: "/results",
            query: { session_id: sessionId, result: JSON.stringify(result) }
        }, "/results");
      } catch(e) {
          // Fallback: tetap pindah halaman jika evaluasi gagal (agar user tidak stuck)
          router.push(`/results?session_id=${sessionId}`);
      }
  };

  // Expose data dan fungsi agar bisa dipakai di UI Component
  return {
      status, errorMsg,
      questions, currentQuestion: questions[currentIndex], currentIndex,
      answer, setAnswer,
      submitAnswer, isSubmitting,
      timer,
      isRecording, toggleVoice
  };
}