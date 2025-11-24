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
        setHistoryList(Array.isArray(data) ? data : []);
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


// import Card from "../components/ui/Card";

// export default function History({ history = [] }) {
//   return (
//     <div className="min-h-screen px-6 py-10">
//       <h1 className="text-3xl font-bold mb-8">Riwayat Wawancara</h1>

//       <div className="grid gap-6 max-w-2xl mx-auto">
//         {history.map((h, i) => (
//           <Card key={i}>
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-white font-semibold">
//                   Score: {h.overall_score}/100
//                 </p>
//                 <p className="text-gray-400 text-sm">
//                   {h.meta?.date || "Tidak ada tanggal"}
//                 </p>
//               </div>

//               <a
//                 href={`/history/${h.session_id}`}
//                 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
//               >
//                 Lihat Detail
//               </a>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }
