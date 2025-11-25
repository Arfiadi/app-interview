import Link from "next/link";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import UserMenu from "@/components/common/UserMenu"; // Import komponen baru
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth(); // Kita tidak butuh logout disini lagi, sudah di handle UserMenu

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
            
            {user && (
              <Link 
                href="/history" 
                className={`text-sm font-medium transition-colors ${isActive('/history') ? 'text-primary' : 'text-text-sub hover:text-primary'}`}
              >
                Riwayat
              </Link>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-4">
             
             {user ? (
               // TAMPILAN SUDAH LOGIN (Menggunakan UserMenu)
               <div className="flex items-center gap-3">
                 <Button 
                    variant="primary"
                    className="hidden sm:flex px-4 py-2 text-sm shadow-sm"
                    onClick={() => router.push('/pre-interview')}
                 >
                    + Sesi Baru
                 </Button>
                 
                 {/* Dropdown Menu Avatar */}
                 <UserMenu user={user} />
               </div>
             ) : (
               // TAMPILAN BELUM LOGIN
               <div className="flex items-center gap-3">
                 <Link 
                    href="/login"
                    className="text-sm font-medium text-text-main hover:text-primary transition-colors"
                 >
                   Masuk
                 </Link>
                 <Button 
                    variant="primary"
                    className="px-5 py-2 text-sm shadow-md shadow-primary/20"
                    onClick={() => router.push('/register')}
                 >
                    Daftar Gratis
                 </Button>
               </div>
             )}

          </div>

        </div>
      </div>
    </nav>
  );
}