// frontend-app/pages/interview.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function InterviewPage() {
  const router = useRouter();
  // accept either names: job or job_role ; level or experience_level
  const jobFromQuery = router.query.job || router.query.job_role || "";
  const levelFromQuery = router.query.level || router.query.experience_level || "";
  const industryFromQuery = router.query.industry || "";

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load questions when query available
  useEffect(() => {
    if (!jobFromQuery || !levelFromQuery || !industryFromQuery) {
      // no params yet
      return;
    }

    async function loadQuestions() {
      setLoading(true);
      setError("");
      try {
        // Use keys backend expects: job_role and experience_level
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
          throw new Error(`Generate failed: ${res.status} ${text}`);
        }

        const data = await res.json();

        // Basic checks
        if (!data.session_id || !Array.isArray(data.questions)) {
          throw new Error("Invalid response from server: missing session_id or questions");
        }

        setQuestions(data.questions);
        setSessionId(data.session_id);
        setCurrentIndex(0);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat pertanyaan. Cek server.");
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [jobFromQuery, levelFromQuery, industryFromQuery]);

  // Next / submit answer
  const handleNext = async () => {
    // validation
    if (!sessionId) {
      alert("Session belum tersedia.");
      return;
    }

    // optional: allow empty answer but you can require
    setSubmitting(true);
    setError("");

    try {
      // backend expects session_id, question_index, answer
      const body = {
        session_id: sessionId,
        question_index: currentIndex,
        answer: answer || ""
      };

      const res = await fetch("http://127.0.0.1:8000/scoring/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Submit failed: ${res.status} ${text}`);
      }

      // clear answer for next question
      setAnswer("");

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // all done → evaluate & go to results
        // call evaluate endpoint (optional synchronous)
        const evalRes = await fetch("http://127.0.0.1:8000/scoring/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!evalRes.ok) {
          console.warn("Evaluate returned not ok", evalRes.status);
        }
        const final = await (evalRes.ok ? evalRes.json() : Promise.resolve(null));

        // Navigate to results page. Pass result JSON as query if small; or just pass session_id and fetch from backend results/history page.
        if (final) {
          router.push({
            pathname: "/results",
            query: { session_id: sessionId, result: JSON.stringify(final) },
          });
        } else {
          router.push(`/results?session_id=${sessionId}`);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Gagal mengirim jawaban. Cek server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Memuat pertanyaan...
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Tidak ada pertanyaan. Pastikan parameter job/level/industry benar dan backend berjalan.
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl text-center">
        <h2 className="text-xl font-semibold mb-3">
          Pertanyaan {currentIndex + 1}
        </h2>

        <p className="text-gray-400 mb-6">
          {currentQuestion}
        </p>

        <textarea
          className="w-full bg-[#222] border border-[#333] rounded-lg p-4 min-h-[150px] text-white"
          placeholder="Tulis jawaban Anda..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <Button
          className="mt-6 w-full"
          onClick={handleNext}
          disabled={submitting}
        >
          {submitting ? "Mengirim..." : (currentIndex + 1 === questions.length ? "Selesaikan" : "Lanjut")}
        </Button>

        <p className="text-gray-500 text-sm mt-4">
          Progress: {currentIndex + 1}/{questions.length}
        </p>
      </Card>
    </div>
  );
}
