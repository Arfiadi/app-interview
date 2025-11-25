import { useEffect } from "react";

/**
 * Layout Wrapper
 * Memastikan setiap halaman memiliki struktur header (logo) dan footer yang konsisten.
 */
export default function Layout({ children, title = "AI Interview Coach" }) {
  // Mengupdate judul tab browser
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-text-main bg-background">
      {/* Header Minimalis */}
      <header className="w-full bg-surface border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              AI
            </div>
            <span className="font-semibold text-primary tracking-tight text-lg">
              Interview<span className="text-secondary">Coach</span>
            </span>
          </div>

          {/* Status Kanan Atas */}
          <div className="text-sm text-text-sub hidden sm:block">
            Private Session
          </div>
        </div>
      </header>

      {/* Area Konten Utama */}
      <main className="flex-grow">
          {children}
      </main>

      {/* Footer Sederhana */}
      <footer className="py-6 text-center text-text-muted text-xs border-t border-gray-100 mt-auto">
        © {new Date().getFullYear()} AI Interview Coach. Built for professional growth.
      </footer>
    </div>
  );
}