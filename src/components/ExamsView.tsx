import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Book, Exam, ExamColor, ExamFeasibility, Priority } from '../types';
import { COLOR_OPTIONS, EXAM_COLORS } from '../utils/colors';
import { addDays, formatItalianDate, getTodayISO } from '../utils/dateUtils';

interface ExamsViewProps {
  exams: Exam[];
  feasibility: Record<string, ExamFeasibility>;
  selectedExamId: string | null;
  onSelectExam: (id: string | null) => void;
  onAddExam: (exam: Exam) => void;
  onUpdateExam: (exam: Exam) => void;
  onDeleteExam: (examId: string) => void;
}

const EMOJI_PRESETS = ['📚', '⚖️', '📐', '📊', '🧠', '💻', '🔬', '🏛️', '🌍', '✍️'];

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  feasibility,
  selectedExamId,
  onSelectExam,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
}) => {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📚');
  const [newDate, setNewDate] = useState(addDays(getTodayISO(), 21));
  const [newColor, setNewColor] = useState<ExamColor>('blue');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newReviewDays, setNewReviewDays] = useState(3);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookPages, setNewBookPages] = useState(200);
  const [newBookPph, setNewBookPph] = useState(12);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const examId = `exam-${Date.now()}`;
    const books: Book[] = newBookTitle.trim()
      ? [
          {
            id: `book-${Date.now()}`,
            title: newBookTitle.trim(),
            totalPages: Math.max(1, newBookPages),
            completedPages: 0,
            pagesPerHour: Math.max(1, newBookPph),
          },
        ]
      : [
          {
            id: `book-${Date.now()}`,
            title: 'Testo principale',
            totalPages: Math.max(1, newBookPages),
            completedPages: 0,
            pagesPerHour: Math.max(1, newBookPph),
          },
        ];

    onAddExam({
      id: examId,
      name: newName.trim(),
      emoji: newEmoji,
      examDate: newDate,
      color: newColor,
      reviewDays: Math.max(0, newReviewDays),
      priority: newPriority,
      books,
      notes: '',
    });

    setNewName('');
    setNewBookTitle('');
    setCreating(false);
    onSelectExam(examId);
  };

  const handleAddBook = (exam: Exam) => {
    const updated: Exam = {
      ...exam,
      books: [
        ...exam.books,
        {
          id: `book-${Date.now()}`,
          title: 'Nuovo libro / dispensa',
          totalPages: 120,
          completedPages: 0,
          pagesPerHour: 12,
        },
      ],
    };
    onUpdateExam(updated);
  };

  const handleUpdateBook = (exam: Exam, bookId: string, patch: Partial<Book>) => {
    onUpdateExam({
      ...exam,
      books: exam.books.map((b) => (b.id === bookId ? { ...b, ...patch } : b)),
    });
  };

  const handleDeleteBook = (exam: Exam, bookId: string) => {
    onUpdateExam({
      ...exam,
      books: exam.books.filter((b) => b.id !== bookId),
    });
  };

  const sortedExams = [...exams].sort((a, b) => a.examDate.localeCompare(b.examDate));

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#9b9a97] uppercase tracking-wider">
            Database Materie
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#37352f] flex items-center gap-3 mt-1">
            <span>🎯</span>
            <span>Esami e Libri</span>
          </h1>
        </div>
        <button
          onClick={() => setCreating((c) => !c)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#2383e2] hover:bg-[#1a73cc] text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuovo esame</span>
        </button>
      </header>

      {/* New Exam Inline Form */}
      {creating && (
        <form
          onSubmit={handleCreateExam}
          className="rounded-lg border border-[#b9deee] bg-[#f7fafc] p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-[#37352f]">Aggiungi un nuovo esame</h2>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-[#787774] mb-1">Icona</label>
              <select
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-[#e2e1dd] bg-white text-sm"
              >
                {EMOJI_PRESETS.map((em) => (
                  <option key={em} value={em}>
                    {em}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-medium text-[#787774] mb-1">
                Nome esame
              </label>
              <input
                type="text"
                required
                placeholder="es. Storia Contemporanea"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-[#e2e1dd] bg-white text-sm focus:outline-none focus:border-[#2383e2]"
              />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-[#787774] mb-1">
                Data esame
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-[#e2e1dd] bg-white text-sm focus:outline-none focus:border-[#2383e2]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#787774] mb-1">Colore</label>
              <div className="flex items-center gap-1.5 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`w-5 h-5 rounded-full ${EXAM_COLORS[c].dot} ${
                      newColor === c ? 'ring-2 ring-offset-2 ring-[#37352f]' : 'opacity-70'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#787774] mb-1">
                Priorità
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="w-full px-2.5 py-1.5 rounded border border-[#e2e1dd] bg-white text-sm"
              >
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Bassa</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#787774] mb-1">
                Giorni di ripasso finale
              </label>
              <input
                type="number"
                min={0}
                max={14}
                value={newReviewDays}
                onChange={(e) => setNewReviewDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded border border-[#e2e1dd] bg-white text-sm"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#e2e1dd] grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-medium text-[#787774] mb-1">
                Primo libro / dispensa
              </label>
              <input
                type="text"
                placeholder="es. Manuale principale"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-[#e2e1dd] bg-white text-sm"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-[#787774] mb-1">
                Pagine totali
              </label>
              <input
                type="number"
                min={1}
                value={newBookPages}
                onChange={(e) => setNewBookPages(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded border border-[#e2e1dd] bg-white text-sm"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-[#787774] mb-1">
                Pagine / ora
              </label>
              <input
                type="number"
                min={1}
                value={newBookPph}
                onChange={(e) => setNewBookPph(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded border border-[#e2e1dd] bg-white text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="px-3 py-1.5 rounded text-xs font-medium text-[#787774] hover:bg-[#ebebea]"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#2383e2] text-white text-xs font-medium hover:bg-[#1a73cc]"
            >
              Crea esame e pianifica
            </button>
          </div>
        </form>
      )}

      {/* Exams List */}
      <div className="space-y-5">
        {sortedExams.map((exam) => {
          const feas = feasibility[exam.id];
          const color = EXAM_COLORS[exam.color];
          const isHighlighted = selectedExamId === exam.id;

          return (
            <div
              key={exam.id}
              className={`rounded-lg border transition-all bg-white overflow-hidden ${
                isHighlighted ? 'border-[#2383e2] ring-1 ring-[#2383e2]/20' : 'border-[#e9e9e7]'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-[#ecebe8] bg-[#fbfbfa] flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className="text-2xl mt-0.5">{exam.emoji}</span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={exam.name}
                        onChange={(e) => onUpdateExam({ ...exam, name: e.target.value })}
                        className="text-lg font-semibold text-[#37352f] bg-transparent border-b border-transparent hover:border-[#d3d1cb] focus:border-[#2383e2] focus:outline-none px-0.5"
                      />

                      {feas && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            feas.status === 'completed'
                              ? 'bg-[#edf3ec] text-[#356b46]'
                              : feas.status === 'behind'
                              ? 'bg-[#fdebec] text-[#9e3336]'
                              : feas.status === 'tight'
                              ? 'bg-[#fbf3db] text-[#8c5a12]'
                              : `${color.bg} ${color.text}`
                          }`}
                        >
                          {feas.status === 'completed' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : feas.status === 'behind' ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {feas.status === 'completed'
                            ? 'Completato'
                            : feas.status === 'behind'
                            ? `In ritardo (-${feas.unscheduledHours}h)`
                            : feas.status === 'tight'
                            ? 'Margine stretto'
                            : 'In pari'}
                        </span>
                      )}
                    </div>

                    {/* Properties Row (Notion-like inline properties) */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#5a5852]">
                      <label className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#9b9a97]" />
                        <span>Esame:</span>
                        <input
                          type="date"
                          value={exam.examDate}
                          onChange={(e) => onUpdateExam({ ...exam, examDate: e.target.value })}
                          className="bg-white border border-[#e2e1dd] rounded px-1.5 py-0.5 text-xs"
                        />
                        <span className="text-[#9b9a97]">
                          ({formatItalianDate(exam.examDate)})
                        </span>
                      </label>

                      <label className="flex items-center gap-1.5">
                        <span>Priorità:</span>
                        <select
                          value={exam.priority}
                          onChange={(e) =>
                            onUpdateExam({ ...exam, priority: e.target.value as Priority })
                          }
                          className="bg-white border border-[#e2e1dd] rounded px-1.5 py-0.5 text-xs"
                        >
                          <option value="high">Alta</option>
                          <option value="medium">Media</option>
                          <option value="low">Bassa</option>
                        </select>
                      </label>

                      <label className="flex items-center gap-1.5">
                        <span>Ripasso finale:</span>
                        <input
                          type="number"
                          min={0}
                          max={14}
                          value={exam.reviewDays}
                          onChange={(e) =>
                            onUpdateExam({ ...exam, reviewDays: Math.max(0, Number(e.target.value)) })
                          }
                          className="w-12 bg-white border border-[#e2e1dd] rounded px-1.5 py-0.5 text-xs tabular-nums"
                        />
                        <span>giorni</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteExam(exam.id)}
                  className="p-1.5 rounded text-[#9b9a97] hover:text-[#d44c47] hover:bg-[#fdebec] transition-colors"
                  title="Elimina esame"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Books Table */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#787774] uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Libri e Materiali</span>
                  </div>
                  {feas && (
                    <span className="text-xs text-[#787774] tabular-nums">
                      Restano {feas.remainingPages} pp. (~{feas.remainingStudyHours}h)
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {exam.books.map((book) => {
                    const pct =
                      book.totalPages > 0
                        ? Math.min(100, Math.round((book.completedPages / book.totalPages) * 100))
                        : 0;
                    return (
                      <div
                        key={book.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-2.5 rounded-md border border-[#ecebe8] bg-white hover:bg-[#fbfbfa]"
                      >
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            value={book.title}
                            onChange={(e) =>
                              handleUpdateBook(exam, book.id, { title: e.target.value })
                            }
                            className="w-full text-sm font-medium text-[#37352f] bg-transparent border-b border-transparent focus:border-[#2383e2] focus:outline-none"
                          />
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-[#efefed] overflow-hidden">
                              <div
                                className={`h-full ${color.progress}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-[#787774] tabular-nums">{pct}%</span>
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-[#9b9a97]">Fatte</label>
                          <input
                            type="number"
                            min={0}
                            max={book.totalPages}
                            value={book.completedPages}
                            onChange={(e) =>
                              handleUpdateBook(exam, book.id, {
                                completedPages: Math.min(
                                  book.totalPages,
                                  Math.max(0, Number(e.target.value))
                                ),
                              })
                            }
                            className="w-full px-2 py-1 rounded border border-[#e2e1dd] text-xs tabular-nums"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-[#9b9a97]">Totali</label>
                          <input
                            type="number"
                            min={1}
                            value={book.totalPages}
                            onChange={(e) =>
                              handleUpdateBook(exam, book.id, {
                                totalPages: Math.max(1, Number(e.target.value)),
                              })
                            }
                            className="w-full px-2 py-1 rounded border border-[#e2e1dd] text-xs tabular-nums"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-[#9b9a97]">Pagine / ora</label>
                          <input
                            type="number"
                            min={1}
                            value={book.pagesPerHour}
                            onChange={(e) =>
                              handleUpdateBook(exam, book.id, {
                                pagesPerHour: Math.max(1, Number(e.target.value)),
                              })
                            }
                            className="w-full px-2 py-1 rounded border border-[#e2e1dd] text-xs tabular-nums"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            onClick={() => handleDeleteBook(exam, book.id)}
                            className="p-1.5 rounded text-[#9b9a97] hover:text-[#d44c47] hover:bg-[#fdebec]"
                            title="Rimuovi libro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleAddBook(exam)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#787774] hover:text-[#37352f] px-2 py-1 rounded hover:bg-[#f1f1ef] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Aggiungi libro o dispensa</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

