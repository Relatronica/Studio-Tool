import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Ban,
  CalendarDays,
  LayoutGrid,
  Flag,
} from 'lucide-react';
import { Exam, PlannerSettings, StudyBlock } from '../types';
import { EXAM_COLORS } from '../utils/colors';
import {
  addDays,
  formatHours,
  formatItalianDate,
  getTodayISO,
  getWeekStartISO,
  parseISODate,
  toISODate,
  WEEKDAY_NAMES_SHORT,
} from '../utils/dateUtils';

interface CalendarViewProps {
  exams: Exam[];
  blocks: StudyBlock[];
  settings: PlannerSettings;
  onToggleBlock: (blockId: string) => void;
  onToggleBlockedDate: (isoDate: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  exams,
  blocks,
  settings,
  onToggleBlock,
  onToggleBlockedDate,
}) => {
  const todayISO = getTodayISO();
  const [mode, setMode] = useState<'week' | 'month'>('week');
  const [anchorISO, setAnchorISO] = useState<string>(todayISO);

  const examMap = new Map(exams.map((e) => [e.id, e]));
  const blockedSet = new Set(settings.blockedDates);

  const blocksByDate = new Map<string, StudyBlock[]>();
  for (const b of blocks) {
    const list = blocksByDate.get(b.date) ?? [];
    list.push(b);
    blocksByDate.set(b.date, list);
  }

  const examsByDate = new Map<string, Exam[]>();
  for (const e of exams) {
    const list = examsByDate.get(e.examDate) ?? [];
    list.push(e);
    examsByDate.set(e.examDate, list);
  }

  const navigate = (dir: -1 | 1) => {
    if (mode === 'week') {
      setAnchorISO((prev) => addDays(prev, dir * 7));
    } else {
      const d = parseISODate(anchorISO);
      d.setMonth(d.getMonth() + dir);
      setAnchorISO(toISODate(d));
    }
  };

  // Compute days to display
  let daysToRender: string[] = [];
  if (mode === 'week') {
    const weekStart = getWeekStartISO(anchorISO);
    daysToRender = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  } else {
    const d = parseISODate(anchorISO);
    const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const gridStart = getWeekStartISO(toISODate(firstOfMonth));
    daysToRender = Array.from({ length: 35 }, (_, i) => addDays(gridStart, i));
  }

  const currentMonth = parseISODate(anchorISO).getMonth();
  const headerLabel =
    mode === 'week'
      ? `${formatItalianDate(daysToRender[0], { day: 'numeric', month: 'short' })} – ${formatItalianDate(
          daysToRender[6],
          { day: 'numeric', month: 'short', year: 'numeric' }
        )}`
      : formatItalianDate(anchorISO, { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#9b9a97] uppercase tracking-wider">
            Pianificazione
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#37352f] flex items-center gap-3 mt-1">
            <span>🗓️</span>
            <span>Calendario di Studio</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Today & Navigation */}
          <div className="flex items-center rounded-md border border-[#e2e1dd] bg-white overflow-hidden">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-[#f1f1ef] text-[#5a5852]"
              aria-label="Precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAnchorISO(todayISO)}
              className="px-2.5 py-1 text-xs font-medium text-[#37352f] hover:bg-[#f1f1ef] border-x border-[#e2e1dd]"
            >
              Oggi
            </button>
            <button
              onClick={() => navigate(1)}
              className="p-1.5 hover:bg-[#f1f1ef] text-[#5a5852]"
              aria-label="Successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-sm font-semibold text-[#37352f] capitalize px-2 min-w-[160px] text-center">
            {headerLabel}
          </span>

          {/* Mode toggle */}
          <div className="flex items-center rounded-md border border-[#e2e1dd] bg-[#f7f7f5] p-0.5">
            <button
              onClick={() => setMode('week')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'week'
                  ? 'bg-white text-[#37352f] shadow-xs'
                  : 'text-[#787774] hover:text-[#37352f]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Settimana</span>
            </button>
            <button
              onClick={() => setMode('month')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'month'
                  ? 'bg-white text-[#37352f] shadow-xs'
                  : 'text-[#787774] hover:text-[#37352f]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Mese</span>
            </button>
          </div>
        </div>
      </header>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[#787774]">
        <span>Clicca su un blocco per completarlo · Usa</span>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f1f1ef] text-[#5a5852]">
          <Ban className="w-3 h-3" /> Giorno libero
        </span>
        <span>per bloccare una giornata e ricalcolare automaticamente.</span>
      </div>

      {/* Calendar Grid */}
      <div className="border border-[#e9e9e7] rounded-lg overflow-hidden bg-white">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-[#e9e9e7] bg-[#f7f7f5]">
          {[1, 2, 3, 4, 5, 6, 0].map((dow) => (
            <div
              key={dow}
              className="px-2 py-2 text-center text-[11px] font-semibold text-[#787774] uppercase tracking-wider border-r last:border-r-0 border-[#e9e9e7]"
            >
              {WEEKDAY_NAMES_SHORT[dow]}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#e9e9e7]">
          {daysToRender.map((iso) => {
            const d = parseISODate(iso);
            const isToday = iso === todayISO;
            const isBlocked = blockedSet.has(iso);
            const isPast = iso < todayISO;
            const isOutsideMonth = mode === 'month' && d.getMonth() !== currentMonth;
            const dayBlocks = blocksByDate.get(iso) ?? [];
            const dayExams = examsByDate.get(iso) ?? [];
            const totalDayHours = dayBlocks.reduce((s, b) => s + b.plannedHours, 0);

            return (
              <div
                key={iso}
                className={`p-2 flex flex-col gap-1.5 transition-colors ${
                  mode === 'week' ? 'min-h-[260px]' : 'min-h-[125px]'
                } ${isOutsideMonth ? 'bg-[#fbfbfa] opacity-60' : 'bg-white'} ${
                  isBlocked ? 'bg-[#f7f7f5]' : ''
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold tabular-nums ${
                        isToday
                          ? 'bg-[#eb5757] text-white'
                          : 'text-[#37352f]'
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    {totalDayHours > 0 && (
                      <span className="text-[10px] text-[#9b9a97] tabular-nums">
                        {formatHours(totalDayHours)}
                      </span>
                    )}
                  </div>

                  {!isPast && (
                    <button
                      onClick={() => onToggleBlockedDate(iso)}
                      title={isBlocked ? 'Sblocca giornata' : 'Segna come giorno libero'}
                      className={`p-1 rounded transition-colors ${
                        isBlocked
                          ? 'text-[#d44c47] bg-[#fdebec]'
                          : 'text-[#c2c0ba] hover:text-[#5a5852] hover:bg-[#f1f1ef]'
                      }`}
                    >
                      <Ban className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Exam Milestones */}
                {dayExams.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center gap-1 px-1.5 py-1 rounded bg-[#37352f] text-white text-[11px] font-medium"
                  >
                    <Flag className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      Esame: {ex.emoji} {ex.name}
                    </span>
                  </div>
                ))}

                {/* Blocked Label */}
                {isBlocked && dayBlocks.length === 0 && (
                  <div className="mt-1 px-1.5 py-1 rounded border border-dashed border-[#d3d1cb] text-[11px] text-[#9b9a97] text-center">
                    Giorno libero
                  </div>
                )}

                {/* Study Blocks */}
                <div className="space-y-1 flex-1">
                  {dayBlocks.map((block) => {
                    const exam = examMap.get(block.examId);
                    if (!exam) return null;
                    const color = EXAM_COLORS[exam.color];

                    return (
                      <button
                        key={block.id}
                        onClick={() => onToggleBlock(block.id)}
                        className={`w-full text-left p-1.5 rounded border transition-all ${
                          block.completed
                            ? 'bg-[#fbfbfa] border-[#e9e9e7] opacity-65'
                            : `${color.bgSubtle} ${color.border} hover:brightness-97`
                        }`}
                      >
                        <div className="flex items-start gap-1.5">
                          {block.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#448361] shrink-0 mt-0.5" />
                          ) : (
                            <Circle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${color.text}`} />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-[11px] font-semibold truncate ${
                                  block.completed ? 'line-through text-[#9b9a97]' : color.text
                                }`}
                              >
                                {exam.emoji} {exam.name}
                              </span>
                              <span className="text-[10px] text-[#787774] tabular-nums shrink-0">
                                {formatHours(block.plannedHours)}
                              </span>
                            </div>
                            <p
                              className={`text-[11px] leading-tight mt-0.5 truncate ${
                                block.completed ? 'line-through text-[#9b9a97]' : 'text-[#5a5852]'
                              }`}
                            >
                              {block.title}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

