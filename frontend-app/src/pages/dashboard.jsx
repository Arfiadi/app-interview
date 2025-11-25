import Layout from '@/components/common/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute'; // Import wrapper
import Button from '@/components/ui/Button';
import { useRouter } from 'next/router';
// FIX: Import from context, not hooks
import { useAuth } from '@/context/AuthContext'; 

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <Layout title="Dashboard | AI Interview Coach">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Selamat Datang, {user?.username || user?.email || 'Kandidat'}! 👋
            </h1>
            <p className="text-gray-600 mb-6">
              Siap melatih kemampuan wawancara Anda hari ini?
            </p>
            
            <div className="flex gap-4">
              <Button onClick={() => router.push('/pre-interview')}>
                Mulai Sesi Baru 🚀
              </Button>
              <Button variant="outline" onClick={() => router.push('/history')}>
                Lihat Riwayat 📂
              </Button>
            </div>
          </div>

          {/* Stats Section (Placeholder) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sesi</h3>
              <p className="text-3xl font-bold text-primary">12</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Rata-rata Skor</h3>
              <p className="text-3xl font-bold text-green-600">78.5</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Topik Favorit</h3>
              <p className="text-xl font-bold text-primary">Product Mgmt</p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}