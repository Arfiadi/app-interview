import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika loading selesai dan tidak ada user
    if (!loading && !user) {
      // Redirect ke login dengan query parameter 'message'
      // 'returnUrl' berguna agar setelah login bisa balik ke halaman yang dituju
      router.push({
        pathname: "/login",
        query: { 
            message: "Silakan login terlebih dahulu untuk mengakses halaman ini.",
            returnUrl: router.asPath 
        }
      });
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;