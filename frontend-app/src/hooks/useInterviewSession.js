import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

export function useInterviewSession() {
  const router = useRouter();
  
  // Params URL
  const { job, job_role, level, experience_level, industry } = router.query;
  const jobQuery = job || job_role || "";
  const levelQuery = level || experience_level || "";
  const industryQuery = industry || "";

  // State
  const [status, setStatus] = useState("idle"); 
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Feature: Timer & Voice
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // 1. INITIALIZE SESSION (Via Next.js API)
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
        const payload = { 
            job_role: jobQuery, 
            experience_level: levelQuery, 
            industry: industryQuery, 
            num_questions: 5 
        };
        
        // UPDATE: Panggil relative path /api/...
        const res = await fetch("/api/interview/generate", {
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

  // 3. VOICE LOGIC
  useEffect(() => {
    if (typeof window !== "undefined") {
        const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (Speech) {
            const recognition = new Speech();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "id-ID";
            
            recognition.onresult = (e) => {
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

  // 4. SUBMIT ANSWER (Via Next.js API)
  const submitAnswer = async () => {
      if (!sessionId) return;
      setIsSubmitting(true);
      if (isRecording) toggleVoice();

      try {
          // UPDATE: Panggil API Next.js
          await fetch("/api/scoring/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
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
        // UPDATE: Panggil API Next.js
        const res = await fetch("/api/scoring/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId })
        });
        const result = await res.json();
        
        router.push({
            pathname: "/results",
            query: { session_id: sessionId, result: JSON.stringify(result) }
        }, "/results");
      } catch(e) {
          router.push(`/results?session_id=${sessionId}`);
      }
  };

  return {
      status, errorMsg,
      questions, currentQuestion: questions[currentIndex], currentIndex,
      answer, setAnswer,
      submitAnswer, isSubmitting,
      timer, isRecording, toggleVoice
  };
}