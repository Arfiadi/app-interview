import ReactMarkdown from "react-markdown";

export default function ResultQuestionCard({ item, index }) {
  // Helper warna skor untuk memberikan indikasi visual cepat
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-700 bg-blue-50 border-blue-200";
    return "text-amber-700 bg-amber-50 border-amber-200";
  };

  const scoreStyle = getScoreColor(item.similarity_score);

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden transition-all hover:shadow-lg group">
      
      {/* HEADER PERTANYAAN (Full Width) */}
      <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
        <div className="flex justify-between items-start gap-4 mb-3">
            <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wide border border-primary/10">
                Pertanyaan {index + 1}
            </span>
            {/* Badge Skor Relevansi */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${scoreStyle}`}>
                <span className="text-[10px] font-bold uppercase opacity-70">Relevansi</span>
                <span className="text-sm font-extrabold">{item.similarity_score}%</span>
            </div>
        </div>
        <h3 className="text-lg md:text-xl font-medium text-primary leading-relaxed">
            {item.question}
        </h3>
      </div>

      {/* BODY: Grid Layout (Kiri: Jawaban User, Kanan: Feedback AI) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        
        {/* KOLOM KIRI: Jawaban User (Data Mentah) */}
        <div className="p-6 md:p-8 flex flex-col h-full bg-white">
          <div className="mb-6">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              Jawaban Anda
            </label>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-text-main text-sm md:text-base leading-relaxed italic whitespace-pre-wrap min-h-[100px]">
              "{item.user_answer || "Tidak ada jawaban"}"
            </div>
          </div>

          {/* Analisis Keywords (Pills) */}
          <div className="mt-auto pt-4 border-t border-gray-50 space-y-4">
             {/* Poin Tercover */}
             <div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-700 uppercase mb-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Kata Kunci Terdeteksi
                </span>
                <div className="flex flex-wrap gap-2">
                    {item.keywords?.user_keywords?.length > 0 ? (
                        item.keywords.user_keywords.map((k, i) => (
                            <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-100 shadow-sm">{k}</span>
                        ))
                    ) : <span className="text-xs text-text-muted italic">Tidak ada poin kunci terdeteksi.</span>}
                </div>
             </div>
             
             {/* Poin Hilang */}
             <div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 uppercase mb-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    Kata Kunci Hilang
                </span>
                <div className="flex flex-wrap gap-2">
                    {item.keywords?.missing_keywords?.length > 0 ? (
                        item.keywords.missing_keywords.slice(0, 5).map((k, i) => (
                            <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-md border border-red-100 shadow-sm opacity-90">{k}</span>
                        ))
                    ) : <span className="text-xs text-green-600 font-medium">Semua poin tercakup! 🎉</span>}
                </div>
             </div>
          </div>
        </div>

        {/* KOLOM KANAN: Feedback AI (Insight Cerdas) */}
        <div className="p-6 md:p-8 bg-accent/5 h-full relative overflow-hidden">
          
          {/* Dekorasi Background Halus */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

          <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
            <span className="bg-secondary text-white w-5 h-5 rounded flex items-center justify-center text-[10px]">AI</span>
            Coach Feedback
          </label>

          {/* Render Markdown dengan Styling Kustom */}
          <div className="prose prose-sm prose-slate max-w-none relative z-10">
            <ReactMarkdown 
                components={{
                    // Kustomisasi elemen Markdown agar sesuai desain
                    h3: ({node, ...props}) => <h3 className="text-sm font-bold text-primary mt-5 mb-2 uppercase tracking-wide border-b border-secondary/20 pb-1 inline-block" {...props} />,
                    strong: ({node, ...props}) => <span className="font-bold text-primary" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-none pl-0 space-y-2 my-3" {...props} />,
                    li: ({node, ...props}) => (
                        <li className="text-sm leading-relaxed flex gap-2 items-start text-text-sub" {...props}>
                            {/* Custom Bullet Point */}
                            <span className="text-secondary mt-1.5 w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0 block"></span>
                            <span>{props.children}</span>
                        </li>
                    ),
                    p: ({node, ...props}) => <p className="text-sm leading-relaxed mb-3 text-text-main" {...props} />,
                    blockquote: ({node, ...props}) => (
                        <div className="bg-white border-l-4 border-secondary p-4 rounded-r-xl shadow-sm text-primary my-5 relative group-hover:shadow-md transition-shadow">
                            <div className="absolute -top-2 -left-2 bg-secondary text-white w-6 h-6 flex items-center justify-center rounded-full border-2 border-white text-xs">💡</div>
                            <div className="text-sm italic pl-2">{props.children}</div>
                        </div>
                    )
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