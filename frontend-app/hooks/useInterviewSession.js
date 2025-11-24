import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

// Hook ini mengelola seluruh logika sesi wawancara
export function useInterviewSession() {
  const router = useRouter();
  
  // Ambil params dari URL
  const { job, job_role, level, experience_level, industry } = router.query;
  const jobQuery = job || job_role || "";
  const levelQuery = level || experience_level || "";
  const industryQuery = industry || "";

  // State Manajemen
  const [status, setStatus] = useState("idle"); // idle, loading, ready, error
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Fitur Tambahan: Timer & Voice
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // 1. INITIALIZE SESSION
  useEffect(() => {
    if (!router.isReady) return;
    
    // Validasi parameter
    if (!jobQuery || !levelQuery) {
        setStatus("error");
        setErrorMsg("Parameter sesi tidak lengkap (Role/Level hilang).");
        return;
    }

    async function initSession() {
      setStatus("loading");
      try {
        const payload = { 
            job_role: jobQuery, 
            experience_level: levelQuery, 
            industry: industryQuery, 
            num_questions: 5 
        };
        
        // Panggil Backend
        // Note: Pastikan URL backend sesuai env
        const res = await fetch("http://127.0.0.1:8000/interview/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Gagal menghubungi AI Coach.");
        const data = await res.json();
        
        setQuestions(data.questions);
        setSessionId(data.session_id);
        setStatus("ready");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err.message);
      }
    }

    // Hindari double-fetch di React Strict Mode
    if (status === 'idle') initSession();
    
  }, [router.isReady, jobQuery, levelQuery, industryQuery]);

  // 2. TIMER LOGIC
  useEffect(() => {
    let interval;
    if (status === "ready") {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // 3. VOICE RECOGNITION LOGIC
  useEffect(() => {
    if (typeof window !== "undefined") {
        const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (Speech) {
            const recognition = new Speech();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "id-ID"; // Bahasa Indonesia
            
            recognition.onresult = (e) => {
                // Ambil hasil final saja untuk ditambahkan ke text area
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
      
      // Auto-stop recording jika sedang merekam
      if (isRecording) toggleVoice();

      try {
          await fetch("http://127.0.0.1:8000/scoring/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  session_id: sessionId,
                  question_index: currentIndex,
                  answer: answer || "Tidak ada jawaban"
              })
          });

          // Reset input dan pindah pertanyaan
          setAnswer("");
          if (currentIndex + 1 < questions.length) {
              setCurrentIndex(p => p + 1);
          } else {
              // Jika pertanyaan habis, selesaikan sesi
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
        // Trigger evaluasi di backend
        const res = await fetch("http://127.0.0.1:8000/scoring/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId })
        });
        const result = await res.json();
        
        // Pindah ke halaman Result
        router.push({
            pathname: "/results",
            query: { session_id: sessionId, result: JSON.stringify(result) }
        }, "/results");
      } catch(e) {
          // Fallback jika error, tetap pindah agar user tidak stuck
          router.push(`/results?session_id=${sessionId}`);
      }
  };

  // Expose data dan function yang dibutuhkan UI
  return {
      status, errorMsg,
      questions, currentQuestion: questions[currentIndex], currentIndex,
      answer, setAnswer,
      submitAnswer, isSubmitting,
      timer,
      isRecording, toggleVoice
  };
}