import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

export interface Question {
  id?: string;
  text: string;
  category?: string;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.token) {
          headers["Authorization"] = `Bearer ${parsed.token}`;
        }
      } catch (e) {}
    }
  }
  return headers;
}

export function useInterviewSession() {
  const router = useRouter();
  
  // Ambil params dari URL
  const { job, job_role, level, experience_level, industry, n } = router.query;
  
  const jobQuery = (job || job_role || "") as string;
  const levelQuery = (level || experience_level || "") as string;
  const industryQuery = (industry || "") as string;

  // State
  const [status, setStatus] = useState<string>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answer, setAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  
  // Features
  const [timer, setTimer] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // 1. INITIALIZE SESSION
  useEffect(() => {
    if (!router.isReady) return;
    
    if (!jobQuery || !levelQuery) {
        setStatus("error");
        setErrorMsg("Parameter sesi tidak lengkap.");
        return;
    }

    async function initSession() {
      setStatus("loading");
      try {
        let numQ = 5;
        if (n) {
           const cleanN = n.toString().replace(/\D/g, ''); 
           const parsed = parseInt(cleanN);
           if (!isNaN(parsed) && parsed >= 1 && parsed <= 15) {
               numQ = parsed;
           }
        }

        const payload = { 
            job_role: jobQuery, 
            experience_level: levelQuery, 
            industry: industryQuery, 
            num_questions: numQ
        };
        
        const res = await fetch("/api/interview/generate", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Gagal menghubungi AI Coach.");
        const data = await res.json();
        
        setQuestions(data.questions);
        setSessionId(data.session_id);
        setStatus("ready");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message);
      }
    }

    if (status === 'idle') initSession();
    
  }, [router.isReady, jobQuery, levelQuery, industryQuery, n]);

  // 2. TIMER
  useEffect(() => {
    let interval: any;
    if (status === "ready") {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // 3. VOICE
  useEffect(() => {
    if (typeof window !== "undefined") {
        const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (Speech) {
            const recognition = new Speech();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "id-ID";
            
            recognition.onresult = (e: any) => {
                if (e.results[0].isFinal) {
                    setAnswer(prev => (prev ? prev + " " : "") + e.results[0][0].transcript);
                }
            };
            recognitionRef.current = recognition;
        }
    }
  }, []);

  const toggleVoice = () => {
      if (!recognitionRef.current) return alert("Browser tidak support voice.");
      if (isRecording) {
          recognitionRef.current.stop();
          setIsRecording(false);
      } else {
          recognitionRef.current.start();
          setIsRecording(true);
      }
  };

  // 4. SUBMIT
  const submitAnswer = async () => {
      if (!sessionId) return;
      setIsSubmitting(true);
      if (isRecording) toggleVoice();

      try {
          await fetch("/api/scoring/submit", {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                  session_id: sessionId,
                  question_index: currentIndex,
                  answer: answer || "Tidak ada jawaban"
              })
          });

          setAnswer("");
          if (currentIndex + 1 < questions.length) {
              setCurrentIndex(p => p + 1);
          } else {
              await finishSession();
          }
      } catch (e) {
          alert("Gagal kirim jawaban");
      } finally {
          setIsSubmitting(false);
      }
  };

  const finishSession = async () => {
      try {
        const res = await fetch("/api/scoring/evaluate", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ session_id: sessionId })
        });
        await res.json();
        
        router.push(`/results?session_id=${sessionId}`);
      } catch(e) {
          router.push(`/results?session_id=${sessionId}`);
      }
  };

  return {
      status, errorMsg,
      questions, currentQuestion: questions[currentIndex], currentIndex,
      answer, setAnswer,
      submitAnswer, isSubmitting,
      timer,
      isRecording, toggleVoice
  };
}