import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function UserMenu({ user }) {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Tutup menu jika klik di luar area
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ambil inisial nama untuk avatar
  const initials = user?.username 
    ? user.username.slice(0, 2).toUpperCase() 
    : "ME";

  return (
    <div className="relative" ref={menuRef}>
      
      {/* Trigger Button (Avatar) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 pl-3 pr-1 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 group"
      >
        <span className="text-sm font-medium text-text-sub group-hover:text-primary hidden sm:block">
          {user.username}
        </span>
        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
          {initials}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
          
          {/* User Info (Mobile Only Header) */}
          <div className="px-4 py-3 border-b border-gray-50 sm:hidden">
            <p className="text-sm font-bold text-primary">{user.username}</p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>

          {/* Menu Links */}
          <Link 
            href="/dashboard" 
            className="block px-4 py-2 text-sm text-text-sub hover:bg-gray-50 hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            Dashboard Saya
          </Link>
          
          <Link 
            href="/history" 
            className="block px-4 py-2 text-sm text-text-sub hover:bg-gray-50 hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            Riwayat Interview
          </Link>
          
          <Link 
            href="/settings" 
            className="block px-4 py-2 text-sm text-text-sub hover:bg-gray-50 hover:text-primary"
            onClick={() => setIsOpen(false)}
          >
            Pengaturan Akun
          </Link>

          <div className="h-px bg-gray-100 my-2"></div>

          {/* Logout */}
          <button
            onClick={() => {
                setIsOpen(false);
                logout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}