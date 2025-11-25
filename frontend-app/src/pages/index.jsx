import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";

export default function LandingPage() {
  const router = useRouter();

  return (
    <Layout title="AI Interview Coach - Latihan Wawancara Profesional">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-background pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
            🚀 Versi Beta Publik
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-6 animate-slide-up">
            Kuasai Wawancara Kerja <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Tanpa Rasa Cemas
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-text-sub mb-10 leading-relaxed animate-slide-up animation-delay-200">
            Simulasi wawancara privat dengan AI yang memberikan umpan balik objektif. 
            Latih jawaban Anda untuk berbagai peran industri, dapatkan skor, dan tingkatkan kepercayaan diri.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-300">
            <Button 
              className="text-lg px-8 py-4 shadow-xl shadow-primary/20"
              onClick={() => router.push('/pre-interview')}
            >
              Mulai Simulasi Gratis
            </Button>
            <Button 
              variant="outline" 
              className="text-lg px-8 py-4"
              onClick={() => router.push('/history')}
            >
              Lihat Progres Saya
            </Button>
          </div>

        </div>

        {/* Decorative Blob Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
            <div className="absolute top-20 left-20 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-card transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-2xl">
                        🎯
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-3">Relevansi Tinggi</h3>
                    <p className="text-text-sub">
                        Pertanyaan disesuaikan secara dinamis berdasarkan Job Role, Level Pengalaman, dan Industri yang Anda pilih.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-card transition-shadow">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6 text-2xl">
                        🤖
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-3">Analisis AI Cerdas</h3>
                    <p className="text-text-sub">
                        Dapatkan skor kemiripan semantik dan analisis kata kunci (NLP) untuk mengetahui seberapa akurat jawaban Anda.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-card transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-2xl">
                        🔒
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-3">Privat & Aman</h3>
                    <p className="text-text-sub">
                        Latihan tanpa tekanan. Tidak ada pewawancara manusia yang menilai. Ruang aman untuk membuat kesalahan dan belajar.
                    </p>
                </div>
            </div>
        </div>
      </section>

    </Layout>
  );
}