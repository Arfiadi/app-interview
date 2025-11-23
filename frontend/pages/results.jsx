import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

export default function ResultsPage() {
  const router = useRouter();
  const { saveHistory } = useApi();

  const { session_id, result } = router.query;

  const [data, setData] = useState(null);

  useEffect(() => {
    if (result) {
      try {
        setData(JSON.parse(result));
      } catch (err) {
        console.error("Failed to parse result:", err);
      }
    }
  }, [result]);

  if (!data) {
    return <p style={{ padding: 20 }}>Memuat hasil wawancara...</p>;
  }

  const { overall_score, results } = data;

  async function handleSave() {
    try {
      await saveHistory(session_id);
      alert("Hasil interview disimpan ke history!");
    } catch (err) {
      alert("Gagal menyimpan history.");
    }
  }

  return (
    <div style={styles.container}>
      <h1>Hasil Wawancara</h1>

      {/* OVERALL SCORE */}
      <div style={styles.card}>
        <h2>Skor Akhir</h2>
        <p style={styles.bigScore}>{overall_score}/100</p>

        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${overall_score}%`,
            }}
          />
        </div>
      </div>

      {/* BREAKDOWN PER QUESTION */}
      <div style={styles.card}>
        <h2>Detail Penilaian</h2>
        {results.map((item, i) => (
          <div key={i} style={styles.questionBlock}>
            <p><strong>Pertanyaan {i + 1}:</strong> {item.question}</p>
            <p><strong>Jawaban Anda:</strong> {item.user_answer}</p>
            <p><strong>Skor Similarity:</strong> {item.similarity_score}</p>

            <div style={styles.progressBarSmall}>
              <div
                style={{
                  ...styles.progressFillSmall,
                  width: `${item.similarity_score}%`,
                }}
              />
            </div>

            {/* KEYWORD ANALYSIS */}
            <p><strong>Kata Kunci Ideal:</strong> {item.keywords.ideal_keywords.join(", ")}</p>
            <p><strong>Kata Kunci Anda:</strong> {item.keywords.user_keywords.join(", ")}</p>
            <p><strong>Kata Kunci Kurang:</strong> {item.keywords.missing_keywords.join(", ")}</p>

            {/* TOPIC */}
            <p><strong>Topik Diharapkan:</strong> {item.topics.expected_topics.join(", ")}</p>
            <p><strong>Topik Masuk:</strong> {item.topics.covered_topics.join(", ") || "-"}</p>
            <p><strong>Topik Hilang:</strong> {item.topics.missing_topics.join(", ")}</p>

            {/* FEEDBACK */}
            <p><strong>Feedback AI:</strong><br />{item.feedback}</p>

            <hr style={{ margin: "20px 0" }} />
          </div>
        ))}
      </div>

      {/* ACTION BUTTONS */}
      <div style={styles.buttonGroup}>
        <button style={styles.buttonPrimary} onClick={handleSave}>
          Simpan ke History
        </button>

        <button
          style={styles.buttonSecondary}
          onClick={() => router.push("/pre-interview")}
        >
          Mulai Wawancara Baru
        </button>

        <button
          style={styles.buttonSecondary}
          onClick={() => router.push("/history")}
        >
          Lihat History
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    fontFamily: "sans-serif",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    background: "#fafafa",
    marginBottom: "20px",
  },
  bigScore: {
    fontSize: "42px",
    margin: 0,
    color: "#0066ff",
  },
  progressBar: {
    width: "100%",
    height: "15px",
    background: "#eee",
    borderRadius: "10px",
    marginTop: "10px",
  },
  progressFill: {
    height: "100%",
    background: "#0066ff",
    borderRadius: "10px",
  },
  questionBlock: {
    marginBottom: "20px",
  },
  progressBarSmall: {
    width: "100%",
    height: "10px",
    background: "#eee",
    borderRadius: "10px",
    margin: "6px 0",
  },
  progressFillSmall: {
    height: "100%",
    background: "#00bb77",
    borderRadius: "10px",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  buttonPrimary: {
    padding: "12px",
    backgroundColor: "#0066ff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
  buttonSecondary: {
    padding: "12px",
    backgroundColor: "#ddd",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
};
