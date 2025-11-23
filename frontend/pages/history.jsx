import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";

export default function HistoryPage() {
  const { getHistory } = useApi();

  const [historyList, setHistoryList] = useState([]);
  const [error, setError] = useState("");

  // Load history file
  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("http://127.0.0.1:8000/history/all");
        const data = await response.json();
        setHistoryList(data.history || []);
      } catch (err) {
        setError("Gagal memuat history");
      }
    }
    loadHistory();
  }, []);

  return (
    <div style={styles.container}>
      <h1>Riwayat Wawancara</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {historyList.length === 0 ? (
        <p style={{ marginTop: 20 }}>Belum ada riwayat wawancara.</p>
      ) : (
        <div style={styles.list}>
          {historyList.map((item, index) => (
            <div key={index} style={styles.card}>
              <h3>{item.job_role} — {item.industry}</h3>
              <p><strong>Level:</strong> {item.experience_level}</p>
              <p><strong>Score:</strong> {item.overall_score}/100</p>
              <p><strong>Tanggal:</strong> {item.timestamp}</p>

              <button
                style={styles.button}
                onClick={() =>
                  alert(
                    "Untuk MVP: detail dapat dilihat saat evaluate. Next version bisa membuat halaman detail khusus."
                  )
                }
              >
                Lihat Detail
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    fontFamily: "sans-serif",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  card: {
    padding: "15px",
    borderRadius: "10px",
    background: "#fafafa",
    border: "1px solid #ddd",
  },
  button: {
    marginTop: "10px",
    padding: "10px",
    background: "#0066ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
