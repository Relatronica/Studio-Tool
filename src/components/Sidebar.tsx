import React from 'react';
import {
  Calendar,
  BookOpen,
  Clock,
  Sun,
  Moon,
  RefreshCw,
  RotateCcw,
  Menu,
  X,
} from 'lucide-react';
import { Exam, ExamFeasibility } from '../types';
import { EXAM_COLORS } from '../utils/colors';
import { ThemeMode } from '../App';

export type ViewType = 'today' | 'calendar' | 'exams' | 'availability';

interface SidebarProps {
  activeView: ViewType;
  onSelectView: (view: ViewType) => void;
  exams: Exam[];
  feasibility: Record<string, ExamFeasibility>;
  onRecalculate: () => void;
  onResetDemo: () => void;
  selectedExamId: string | null;
  onSelectExam: (examId: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  exams,
  feasibility,
  onRecalculate,
  onResetDemo,
  selectedExamId,
  onSelectExam,
  mobileOpen,
  setMobileOpen,
  theme,
  onToggleTheme,
}) => {
  const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: 'Oggi', icon: <Sun className="w-4 h-4 text-[#d9730d]" /> },
    { id: 'calendar', label: 'Calendario', icon: <Calendar className="w-4 h-4 text-[#2383e2]" /> },
    { id: 'exams', label: 'Esami e Libri', icon: <BookOpen className="w-4 h-4 text-[#9065b0]" /> },
    { id: 'availability', label: 'Disponibilità', icon: <Clock className="w-4 h-4 text-[#448361]" /> },
  ];

  const sortedExams = [...exams].sort((a, b) => a.examDate.localeCompare(b.examDate));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#f7f7f5] dark:bg-[#202020] border-r border-[#ecebe8] dark:border-[#2f2f2f] select-none w-60">
      {/* Workspace Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#ecebe8]/70 dark:border-[#2f2f2f]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-[#37352f] dark:bg-[#e3e2df] text-white dark:text-[#191919] flex items-center justify-center text-xs font-semibold shrink-0">
            S
          </div>
          <span className="font-semibold text-sm text-[#37352f] dark:text-[#e3e2df] truncate">
            Studio
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#e9e9e7] dark:bg-[#2c2c2c] text-[#787774] dark:text-[#9b9a97]">
            Planner
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded hover:bg-[#e8e8e6] dark:hover:bg-[#2c2c2c] text-[#787774] dark:text-[#9b9a97] hover:text-[#37352f] dark:hover:text-[#e3e2df] transition-colors"
            title={theme === 'dark' ? 'Passa a tema chiaro' : 'Passa a tema scuro'}
            aria-label={theme === 'dark' ? 'Passa a tema chiaro' : 'Passa a tema scuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#e6b450]" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-[#e8e8e6] dark:hover:bg-[#2c2c2c] text-[#787774] dark:text-[#9b9a97]"
            aria-label="Chiudi menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="px-2 py-2.5 space-y-0.5">
        <div className="px-2 pb-1 text-[11px] font-medium text-[#9b9a97] dark:text-[#787774] uppercase tracking-wider">
          Spazio di lavoro
        </div>
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectView(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13.5px] transition-colors ${
                isActive
                  ? 'bg-[#e8e8e6] dark:bg-[#2c2c2c] text-[#37352f] dark:text-[#e3e2df] font-medium'
                  : 'text-[#5a5852] dark:text-[#a5a4a0] hover:bg-[#ebebea] dark:hover:bg-[#282828]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Exams Quick List */}
      <div className="px-2 py-2 flex-1 overflow-y-auto">
        <div className="px-2 pb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#9b9a97] dark:text-[#787774] uppercase tracking-wider">
            I tuoi esami
          </span>
          <span className="text-[11px] text-[#9b9a97] dark:text-[#787774] tabular-nums">
            {exams.length}
          </span>
        </div>
        <div className="space-y-0.5">
          {sortedExams.length === 0 ? (
            <p className="px-2.5 py-2 text-xs text-[#9b9a97] dark:text-[#787774]">
              Nessun esame inserito
            </p>
          ) : (
            sortedExams.map((exam) => {
              const feas = feasibility[exam.id];
              const color = EXAM_COLORS[exam.color];
              const isSelected = activeView === 'exams' && selectedExamId === exam.id;
              return (
                <button
                  key={exam.id}
                  onClick={() => {
                    onSelectExam(exam.id);
                    onSelectView('exams');
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors ${
                    isSelected
                      ? 'bg-[#e8e8e6] dark:bg-[#2c2c2c] text-[#37352f] dark:text-[#e3e2df] font-medium'
                      : 'text-[#5a5852] dark:text-[#a5a4a0] hover:bg-[#ebebea] dark:hover:bg-[#282828]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{exam.emoji}</span>
                    <span className="truncate">{exam.name}</span>
                  </div>
                  {feas && (
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded tabular-nums shrink-0 ${
                        feas.status === 'behind'
                          ? 'bg-[#fdebec] dark:bg-[#3b2022] text-[#9e3336] dark:text-[#eb7c7f]'
                          : feas.status === 'completed'
                          ? 'bg-[#edf3ec] dark:bg-[#1e3326] text-[#356b46] dark:text-[#6cc08a]'
                          : `${color.bg} ${color.text}`
                      }`}
                    >
                      {feas.daysUntilExam >= 0 ? `${feas.daysUntilExam}g` : 'Passato'}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-2.5 border-t border-[#ecebe8] dark:border-[#2f2f2f] space-y-1">
        <button
          onClick={onRecalculate}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-[#252525] border border-[#e2e1dd] dark:border-[#363636] hover:bg-[#f1f1ef] dark:hover:bg-[#2e2e2e] text-[13px] font-medium text-[#37352f] dark:text-[#e3e2df] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#2383e2]" />
          <span>Ricalcola piano</span>
        </button>
        <button
          onClick={onResetDemo}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1 rounded-md hover:bg-[#ebebea] dark:hover:bg-[#282828] text-[12px] text-[#787774] dark:text-[#9b9a97] transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Ripristina dati demo</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-30 p-2 rounded-md bg-white dark:bg-[#252525] border border-[#e9e9e7] dark:border-[#363636] shadow-sm text-[#37352f] dark:text-[#e3e2df]"
        aria-label="Apri menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0">{sidebarContent}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
