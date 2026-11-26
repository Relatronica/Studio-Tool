import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

const PRESETS = [
  { label: 'Focus 25m', minutes: 25 },
  { label: 'Deep 50m', minutes: 50 },
  { label: 'Pausa 5m', minutes: 5 },
];

export const PomodoroWidget: React.FC = () => {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const selectPreset = (mins: number) => {
    setRunning(false);
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const progress = ((selectedMinutes * 60 - secondsLeft) / (selectedMinutes * 60)) * 100;

  return (
    <div className="rounded-lg border border-[#e9e9e7] dark:border-[#2f2f2f] bg-[#fbfbfa] dark:bg-[#202020] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[#787774] dark:text-[#9b9a97] uppercase tracking-wider">
          <Timer className="w-3.5 h-3.5" />
          <span>Timer Focus</span>
        </div>
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => selectPreset(p.minutes)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                selectedMinutes === p.minutes
                  ? 'bg-[#37352f] dark:bg-[#e3e2df] text-white dark:text-[#191919]'
                  : 'bg-[#efefed] dark:bg-[#2c2c2c] text-[#5a5852] dark:text-[#a5a4a0] hover:bg-[#e5e5e2] dark:hover:bg-[#363636]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-3xl font-semibold tracking-tight tabular-nums text-[#37352f] dark:text-[#e3e2df]">
          {mins}:{secs}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2383e2] hover:bg-[#1a73cc] text-white text-xs font-medium transition-colors"
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{running ? 'Pausa' : 'Avvia'}</span>
          </button>
          <button
            onClick={() => selectPreset(selectedMinutes)}
            className="p-1.5 rounded-md border border-[#e2e1dd] dark:border-[#363636] bg-white dark:bg-[#252525] hover:bg-[#f1f1ef] dark:hover:bg-[#2e2e2e] text-[#5a5852] dark:text-[#a5a4a0]"
            title="Azzera timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 h-1 w-full rounded-full bg-[#e9e9e7] dark:bg-[#2f2f2f] overflow-hidden">
        <div
          className="h-full bg-[#2383e2] transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};
