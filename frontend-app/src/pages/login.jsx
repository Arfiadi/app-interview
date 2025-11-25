import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router"; // Import useRouter
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter(); // Init router
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(""); // State untuk notifikasi redirect

  // Cek apakah ada pesan dari ProtectedRoute saat halaman dimuat
  useEffect(() => {
    if (router.query.message) {
      setNotification(router.query.message);
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await login(form.username, form.password);
      
      // Jika ada returnUrl, kembalikan user ke sana. Jika tidak, ke dashboard
      const returnUrl = router.query.returnUrl || "/";
      router.push(returnUrl);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-card border border-gray-100 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Masuk Akun</h1>
          <p className="text-text-sub text-sm mt-1">Lanjutkan progres latihan wawancara Anda.</p>
        </div>

        {/* TAMPILKAN NOTIFIKASI REDIRECT (Kuning) */}
        {notification && (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm mb-6 flex items-start gap-3 border border-yellow-100">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span>{notification}</span>
          </div>
        )}

        {/* TAMPILKAN ERROR LOGIN (Merah) */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Username / Email"
            value={form.username}
            onChange={(e) => setForm({...form, username: e.target.value})}
            placeholder="nama@email.com"
            required
          />
          <Input 
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
            placeholder="••••••••"
            required
          />
          
          <Button className="w-full" type="submit" isLoading={loading}>
            Masuk
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-sub">
          Belum punya akun?{" "}
          <Link href="/register" className="text-secondary font-bold hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}