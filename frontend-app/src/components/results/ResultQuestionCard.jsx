import ReactMarkdown from "react-markdown";

export default function ResultQuestionCard({ item, index }) {
  // Helper warna skor per pertanyaan
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-100";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-100";
    return "text-amber-600 bg-amber-50 border-amber-100";
  };

  const scoreStyle = getScoreColor(item.similarity_score);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6 transition-all hover:shadow-md">
      
      {/* HEADER: Pertanyaan & Skor */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-start">
        <div className="flex-1">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">
            Pertanyaan {index + 1}
          </span>
          <h3 className="text-lg font-medium text-primary leading-snug">
            {item.question}
          </h3>
        </div>
        
        {/* Badge Skor */}
        <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${scoreStyle}`}>
          <span className="text-xs font-bold uppercase opacity-80">Relevansi</span>
          <span className="text-2xl font-bold">{item.similarity_score}%</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: Jawaban User & Keywords */}
        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-text-muted uppercase mb-2 block">Jawaban Anda</label>
            <div className="bg-gray-50 p-4 rounded-xl text-text-sub text-sm italic border border-gray-100 leading-relaxed">
              "{item.user_answer || "Tidak ada jawaban"}"
            </div>
          </div>

          {/* Analisis Keyword (Visual Pills) */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-green-600 flex items-center gap-1 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Kata Kunci Terdeteksi
              </p>
              <div className="flex flex-wrap gap-2">
                {item.keywords?.user_keywords?.length > 0 ? (
                  item.keywords.user_keywords.map((k, i) => (
                    <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-100">
                      {k}
                    </span>
                  ))
                ) : <span className="text-xs text-gray-400 italic">Tidak ada keyword relevan.</span>}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-red-500 flex items-center gap-1 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Kata Kunci Hilang
              </p>
              <div className="flex flex-wrap gap-2">
                {item.keywords?.missing_keywords?.length > 0 ? (
                  item.keywords.missing_keywords.slice(0, 5).map((k, i) => (
                    <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-md border border-red-100 opacity-80">
                      {k}
                    </span>
                  ))
                ) : <span className="text-xs text-green-600">Lengkap!</span>}
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Feedback AI */}
        <div className="bg-accent/30 rounded-xl p-5 border border-secondary/10 relative">
          {/* Label Coach */}
          <div className="absolute -top-3 left-4 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
            AI Coach Feedback
          </div>

          <div className="mt-2 prose prose-sm prose-slate max-w-none">
            {/* Render Markdown dari Backend */}
            <ReactMarkdown 
                components={{
                    strong: ({node, ...props}) => <span className="font-bold text-primary" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 space-y-1 text-text-sub" {...props} />,
                    li: ({node, ...props}) => <li className="text-sm" {...props} />,
                    p: ({node, ...props}) => <p className="text-sm leading-relaxed mb-3 text-text-main" {...props} />,
                    blockquote: ({node, ...props}) => <div className="bg-white border-l-4 border-secondary p-3 rounded-r-lg shadow-sm italic text-primary my-4" {...props} />
                }}
            >
                {item.feedback}
            </ReactMarkdown>
          </div>
        </div>

      </div>
    </div>
  );
}