import { useState } from "react";
import Layout from "../components/Layout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

/**
 * Halaman 1: Pre-Interview (Setup)
 * Fungsi: Menerima input user (Role, Level, Industry) lalu melempar ke halaman interview.
 */
export default function PreInterview() {
  const [job, setJob] = useState("");
  const [level, setLevel] = useState("");
  const [industry, setIndustry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = () => {
    if (!job || !level || !industry) {
      alert("Mohon lengkapi semua data sebelum memulai.");
      return;
    }
    
    setIsSubmitting(true);
    
    // Redirect ke halaman interview dengan membawa data input di URL
    setTimeout(() => {
        window.location.href = `/interview?job=${encodeURIComponent(job)}&level=${encodeURIComponent(level)}&industry=${encodeURIComponent(industry)}`;
    }, 500);
  };

  return (
    <Layout title="Setup Sesi Wawancara">
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header Teks */}
        <div className="text-center max-w-2xl mb-10 animate-slide-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4 tracking-tight">
            Selamat Datang di Sesi Privat Anda
          </h1>
          <p className="text-lg text-text-sub leading-relaxed">
            Kami akan mensimulasikan lingkungan wawancara yang objektif. 
            Silakan tentukan target peran Anda.
          </p>
        </div>

        {/* Form Input */}
        <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-card border border-gray-100 animate-fade-in">
          <div className="space-y-6">
            <Input 
              label="Posisi / Role"
              placeholder="Contoh: Product Manager..."
              value={job}
              onChange={(e) => setJob(e.target.value)}
            />

            <Select 
              label="Tingkat Pengalaman"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="Pilih level pengalaman..."
              options={["Internship", "Junior (1-2 tahun)", "Mid-Level (3-5 tahun)", "Senior (5+ tahun)", "Managerial"]}
            />

            <Input 
              label="Industri"
              placeholder="Contoh: Fintech, Healthtech..."
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />

            <div className="pt-4">
              <Button 
                variant="primary" 
                className="w-full text-lg shadow-lg shadow-primary/20"
                onClick={handleStart}
                isLoading={isSubmitting}
              >
                Mulai Sesi Wawancara
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}