import { useEffect, ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = "AI Interview Coach" }: LayoutProps) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-text-main bg-background">
      <Navbar />
      <main className="flex-grow">
          {children}
      </main>
      <footer className="py-8 bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-text-sub text-sm">
                © {new Date().getFullYear()} AI Interview Coach. 
                <span className="mx-2 text-gray-300">|</span>
                Built for professional growth & privacy.
            </p>
        </div>
      </footer>
    </div>
  );
}