import React, { useState } from 'react';
import { Clock, Plus, X, CalendarOff } from 'lucide-react';
import { PlannerSettings } from '../types';
import { formatHours, formatItalianDate, getTodayISO, WEEKDAY_NAMES_FULL } from '../utils/dateUtils';

interface AvailabilityViewProps {
  settings: PlannerSettings;
  onUpdateSettings: (next: PlannerSettings) => void;
}

const ORDERED_DAYS = [1, 2, 3, 4, 5, 6, 0]; // Mon -> Sun

export const AvailabilityView: React.FC<AvailabilityViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [newBlockedDate, setNewBlockedDate] = useState(getTodayISO());

  const totalWeeklyHours = ORDERED_DAYS.reduce(
    (sum, d) => sum + (settings.weeklyAvailability[d] ?? 0),
    0
  );

  const handleHourChange = (day: number, hours: number) => {
    onUpdateSettings({
      ...settings,
      weeklyAvailability: {
        ...settings.weeklyAvailability,
        [day]: Math.min(14, Math.max(0, hours)),
      },
    });
  };

  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate || settings.blockedDates.includes(newBlockedDate)) return;
    onUpdateSettings({
      ...settings,
      blockedDates: [...settings.blockedDates, newBlockedDate].sort(),
    });
  };

  const handleRemoveBlockedDate = (iso: string) => {
    onUpdateSettings({
      ...settings,
      blockedDates: settings.blockedDates.filter((d) => d !== iso),
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <header>
        <div className="text-xs font-medium text-[#9b9a97] uppercase tracking-wider">
          Configurazione Ritmo
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#37352f] flex items-center gap-3 mt-1">
          <span>⏱️</span>
          <span>Disponibilità e Orari</span>
        </h1>
        <p className="text-sm text-[#787774] mt-2">
          Imposta quante ore riesci a dedicare allo studio ogni giorno. Il calendario si adatta
          automaticamente.
        </p>
      </header>

      {/* Weekly Hours */}
      <section className="rounded-lg border border-[#e9e9e7] bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#ecebe8] bg-[#fbfbfa] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#37352f]">
            <Clock className="w-4 h-4 text-[#448361]" />
            <span>Ore disponibili per giorno della settimana</span>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#edf3ec] text-[#356b46] tabular-nums">
            Totale: {formatHours(totalWeeklyHours)} / settimana
          </span>
        </div>

        <div className="divide-y divide-[#ecebe8]">
          {ORDERED_DAYS.map((day) => {
            const hours = settings.weeklyAvailability[day] ?? 0;
            return (
              <div key={day} className="px-5 py-3 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-[#37352f] w-28">
                  {WEEKDAY_NAMES_FULL[day]}
                </span>

                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={hours}
                  onChange={(e) => handleHourChange(day, Number(e.target.value))}
                  className="flex-1 accent-[#2383e2]"
                />

                <div className="flex items-center gap-1.5 w-24 justify-end">
                  <input
                    type="number"
                    min={0}
                    max={14}
                    step={0.5}
                    value={hours}
                    onChange={(e) => handleHourChange(day, Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded border border-[#e2e1dd] text-sm text-right tabular-nums"
                  />
                  <span className="text-xs text-[#787774]">h</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Max Block Duration */}
      <section className="rounded-lg border border-[#e9e9e7] bg-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#37352f]">
            Durata massima per singolo blocco materia
          </h2>
          <p className="text-xs text-[#787774] mt-0.5">
            Quando hai più esami attivi, alterna le materie dopo questo numero di ore per restare
            lucido.
          </p>
        </div>
        <select
          value={settings.maxBlockHours}
          onChange={(e) =>
            onUpdateSettings({ ...settings, maxBlockHours: Number(e.target.value) })
          }
          className="px-3 py-1.5 rounded border border-[#e2e1dd] bg-white text-sm font-medium"
        >
          <option value={1}>1 ora</option>
          <option value={1.5}>1h 30m</option>
          <option value={2}>2 ore (Consigliato)</option>
          <option value={2.5}>2h 30m</option>
          <option value={3}>3 ore</option>
          <option value={4}>4 ore</option>
        </select>
      </section>

      {/* Blocked Dates */}
      <section className="rounded-lg border border-[#e9e9e7] bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarOff className="w-4 h-4 text-[#d44c47]" />
          <h2 className="text-sm font-semibold text-[#37352f]">
            Giorni liberi / Impegni (nessuno studio pianificato)
          </h2>
        </div>

        <form onSubmit={handleAddBlockedDate} className="flex items-center gap-2">
          <input
            type="date"
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            className="px-3 py-1.5 rounded border border-[#e2e1dd] text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#37352f] hover:bg-[#23221e] text-white text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Aggiungi giorno libero</span>
          </button>
        </form>

        {settings.blockedDates.length === 0 ? (
          <p className="text-xs text-[#9b9a97]">Nessun giorno bloccato al momento.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {settings.blockedDates.map((iso) => (
              <span
                key={iso}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f1f1ef] text-xs font-medium text-[#37352f]"
              >
                <span>{formatItalianDate(iso, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <button
                  onClick={() => handleRemoveBlockedDate(iso)}
                  className="text-[#787774] hover:text-[#d44c47]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

