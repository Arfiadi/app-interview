import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Jika tidak loading dan user kosong, tendang ke login
      router.push("/login");
    }
  }, [user, loading, router]);

  // Tampilkan loading saat mengecek sesi
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Jika user ada, render halaman
  return children;
};

export default ProtectedRoute;