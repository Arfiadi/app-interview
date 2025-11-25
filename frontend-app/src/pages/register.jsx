import { useState } from "react";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Panggil API Register Python (via Next.js Proxy nanti idealnya, 
      // tapi untuk MVP kita tembak backend python via proxy manual atau langsung jika cors allow)
      // Disini kita pakai fetch manual ke endpoint Auth Python yang sudah kita buat
      // Note: Idealnya buat proxy di pages/api/auth/register.js seperti login
      
      // Kita buat proxy on-the-fly di sini atau asumsikan ada endpointnya
      // Mari kita buat file proxy register dulu di langkah 3 agar clean
      const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal mendaftar");

      alert("Pendaftaran berhasil! Silakan login.");
      router.push("/login");
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
          <h1 className="text-2xl font-bold text-primary">Buat Akun Baru</h1>
          <p className="text-text-sub text-sm mt-1">Mulai perjalanan karir profesional Anda.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Username"
            value={form.username}
            onChange={(e) => setForm({...form, username: e.target.value})}
            placeholder="johndoe"
            required
          />
          <Input 
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            placeholder="john@example.com"
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
            Daftar Sekarang
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-sub">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-secondary font-bold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}