import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-6 flex flex-col items-center justify-center">
      {/* HERO */}
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            AI Interview Simulator
          </span>
        </h1>

        <p className="text-gray-300 text-lg mb-8">
          Persiapkan diri untuk interview kerja dengan simulasi wawancara
          berbasis AI. Dapatkan penilaian objektif, analisis jawaban, dan
          feedback mendalam untuk meningkatkan peluang lolos interview.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/pre-interview">
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg font-medium text-lg transition">
              Mulai Wawancara
            </button>
          </Link>

          <Link href="/history">
            <button className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg font-medium text-lg transition">
              Lihat Riwayat
            </button>
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <p className="text-gray-500 text-sm mt-14">
        Dibuat untuk Final Project Teknik Informatika — Powered by OpenRouter AI
      </p>
    </div>
  );
}
