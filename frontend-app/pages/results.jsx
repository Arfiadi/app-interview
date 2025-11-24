import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

export default function ResultsPage() {
  const router = useRouter();
  const { saveHistory } = useApi();

  const { session_id, result } = router.query;

  const [data, setData] = useState(null);
  const [saved, setSaved] = useState(false);

  // Parse data dari query
  useEffect(() => {
    if (result) {
      try {
        setData(JSON.parse(result));
      } catch (err) {
        console.error("Parse error:", err);
      }
    }
  }, [result]);

  // Auto save history
  useEffect(() => {
    if (session_id && !saved) {
      saveHistory(session_id)
        .then(() => setSaved(true))
        .catch(() => console.warn("Auto-save gagal"));
    }
  }, [session_id, saved]);

  if (!data) {
    return <p className="p-6 text-center">Memuat hasil wawancara...</p>;
  }

  const { overall_score, results } = data;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Hasil Wawancara
        </h1>

        {/* SCORE CARD */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold">Skor Akhir</h2>

          <p className="text-5xl font-bold text-blue-600 mt-2">
            {overall_score}/100
          </p>

          <div className="w-full h-4 bg-gray-200 rounded-full mt-4">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${overall_score}%` }}
            />
          </div>

          {saved && (
            <p className="text-green-600 text-sm mt-2">
              ✔ History tersimpan otomatis
            </p>
          )}
        </div>

        {/* PER-QUESTION DETAIL */}
        <h2 className="text-xl font-semibold mb-3">Detail Jawaban</h2>

        {results.map((item, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 mb-5 bg-gray-50 shadow-sm"
          >
            <p className="font-semibold">
              Pertanyaan {i + 1}: <span className="font-normal">{item.question}</span>
            </p>

            <p className="mt-2">
              <span className="font-semibold">Jawaban Anda:</span>{" "}
              {item.user_answer}
            </p>

            <div className="mt-3">
              <p className="font-semibold">
                Skor Similarity: {item.similarity_score}
              </p>
              <div className="w-full h-2 bg-gray-300 rounded-full mt-1">
                <div
                  className="h-full bg-green-600 rounded-full"
                  style={{ width: `${item.similarity_score}%` }}
                />
              </div>
            </div>

            {/* KEYWORDS */}
            <div className="mt-3 text-sm">
              <p><strong>Kata Kunci Ideal:</strong> {item.keywords.ideal_keywords.join(", ")}</p>
              <p><strong>Kata Kunci Anda:</strong> {item.keywords.user_keywords.join(", ")}</p>
              <p><strong>Kata Kunci Kurang:</strong> {item.keywords.missing_keywords.join(", ")}</p>
            </div>

            {/* TOPICS */}
            <div className="mt-3 text-sm">
              <p><strong>Topik Diharapkan:</strong> {item.topics.expected_topics.join(", ")}</p>
              <p><strong>Topik Masuk:</strong> {item.topics.covered_topics.join(", ") || "-"}</p>
              <p><strong>Topik Hilang:</strong> {item.topics.missing_topics.join(", ")}</p>
            </div>

            <p className="mt-3 text-sm">
              <strong>Feedback AI:</strong> <br />
              {item.feedback}
            </p>
          </div>
        ))}

        {/* BUTTONS */}
        <div className="flex flex-col gap-3 mt-8">
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            onClick={() => router.push("/pre-interview")}
          >
            Mulai Wawancara Baru
          </button>

          <button
            className="w-full bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
            onClick={() => router.push("/history")}
          >
            Lihat History
          </button>
        </div>
      </div>
    </div>
  );
}
