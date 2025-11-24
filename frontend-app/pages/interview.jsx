import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useApi } from "../hooks/useApi";

export default function InterviewPage() {
  const router = useRouter();
  const { submitAnswer, evaluateSession, loading } = useApi();

  const { session_id, questions } = router.query;

  // parse questions from query
  const parsedQuestions = questions ? JSON.parse(questions) : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState({}); // store all answers

  // Jika session_id atau questions belum ada (routing delay)
  useEffect(() => {
    if (!session_id || !questions) return;
  }, [session_id, questions]);

  async function handleNext() {
    if (!answer.trim()) {
      alert("Jawaban tidak boleh kosong.");
      return;
    }

    // Simpan jawaban sementara di state
    const newAnswers = { ...answers, [currentIndex]: answer };
    setAnswers(newAnswers);

    // Kirim jawaban ke backend
    await submitAnswer({
      session_id: session_id,
      question_index: currentIndex,
      answer: answer,
    });

    setAnswer("");

    // Jika masih ada pertanyaan berikutnya
    if (currentIndex < parsedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Jika pertanyaan terakhir → evaluate
      const result = await evaluateSession(session_id);

      router.push({
        pathname: "/results",
        query: {
          session_id: session_id,
          result: JSON.stringify(result),
        },
      });
    }
  }

  if (!session_id || parsedQuestions.length === 0) {
    return <p style={{ padding: 20 }}>Memuat interview...</p>;
  }

  return (
    <div style={styles.container}>
      <h2>Interview Session</h2>

      <div style={styles.card}>
        <p style={styles.question}>
          <strong>Pertanyaan {currentIndex + 1}:</strong> <br />
          {parsedQuestions[currentIndex]}
        </p>

        <textarea
          style={styles.textarea}
          placeholder="Tulis jawaban Anda..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <button onClick={handleNext} style={styles.button} disabled={loading}>
          {currentIndex === parsedQuestions.length - 1
            ? "Selesaikan & Evaluasi"
            : "Lanjut"}
        </button>
      </div>

      <p style={styles.progress}>
        Progress: {currentIndex + 1}/{parsedQuestions.length}
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "40px auto",
    fontFamily: "sans-serif",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    backgroundColor: "#fafafa",
  },
  question: {
    marginBottom: "12px",
    fontSize: "18px",
  },
  textarea: {
    width: "100%",
    height: "120px",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginBottom: "15px",
  },
  button: {
    padding: "12px",
    width: "100%",
    backgroundColor: "#0066ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  progress: {
    marginTop: "15px",
    textAlign: "center",
    color: "#555",
  },
};
