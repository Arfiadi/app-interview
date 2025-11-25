/**
 * Komponen Kartu Pertanyaan dengan Tampilan "Chat Stream" yang Lebih Rapi
 */
export default function QuestionCard({ question }) {
  return (
    <div className="animate-slide-up flex gap-4 items-start">
      
      {/* 1. Avatar (Di Samping Kiri) */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md ring-4 ring-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
      </div>

      {/* 2. Area Konten (Nama & Bubble) */}
      <div className="flex-1 min-w-0">
        
        {/* Label Nama */}
        <div className="flex items-center gap-2 mb-1 ml-1">
          <span className="text-xs font-bold text-primary tracking-wide">AI COACH</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100">Bot</span>
          <span className="text-[10px] text-text-muted">• Baru saja</span>
        </div>

        {/* Bubble Pertanyaan */}
        <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 relative group hover:border-primary/20 transition-colors duration-300">
          
          {/* Teks Pertanyaan (Ukuran Font Diperkecil agar Elegan) */}
          <h2 className="text-lg md:text-xl font-normal text-text-main leading-relaxed tracking-tight">
            {question}
          </h2>
          
          {/* Dekorasi Segitiga Kecil (Arrow) */}
          <div className="absolute top-[12px] left-[-6px] w-3 h-3 bg-white border-t border-l border-gray-200 transform -rotate-45"></div>
        </div>
        
        {/* Tips Box (Lebih Compact) */}
        <div className="mt-3 ml-1 flex gap-2 items-start opacity-80 hover:opacity-100 transition-opacity">
          <span className="text-sm flex-shrink-0">💡</span>
          <p className="text-xs md:text-sm text-text-sub leading-snug pt-0.5">
            <span className="font-semibold text-secondary">Pro Tip:</span> Gunakan metode STAR (Situation, Task, Action, Result) agar jawaban terstruktur.
          </p>
        </div>

      </div>
    </div>
  );
}