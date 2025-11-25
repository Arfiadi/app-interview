import Link from "next/link";
import { useRouter } from "next/router";
// PERBAIKAN DI SINI: Gunakan alias @ untuk menunjuk ke src/components/ui
import Button from "@/components/ui/Button"; 

export default function Navbar() {
  const router = useRouter();

  // Helper untuk mengecek link aktif
  const isActive = (path) => router.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
              AI
            </div>
            <span className="font-semibold text-primary tracking-tight text-lg">
              Interview<span className="text-secondary">Coach</span>
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-text-sub hover:text-primary'}`}
            >
              Beranda
            </Link>
            <Link 
              href="/history" 
              className={`text-sm font-medium transition-colors ${isActive('/history') ? 'text-primary' : 'text-text-sub hover:text-primary'}`}
            >
              Riwayat Saya
            </Link>
            <Link 
                href="/about"
                className="text-sm font-medium text-text-sub hover:text-primary transition-colors"
                onClick={(e) => { e.preventDefault(); alert("Fitur 'Tentang Kami' akan segera hadir!"); }}
            >
                Tentang
            </Link>
          </div>

          {/* ACTION BUTTON */}
          <div className="flex items-center gap-3">
             <div className="md:hidden">
                {/* Mobile menu placeholder */}
             </div>
             
             <Button 
                variant={router.pathname === '/pre-interview' ? 'outline' : 'primary'}
                className="px-5 py-2 text-sm"
                onClick={() => router.push('/pre-interview')}
             >
                + Sesi Baru
             </Button>
          </div>

        </div>
      </div>
    </nav>
  );
}