import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { useApi } from "@/hooks/useApi"; // Pastikan hook ini ada

export default function PreInterview() {
  const router = useRouter();
  const { getHistory } = useApi(); // Kita pakai untuk cek history lama

  // --- Form State ---
  const [job, setJob] = useState("");
  const [level, setLevel] = useState("");
  const [industry, setIndustry] = useState("");
  const [numQuestions, setNumQuestions] = useState("5"); // Default 5

  // --- UI Logic State ---
  const [isChecking, setIsChecking] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [matchedHistoryCount, setMatchedHistoryCount] = useState(0);

  // 1. HANDLER: Cek Data & History
  const handlePreCheck = async () => {
    // Validasi Input
    if (!job || !level || !industry) {
      alert("Mohon lengkapi Job Role, Level, dan Industri.");
      return;
    }

    setIsChecking(true);

    try {
      // Ambil semua history
      const historyData = await getHistory(); 
      // Filter: Apakah user pernah latihan role & level ini sebelumnya?
      // (Simple filtering di client-side untuk MVP)
      const matches = Array.isArray(historyData) 
        ? historyData.filter(h => 
            (h.meta?.job_role?.toLowerCase() === job.toLowerCase()) && 
            (h.meta?.experience_level === level)
          )
        : [];

      if (matches.length > 0) {
        setMatchedHistoryCount(matches.length);
        setShowHistoryModal(true); // Trigger Modal 1
      } else {
        setShowBriefingModal(true); // Langsung ke Briefing
      }
    } catch (err) {
      console.warn("Gagal cek history, lanjut ke briefing saja.");
      setShowBriefingModal(true);
    } finally {
      setIsChecking(false);
    }
  };

  // 2. HANDLER: Mulai Sesi (Redirect)
  const startSession = () => {
    // Tutup semua modal
    setShowHistoryModal(false);
    setShowBriefingModal(false);

    // Redirect dengan parameter lengkap
    // encodeURIComponent penting agar URL aman
    const query = new URLSearchParams({
      job,
      level,
      industry,
      n: numQuestions // Kirim jumlah pertanyaan
    }).toString();

    window.location.href = `/interview?${query}`;
  };

  return (
    <Layout title="Setup Sesi Wawancara">
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mb-10 animate-slide-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4 tracking-tight">
            Konfigurasi Sesi
          </h1>
          <p className="text-lg text-text-sub leading-relaxed">
            Sesuaikan parameter simulasi agar relevan dengan target karir Anda.
          </p>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-lg bg-surface p-8 rounded-2xl shadow-card border border-gray-100 animate-fade-in">
          <div className="space-y-5">
            
            <Input 
              label="Posisi / Role"
              placeholder="Contoh: Product Manager..."
              value={job}
              onChange={(e) => setJob(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Select 
                label="Level Pengalaman"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="Pilih level..."
                options={["Internship", "Junior (1-2 tahun)", "Mid-Level (3-5 tahun)", "Senior (5+ tahun)", "Managerial"]}
              />
              
              {/* FITUR 1: Memilih Jumlah Pertanyaan */}
              <Select 
                label="Jumlah Pertanyaan"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                placeholder="Pilih jumlah..."
                options={["3", "4", "5 (Default)", "7", "10"]}
              />
            </div>

            <Input 
              label="Industri"
              placeholder="Contoh: Fintech, Healthtech..."
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />

            <div className="pt-6">
              <Button 
                variant="primary" 
                className="w-full text-lg shadow-lg shadow-primary/20"
                onClick={handlePreCheck}
                isLoading={isChecking}
              >
                Lanjut ke Briefing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: History Notification (FITUR 2) --- */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Riwayat Ditemukan 📂"
        footer={
          <>
            <Button variant="outline" onClick={() => router.push('/history')}>
              Cek Riwayat
            </Button>
            <Button variant="primary" onClick={() => {
              setShowHistoryModal(false);
              setShowBriefingModal(true);
            }}>
              Buat Sesi Baru
            </Button>
          </>
        }
      >
        <p>
          Kami menemukan <strong>{matchedHistoryCount} sesi wawancara sebelumnya</strong> untuk posisi 
          <span className="font-bold text-primary"> {job} ({level})</span>.
        </p>
        <p className="mt-3 text-sm bg-blue-50 p-3 rounded-lg text-blue-800">
          💡 <strong>Saran:</strong> Anda bisa meninjau riwayat lama untuk melihat perkembangan skor Anda, 
          atau mulai sesi baru untuk latihan soal yang berbeda.
        </p>
      </Modal>

      {/* --- MODAL 2: Briefing Singkat (FITUR 3) --- */}
      <Modal
        isOpen={showBriefingModal}
        onClose={() => setShowBriefingModal(false)}
        title="Briefing Sesi 📋"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowBriefingModal(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={startSession}>
              Siap, Mulai Wawancara 🚀
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p>Anda akan memulai simulasi wawancara dengan konfigurasi:</p>
          <ul className="list-disc list-inside bg-gray-50 p-4 rounded-lg text-sm space-y-1">
            <li><strong>Role:</strong> {job}</li>
            <li><strong>Level:</strong> {level}</li>
            <li><strong>Total Pertanyaan:</strong> {numQuestions.replace(" (Default)", "")} Soal</li>
          </ul>
          
          <div className="space-y-2">
            <h4 className="font-bold text-primary">Aturan Main:</h4>
            <ul className="text-sm space-y-1 text-text-sub">
              <li>• Tidak ada batasan waktu per soal (tapi timer akan berjalan).</li>
              <li>• Jawaban dinilai berdasarkan relevansi dan kata kunci (AI).</li>
              <li>• Gunakan mikrofon jika ingin berlatih berbicara.</li>
            </ul>
          </div>
        </div>
      </Modal>

    </Layout>
  );
}