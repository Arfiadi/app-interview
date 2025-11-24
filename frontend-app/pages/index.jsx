import Button from "../components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl md:text-6xl font-bold text-white">
        AI Mock Interview
        <span className="text-blue-500"> Assistant</span>
      </h1>

      <p className="mt-4 text-lg text-gray-400 max-w-xl">
        Latih kemampuan interview Anda menggunakan AI yang mensimulasikan  
        pertanyaan  sesuai job role, level, dan industri.
      </p>

      <Button
        onClick={() => (window.location.href = "/pre-interview")}
        className="mt-8 text-lg px-8 py-3"
      >
        Mulai Wawancara
      </Button>
    </div>
  );
}
