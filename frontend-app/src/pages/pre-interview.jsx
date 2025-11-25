import { useState } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/auth/ProtectedRoute"; // Import Satpam
import Layout from "@/components/common/Layout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { useApi } from "@/hooks/useApi";

export default function PreInterview() {
  const router = useRouter();
  const { getHistory } = useApi();

  const [job, setJob] = useState("");
  const [level, setLevel] = useState("");
  const [industry, setIndustry] = useState("");
  const [numQuestions, setNumQuestions] = useState("5");

  const [isChecking, setIsChecking] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [matchedHistoryCount, setMatchedHistoryCount] = useState(0);

  const handlePreCheck = async () => {
    if (!job || !level || !industry) {
      alert("Mohon lengkapi Job Role, Level, dan Industri.");
      return;
    }

    setIsChecking(true);

    try {
      const historyData = await getHistory(); 
      const matches = Array.isArray(historyData) 
        ? historyData.filter(h => 
            (h.meta?.job_role?.toLowerCase() === job.toLowerCase()) && 
            (h.meta?.experience_level === level)
          )
        : [];

      if (matches.length > 0) {
        setMatchedHistoryCount(matches.length);
        setShowHistoryModal(true);
      } else {
        setShowBriefingModal(true);
      }
    } catch (err) {
      setShowBriefingModal(true);
    } finally {
      setIsChecking(false);
    }
  };

  const startSession = () => {
    setShowHistoryModal(false);
    setShowBriefingModal(false);

    const query = new URLSearchParams({
      job,
      level,
      industry,
      n: numQuestions
    }).toString();

    window.location.href = `/interview?${query}`;
  };

  return (
    <ProtectedRoute>
      <Layout title="Setup Sesi Wawancara">
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mb-10 animate-slide-up">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4 tracking-tight">
              Konfigurasi Sesi
            </h1>
            <p className="text-lg text-text-sub leading-relaxed">
              Sesuaikan parameter simulasi agar relevan dengan target karir Anda.
            </p>
          </div>

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

        {/* Modal History */}
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
        </Modal>

        {/* Modal Briefing */}
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
          </div>
        </Modal>

      </Layout>
    </ProtectedRoute>
  );
}