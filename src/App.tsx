import { useEffect, useMemo, useState } from 'react';
import { Sidebar, ViewType } from './components/Sidebar';
import { TodayView } from './components/TodayView';
import { CalendarView } from './components/CalendarView';
import { ExamsView } from './components/ExamsView';
import { AvailabilityView } from './components/AvailabilityView';
import { getDefaultExams, getDefaultSettings } from './data/defaultData';
import { Exam, PlannerSettings, StudyBlock } from './types';
import { generateSchedule } from './utils/scheduler';

const STORAGE_KEY = 'studio-tool-state-v1';

interface StoredState {
  exams: Exam[];
  settings: PlannerSettings;
  blocks: StudyBlock[];
}

function loadInitialState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState;
      if (Array.isArray(parsed.exams) && parsed.settings) {
        return parsed;
      }
    }
  } catch {
    // ignore corrupted localStorage
  }
  const exams = getDefaultExams();
  const settings = getDefaultSettings();
  const { blocks } = generateSchedule(exams, settings, []);
  return { exams, settings, blocks };
}

export function App() {
  const initial = useMemo(() => loadInitialState(), []);
  const [exams, setExams] = useState<Exam[]>(initial.exams);
  const [settings, setSettings] = useState<PlannerSettings>(initial.settings);
  const [blocks, setBlocks] = useState<StudyBlock[]>(initial.blocks);

  const [activeView, setActiveView] = useState<ViewType>('today');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  // Recompute schedule whenever exams or settings change
  const scheduleResult = useMemo(
    () => generateSchedule(exams, settings, blocks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exams, settings]
  );

  // Keep blocks synced with computed schedule while preserving completed state
  useEffect(() => {
    setBlocks(scheduleResult.blocks);
  }, [scheduleResult.blocks]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ exams, settings, blocks })
      );
    } catch {
      // ignore quota errors
    }
  }, [exams, settings, blocks]);

  const handleToggleBlock = (blockId: string) => {
    const target = blocks.find((b) => b.id === blockId);
    if (!target) return;
    const nextCompleted = !target.completed;

    // Update block completion
    const updatedBlocks = blocks.map((b) =>
      b.id === blockId ? { ...b, completed: nextCompleted } : b
    );
    setBlocks(updatedBlocks);

    // Sync completedPages on the book if it's a study block with page range
    if (target.type === 'study' && target.bookId && target.endPage !== undefined) {
      setExams((prevExams) =>
        prevExams.map((exam) => {
          if (exam.id !== target.examId) return exam;
          return {
            ...exam,
            books: exam.books.map((book) => {
              if (book.id !== target.bookId) return book;
              if (nextCompleted) {
                return {
                  ...book,
                  completedPages: Math.max(book.completedPages, target.endPage!),
                };
              } else {
                const reverted =
                  target.startPage !== undefined ? target.startPage - 1 : book.completedPages;
                return {
                  ...book,
                  completedPages: Math.max(0, Math.min(book.completedPages, reverted)),
                };
              }
            }),
          };
        })
      );
    }
  };

  const handleRecalculate = () => {
    const res = generateSchedule(exams, settings, blocks);
    setBlocks(res.blocks);
    showToast('Piano di studio ricalcolato');
  };

  const handleResetDemo = () => {
    const defExams = getDefaultExams();
    const defSettings = getDefaultSettings();
    const res = generateSchedule(defExams, defSettings, []);
    setExams(defExams);
    setSettings(defSettings);
    setBlocks(res.blocks);
    showToast('Dati demo ripristinati');
  };

  const handleToggleBlockedDate = (isoDate: string) => {
    const exists = settings.blockedDates.includes(isoDate);
    setSettings({
      ...settings,
      blockedDates: exists
        ? settings.blockedDates.filter((d) => d !== isoDate)
        : [...settings.blockedDates, isoDate].sort(),
    });
    showToast(exists ? 'Giorno sbloccato e piano aggiornato' : 'Giorno segnato come libero');
  };

  return (
    <div className="min-h-screen flex bg-white text-[#37352f]">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        exams={exams}
        feasibility={scheduleResult.feasibility}
        onRecalculate={handleRecalculate}
        onResetDemo={handleResetDemo}
        selectedExamId={selectedExamId}
        onSelectExam={setSelectedExamId}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="flex-1 min-w-0 overflow-y-auto pt-10 lg:pt-0">
        {activeView === 'today' && (
          <TodayView
            exams={exams}
            blocks={blocks}
            feasibility={scheduleResult.feasibility}
            settings={settings}
            onToggleBlock={handleToggleBlock}
            onReschedule={handleRecalculate}
            onGoToCalendar={() => setActiveView('calendar')}
          />
        )}

        {activeView === 'calendar' && (
          <CalendarView
            exams={exams}
            blocks={blocks}
            settings={settings}
            onToggleBlock={handleToggleBlock}
            onToggleBlockedDate={handleToggleBlockedDate}
          />
        )}

        {activeView === 'exams' && (
          <ExamsView
            exams={exams}
            feasibility={scheduleResult.feasibility}
            selectedExamId={selectedExamId}
            onSelectExam={setSelectedExamId}
            onAddExam={(exam) => {
              setExams((prev) => [...prev, exam]);
              showToast(`Esame "${exam.name}" aggiunto`);
            }}
            onUpdateExam={(updated) =>
              setExams((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
            }
            onDeleteExam={(examId) => {
              setExams((prev) => prev.filter((e) => e.id !== examId));
              setBlocks((prev) => prev.filter((b) => b.examId !== examId));
              showToast('Esame eliminato');
            }}
          />
        )}

        {activeView === 'availability' && (
          <AvailabilityView settings={settings} onUpdateSettings={setSettings} />
        )}
      </main>

      {/* Notion-style subtle toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-[#37352f] text-white text-xs font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
