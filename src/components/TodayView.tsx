import React from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CalendarOff,
} from 'lucide-react';
import { Exam, ExamFeasibility, PlannerSettings, StudyBlock } from '../types';
import { EXAM_COLORS } from '../utils/colors';
import { formatHours, formatItalianDate, getTodayISO, parseISODate } from '../utils/dateUtils';
import { PomodoroWidget } from './PomodoroWidget';

interface TodayViewProps {
  exams: Exam[];
  blocks: StudyBlock[];
  feasibility: Record<string, ExamFeasibility>;
  settings: PlannerSettings;
  onToggleBlock: (blockId: string) => void;
  onReschedule: () => void;
  onGoToCalendar: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  exams,
  blocks,
  feasibility,
  settings,
  onToggleBlock,
  onReschedule,
  onGoToCalendar,
}) => {
  const todayISO = getTodayISO();
  const todayBlocks = blocks.filter((b) => b.date === todayISO);
  const examMap = new Map(exams.map((e) => [e.id, e]));

  const totalPlannedToday = todayBlocks.reduce((s, b) => s + b.plannedHours, 0);
  const completedHoursToday = todayBlocks
    .filter((b) => b.completed)
    .reduce((s, b) => s + b.plannedHours, 0);
  const completedCount = todayBlocks.filter((b) => b.completed).length;

  const isBlockedToday = settings.blockedDates.includes(todayISO);
  const dayCapacity = isBlockedToday
    ? 0
    : settings.weeklyAvailability[parseISODate(todayISO).getDay()] ?? 0;

  const behindExams = Object.values(feasibility).filter((f) => f.status === 'behind');

  const todayFormatted = formatItalianDate(todayISO, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const progressPct =
    totalPlannedToday > 0 ? Math.round((completedHoursToday / totalPlannedToday) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Notion-style Page Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-[#9b9a97] dark:text-[#787774] uppercase tracking-wider">
          <span>Dashboard Giornaliera</span>
          <span>•</span>
          <span className="capitalize">{todayFormatted}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-[#37352f] dark:text-[#e3e2df] flex items-center gap-3">
            <span>☀️</span>
            <span>Cosa studiare oggi</span>
          </h1>
          <button
            onClick={onGoToCalendar}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#787774] dark:text-[#9b9a97] hover:text-[#37352f] dark:hover:text-[#e3e2df] px-2.5 py-1.5 rounded-md hover:bg-[#f1f1ef] dark:hover:bg-[#282828] transition-colors"
          >
            <span>Vedi calendario completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Behind Schedule Callout */}
      {behindExams.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[#fbf3db] dark:bg-[#382d16] border border-[#eedba5] dark:border-[#544320] text-[#6d450c] dark:text-[#e6b450]">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#d99b26] dark:text-[#e6b450]" />
          <div className="text-sm space-y-1 flex-1">
            <p className="font-medium">
              Attenzione al carico di studio: con le ore attuali non riesci a coprire tutto entro
              la data d&apos;esame.
            </p>
            <p className="text-xs opacity-90">
              {behindExams
                .map((f) => {
                  const ex = examMap.get(f.examId);
                  return `${ex?.emoji ?? ''} ${ex?.name ?? ''}: mancano ${f.unscheduledHours}h`;
                })
                .join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Summary & Pomodoro Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-[#e9e9e7] dark:border-[#2f2f2f] bg-[#fbfbfa] dark:bg-[#202020] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#787774] dark:text-[#9b9a97] uppercase tracking-wider">
              Avanzamento di oggi
            </span>
            <span className="text-xs font-medium text-[#37352f] dark:text-[#e3e2df] tabular-nums">
              {completedCount}/{todayBlocks.length} blocchi
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-[#37352f] dark:text-[#e3e2df]">
              {formatHours(completedHoursToday)}
            </span>
            <span className="text-sm text-[#787774] dark:text-[#9b9a97] tabular-nums">
              / {formatHours(totalPlannedToday)} pianificate (max {formatHours(dayCapacity)})
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 w-full rounded-full bg-[#e9e9e7] dark:bg-[#2f2f2f] overflow-hidden">
              <div
                className="h-full bg-[#448361] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#787774] dark:text-[#9b9a97]">
              <span>{progressPct}% completato</span>
              {todayBlocks.length > 0 && completedCount === todayBlocks.length && (
                <span className="text-[#356b46] dark:text-[#6cc08a] font-medium">
                  Giornata completata!
                </span>
              )}
            </div>
          </div>
        </div>

        <PomodoroWidget />
      </div>

      {/* Today's Blocks List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#37352f] dark:text-[#e3e2df]">
            Blocchi di studio
          </h2>
          <button
            onClick={onReschedule}
            className="text-xs text-[#2383e2] dark:text-[#529cca] hover:underline font-medium"
          >
            Ho avuto un imprevisto → Ricalcola
          </button>
        </div>

        {isBlockedToday ? (
          <div className="rounded-lg border border-dashed border-[#e2e1dd] dark:border-[#363636] p-8 text-center space-y-2 bg-[#fbfbfa] dark:bg-[#202020]">
            <CalendarOff className="w-7 h-7 text-[#9b9a97] dark:text-[#787774] mx-auto" />
            <p className="text-sm font-medium text-[#37352f] dark:text-[#e3e2df]">
              Oggi è segnato come giorno libero
            </p>
            <p className="text-xs text-[#787774] dark:text-[#9b9a97]">
              Puoi sbloccarlo dalla sezione Calendario o Disponibilità se vuoi studiare oggi.
            </p>
          </div>
        ) : todayBlocks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#e2e1dd] dark:border-[#363636] p-8 text-center space-y-2 bg-[#fbfbfa] dark:bg-[#202020]">
            <Sparkles className="w-7 h-7 text-[#448361] dark:text-[#6cc08a] mx-auto" />
            <p className="text-sm font-medium text-[#37352f] dark:text-[#e3e2df]">
              {dayCapacity === 0
                ? 'Nessuna ora di studio impostata per oggi'
                : 'Nessun blocco da studiare oggi!'}
            </p>
            <p className="text-xs text-[#787774] dark:text-[#9b9a97]">
              {dayCapacity === 0
                ? 'Goditi il riposo oppure aggiungi ore in Disponibilità.'
                : 'Sei completamente in pari con i tuoi esami.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#ecebe8] dark:divide-[#2f2f2f] border border-[#e9e9e7] dark:border-[#2f2f2f] rounded-lg overflow-hidden bg-white dark:bg-[#202020]">
            {todayBlocks.map((block) => {
              const exam = examMap.get(block.examId);
              if (!exam) return null;
              const color = EXAM_COLORS[exam.color];

              return (
                <div
                  key={block.id}
                  onClick={() => onToggleBlock(block.id)}
                  className={`group flex items-center gap-3.5 px-4 py-3.5 cursor-pointer transition-colors ${
                    block.completed
                      ? 'bg-[#fbfbfa] dark:bg-[#1c1c1c]'
                      : 'hover:bg-[#f7f7f5] dark:hover:bg-[#282828]'
                  }`}
                >
                  <button
                    type="button"
                    className="shrink-0 text-[#9b9a97] dark:text-[#787774] group-hover:text-[#2383e2] transition-colors"
                    aria-label="Segna come completato"
                  >
                    {block.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#448361] dark:text-[#6cc08a]" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color.bg} ${color.text}`}
                      >
                        <span>{exam.emoji}</span>
                        <span>{exam.name}</span>
                      </span>
                      {block.type === 'review' && (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#f1f1ef] dark:bg-[#2c2c2c] text-[#5a5852] dark:text-[#a5a4a0]">
                          Ripasso
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 text-sm font-medium ${
                        block.completed
                          ? 'line-through text-[#9b9a97] dark:text-[#6b6a67]'
                          : 'text-[#37352f] dark:text-[#e3e2df]'
                      }`}
                    >
                      {block.title}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-1 rounded bg-[#f1f1ef] dark:bg-[#2c2c2c] text-xs font-medium text-[#5a5852] dark:text-[#a5a4a0] tabular-nums">
                      {formatHours(block.plannedHours)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Mini Exam Progress Strip */}
      {exams.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[#37352f] dark:text-[#e3e2df]">
            Stato degli esami
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {exams
              .slice()
              .sort((a, b) => a.examDate.localeCompare(b.examDate))
              .map((exam) => {
                const feas = feasibility[exam.id];
                if (!feas) return null;
                const color = EXAM_COLORS[exam.color];
                const pct =
                  feas.totalPages > 0
                    ? Math.round((feas.completedPages / feas.totalPages) * 100)
                    : 0;
                return (
                  <div
                    key={exam.id}
                    className="p-3.5 rounded-lg border border-[#e9e9e7] dark:border-[#2f2f2f] bg-white dark:bg-[#202020] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span>{exam.emoji}</span>
                        <span className="text-sm font-medium truncate text-[#37352f] dark:text-[#e3e2df]">
                          {exam.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#787774] dark:text-[#9b9a97] tabular-nums shrink-0">
                        -{feas.daysUntilExam}g
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#efefed] dark:bg-[#2f2f2f] overflow-hidden">
                      <div
                        className={`h-full ${color.progress}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#787774] dark:text-[#9b9a97] tabular-nums">
                      <span>
                        {feas.completedPages}/{feas.totalPages} pp.
                      </span>
                      <span>{pct}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
};
