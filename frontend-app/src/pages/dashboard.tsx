import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/common/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';

interface SummaryData {
  total_sessions: number;
  avg_score: number;
  best_score: number;
  top_role: string;
  top_industry: string;
}

interface TrendItem {
  session_id: string;
  job_role: string;
  score: number;
  date: string;
  x?: number;
  y?: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { getAnalyticsSummary, getAnalyticsTrend, loading, error } = useApi();

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [trend, setTrend] = useState<TrendItem[]>([]);
  const [activePoint, setActivePoint] = useState<any>(null);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      const summaryData = await getAnalyticsSummary();
      setSummary(summaryData);
      
      const trendData = await getAnalyticsTrend(10);
      setTrend(trendData || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Custom SVG Chart dimensions
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  
  const width = chartWidth - paddingLeft - paddingRight;
  const height = chartHeight - paddingTop - paddingBottom;

  // Calculate coordinates for SVG path
  const getCoordinates = (): TrendItem[] => {
    if (!trend || trend.length === 0) return [];
    
    return trend.map((point, i) => {
      const x = paddingLeft + (trend.length > 1 ? (i * width) / (trend.length - 1) : width / 2);
      // Score maps from 0-100 to height-0 (inverted y axis)
      const y = paddingTop + height - (point.score * height) / 100;
      return { x, y, ...point };
    });
  };

  const coords = getCoordinates();

  // Create path strings
  let linePath = '';
  let areaPath = '';

  if (coords.length > 0) {
    linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    
    // Path for gradient background under line
    const lastX = coords[coords.length - 1].x || 0;
    const firstX = coords[0].x || 0;
    const baseY = paddingTop + height;
    areaPath = `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }

  return (
    <ProtectedRoute>
      <Layout title="Dashboard | AI Interview Coach">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Welcome Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-primary to-indigo-700 rounded-3xl p-8 md:p-10 shadow-lg text-white mb-10 animate-fade-in">
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                Selamat Datang Kembali, {user?.username || 'Kandidat'}! 👋
              </h1>
              <p className="text-indigo-100 text-lg mb-8">
                Asah keterampilan wawancara Anda sekarang dengan simulasi cerdas berbasis AI.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="custom"
                  onClick={() => router.push('/pre-interview')}
                  className="bg-white !text-[#0d1b2a] hover:bg-indigo-50 font-semibold px-6 py-3 rounded-xl shadow-md border-0 transition-transform active:scale-95"
                >
                  Mulai Sesi Baru 🚀
                </Button>
                <Button 
                  variant="custom" 
                  onClick={() => router.push('/history')}
                  className="border-2 border-white text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-transform active:scale-95"
                >
                  Lihat Riwayat Sesi 📂
                </Button>
              </div>
            </div>
            
            {/* Soft decorative background circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 mr-10 -mb-20 w-60 h-60 bg-indigo-500/30 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          {loading && !summary ? (
            /* Loading Skeleton */
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-80 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="h-48 bg-gray-100 rounded"></div>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center mb-8">
              <h3 className="font-bold text-lg mb-1">Gagal memuat data Dashboard</h3>
              <p className="text-sm">Pastikan server database dan backend sedang berjalan dengan benar.</p>
              <Button onClick={fetchDashboardData} className="mt-4" size="sm">Coba Lagi</Button>
            </div>
          ) : summary && summary.total_sessions === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-3xl mx-auto py-16 animate-slide-up">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🎓
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Simulasi Pertama Anda Menanti!</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Anda belum menyelesaikan sesi latihan wawancara. Mulailah latihan pertama Anda untuk mengukur skor, mendapatkan analisis kata kunci, dan umpan balik AI yang personal.
              </p>
              <Button onClick={() => router.push('/pre-interview')} size="lg">
                Mulai Simulasi Wawancara 🚀
              </Button>
            </div>
          ) : (
            /* Real Dashboard Content */
            <div className="animate-fade-in">
              {/* Stats KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                
                {/* Total Sessions */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
                  <div className="p-4 bg-indigo-50 text-primary rounded-2xl text-2xl">
                    📁
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Sesi</h3>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{summary?.total_sessions}</p>
                  </div>
                </div>

                {/* Average Score */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-2xl">
                    📈
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Rata-rata Skor</h3>
                    <p className="text-3xl font-extrabold text-emerald-600 mt-1">{summary?.avg_score}</p>
                  </div>
                </div>

                {/* Best Score */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
                  <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl text-2xl">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Skor Terbaik</h3>
                    <p className="text-3xl font-extrabold text-amber-500 mt-1">{summary?.best_score}</p>
                  </div>
                </div>

                {/* Favorite Topic */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
                  <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl text-2xl">
                    💼
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider truncate">Topik Favorit</h3>
                    <p className="text-xl font-extrabold text-purple-600 mt-1 truncate" title={summary?.top_role}>
                      {summary?.top_role}
                    </p>
                  </div>
                </div>

              </div>

              {/* Chart & Insights Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Score Trend Card */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Tren Kemajuan Skor</h2>
                      <p className="text-sm text-gray-500">Nilai dari 10 latihan terakhir Anda</p>
                    </div>
                  </div>

                  {coords.length > 0 ? (
                    <div className="relative">
                      {/* Responsive SVG Chart */}
                      <svg 
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                        className="w-full h-auto overflow-visible"
                      >
                        {/* Definitions for gradients */}
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines (horizontal) */}
                        {[0, 25, 50, 75, 100].map((val) => {
                          const y = paddingTop + height - (val * height) / 100;
                          return (
                            <g key={val}>
                              <line 
                                x1={paddingLeft} 
                                y1={y} 
                                x2={chartWidth - paddingRight} 
                                y2={y} 
                                stroke="#f1f5f9" 
                                strokeWidth="1.5"
                              />
                              <text 
                                x={paddingLeft - 10} 
                                y={y + 4} 
                                textAnchor="end" 
                                className="text-[10px] fill-gray-400 font-medium"
                              >
                                {val}
                              </text>
                            </g>
                          );
                        })}

                        {/* Area Gradient under line */}
                        <path d={areaPath} fill="url(#areaGradient)" />

                        {/* Line Path */}
                        <path 
                          d={linePath} 
                          fill="none" 
                          stroke="#4f46e5" 
                          strokeWidth="3.5" 
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Chart Data Points / Interactive Dots */}
                        {coords.map((c, idx) => (
                          <g key={c.session_id}>
                            {/* Larger invisible hover target */}
                            <circle 
                              cx={c.x} 
                              cy={c.y} 
                              r="15" 
                              fill="transparent" 
                              className="cursor-pointer"
                              onMouseEnter={() => {
                                setActivePoint(c);
                                setActivePointIndex(idx);
                              }}
                              onMouseLeave={() => {
                                setActivePoint(null);
                                setActivePointIndex(null);
                              }}
                            />
                            {/* Inner visible dot */}
                            <circle 
                              cx={c.x} 
                              cy={c.y} 
                              r={activePointIndex === idx ? 7 : 5} 
                              fill={activePointIndex === idx ? "#ffffff" : "#4f46e5"} 
                              stroke="#4f46e5"
                              strokeWidth={activePointIndex === idx ? 4 : 2}
                              className="transition-all duration-150 pointer-events-none"
                            />
                            
                            {/* Date Label on X Axis */}
                            <text 
                              x={c.x} 
                              y={chartHeight - 10} 
                              textAnchor="middle" 
                              className="text-[9px] fill-gray-400 font-medium pointer-events-none"
                            >
                              S{idx + 1}
                            </text>
                          </g>
                        ))}
                      </svg>

                      {/* Tooltip Overlay */}
                      {activePoint && (
                        <div 
                          className="absolute z-20 bg-gray-900/95 text-white p-3 rounded-xl shadow-xl border border-gray-800 text-xs w-48 pointer-events-none animate-fade-in"
                          style={{
                            left: `${(((activePoint.x || 0) - paddingLeft) / width) * 100}%`,
                            top: `${(((activePoint.y || 0) - paddingTop) / height) * 60}%`,
                            transform: 'translate(-50%, -105%)',
                          }}
                        >
                          <div className="font-semibold border-b border-gray-700 pb-1 mb-1 truncate">
                            {activePoint.job_role}
                          </div>
                          <div className="flex justify-between mt-1 text-gray-300">
                            <span>Skor:</span>
                            <span className="font-bold text-amber-400">{activePoint.score} / 100</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                            <span>Tanggal:</span>
                            <span>{activePoint.date}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center border border-dashed border-gray-200 rounded-2xl">
                      <p className="text-gray-400 text-sm">Butuh setidaknya 1 sesi untuk melukis grafik tren.</p>
                    </div>
                  )}
                  
                  {coords.length > 0 && (
                    <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-gray-400">
                      <div className="flex items-center">
                        <span className="w-3 h-0.5 bg-indigo-600 inline-block mr-2 rounded"></span>
                        <span>S1, S2 ... = Sesi Latihan Ke-n</span>
                      </div>
                      <div>
                        <span>Arahkan kursor ke titik grafik untuk info detail 💡</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Insight Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Statistik Industri</h2>
                    <p className="text-sm text-gray-500 mb-6">Fokus area industri yang Anda minati</p>

                    {summary?.top_industry !== 'N/A' ? (
                      <div className="space-y-4">
                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                          <h4 className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">
                            Industri Utama
                          </h4>
                          <p className="text-lg font-bold text-primary">{summary?.top_industry}</p>
                        </div>
                        
                        <div className="p-4 border border-gray-100 rounded-2xl">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Status Akun
                          </h4>
                          <p className="text-sm font-semibold text-gray-700 flex items-center">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block mr-2"></span>
                            Aktif & Siap Latihan
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                        Belum ada data industri yang tercatat.
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8">
                    <Button 
                      onClick={() => router.push('/pre-interview')}
                      className="w-full justify-center"
                    >
                      Mulai Berlatih Baru
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </Layout>
    </ProtectedRoute>
  );
}