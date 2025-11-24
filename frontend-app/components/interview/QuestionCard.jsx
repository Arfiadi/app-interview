/**
 * Komponen untuk menampilkan kartu pertanyaan aktif.
 * Lokasi: frontend/components/interview/QuestionCard.jsx
 */
export default function QuestionCard({ question }) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-bold text-primary leading-tight mb-4">
        {question}
      </h2>
      
      {/* Tips Box */}
      <div className="bg-accent/50 p-4 rounded-xl border border-teal-100">
        <p className="text-sm text-text-sub">
          💡 <strong>Tips:</strong> Gunakan metode STAR (Situation, Task, Action, Result) untuk struktur jawaban yang kuat.
        </p>
      </div>
    </div>
  );
}