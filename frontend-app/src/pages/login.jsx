import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.username, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-card border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Masuk Akun</h1>
          <p className="text-text-sub text-sm mt-1">Lanjutkan progres latihan wawancara Anda.</p>
        </div>

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