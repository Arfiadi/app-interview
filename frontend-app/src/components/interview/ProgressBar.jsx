/**
 * Komponen untuk menampilkan progres sesi wawancara dan timer.
 * Lokasi: frontend/components/interview/ProgressBar.jsx
 */
export default function ProgressBar({ current, total, timerDisplay, isRecording }) {
  const progressPercent = (current / total) * 100;

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-soft border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        {/* Timer Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full font-mono text-sm font-bold border border-gray-200">
          <span 
            className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
          ></span>
          {timerDisplay}
        </div>
        
        {/* Progress Text */}
        <span className="text-sm font-medium text-text-sub">
          {current} / {total}
        </span>
      </div>

      {/* Bar Visual */}
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-secondary h-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
}