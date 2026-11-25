import {
  Exam,
  ExamFeasibility,
  PlannerSettings,
  Priority,
  ScheduleResult,
  StudyBlock,
} from '../types';
import { addDays, diffDays, getTodayISO, parseISODate } from './dateUtils';

const PRIORITY_WEIGHT: Record<Priority, number> = {
  high: 1.35,
  medium: 1.0,
  low: 0.75,
};

interface BookCursor {
  bookId: string;
  title: string;
  totalPages: number;
  nextPage: number;
  pagesPerHour: number;
}

export function generateSchedule(
  exams: Exam[],
  settings: PlannerSettings,
  existingBlocks: StudyBlock[],
  startDateISO: string = getTodayISO()
): ScheduleResult {
  // Keep completed blocks as immutable history
  const completedBlocks = existingBlocks.filter((b) => b.completed);

  if (exams.length === 0) {
    return { blocks: completedBlocks, feasibility: {} };
  }

  // Build mutable cursors for each exam's books
  const examCursors = new Map<string, BookCursor[]>();
  for (const exam of exams) {
    examCursors.set(
      exam.id,
      exam.books.map((b) => ({
        bookId: b.id,
        title: b.title,
        totalPages: b.totalPages,
        nextPage: Math.min(b.totalPages + 1, b.completedPages + 1),
        pagesPerHour: Math.max(1, b.pagesPerHour),
      }))
    );
  }

  const getExamRemainingHours = (examId: string): number => {
    const cursors = examCursors.get(examId) ?? [];
    return cursors.reduce((acc, c) => {
      const remPages = Math.max(0, c.totalPages - c.nextPage + 1);
      return acc + remPages / c.pagesPerHour;
    }, 0);
  };

  // Find furthest exam date
  const maxExamDate = exams.reduce(
    (max, e) => (e.examDate > max ? e.examDate : max),
    startDateISO
  );

  const totalHorizonDays = Math.max(0, diffDays(startDateISO, maxExamDate));
  const blockedSet = new Set(settings.blockedDates);
  const generatedBlocks: StudyBlock[] = [];
  let blockCounter = 1;

  for (let offset = 0; offset <= totalHorizonDays; offset++) {
    const currentDate = addDays(startDateISO, offset);
    if (blockedSet.has(currentDate)) continue;

    const dayOfWeek = parseISODate(currentDate).getDay();
    const baseHours = settings.weeklyAvailability[dayOfWeek] ?? 0;

    // Subtract hours already completed on this date
    const completedHoursToday = completedBlocks
      .filter((b) => b.date === currentDate)
      .reduce((sum, b) => sum + b.plannedHours, 0);

    let remainingDayHours = Math.max(0, baseHours - completedHoursToday);
    if (remainingDayHours < 0.25) continue;

    // Determine active exams for this day
    const activeExams = exams.filter((e) => e.examDate > currentDate);
    if (activeExams.length === 0) continue;

    // Score exams by urgency & review status
    interface Candidate {
      exam: Exam;
      mode: 'study' | 'review';
      remainingHours: number;
      score: number;
    }

    const candidates: Candidate[] = [];

    for (const exam of activeExams) {
      const daysLeft = Math.max(1, diffDays(currentDate, exam.examDate));
      const remHours = getExamRemainingHours(exam.id);
      const inReviewWindow = daysLeft <= exam.reviewDays;

      if (remHours > 0.05) {
        // Still has pages to study. Prefer finishing before review window,
        // but if already inside review window and pages remain, keep studying!
        const effectiveStudyDays = Math.max(1, daysLeft - (inReviewWindow ? 0 : exam.reviewDays));
        const urgency = remHours / effectiveStudyDays;
        const score = urgency * PRIORITY_WEIGHT[exam.priority] * (inReviewWindow ? 1.5 : 1);
        candidates.push({ exam, mode: 'study', remainingHours: remHours, score });
      } else if (inReviewWindow) {
        // Pages are done and we are in the review window
        const alreadyReviewedToday = completedBlocks.some(
          (b) => b.date === currentDate && b.examId === exam.id && b.type === 'review'
        );
        if (!alreadyReviewedToday) {
          candidates.push({
            exam,
            mode: 'review',
            remainingHours: Math.min(1.5, remainingDayHours),
            score: 0.45 * PRIORITY_WEIGHT[exam.priority],
          });
        }
      }
    }

    candidates.sort((a, b) => b.score - a.score);

    // Allocate blocks for this day (up to maxBlockHours per exam to keep variety when multiple exams exist)
    const usedExamToday = new Set<string>();
    let pass = 0;

    while (remainingDayHours >= 0.25 && candidates.length > 0 && pass < 3) {
      let allocatedAny = false;

      for (const cand of candidates) {
        if (remainingDayHours < 0.25) break;
        if (pass === 0 && usedExamToday.has(cand.exam.id)) continue;

        if (cand.mode === 'study') {
          const currentRem = getExamRemainingHours(cand.exam.id);
          if (currentRem <= 0.02) continue;

          const cap =
            candidates.length > 1 && pass === 0
              ? settings.maxBlockHours
              : remainingDayHours;

          const rawAlloc = Math.min(remainingDayHours, currentRem, cap);
          const allocHours = Math.round(rawAlloc * 4) / 4;
          if (allocHours < 0.25 && currentRem >= 0.25) continue;

          const effectiveAlloc = Math.max(0.25, allocHours);
          const cursors = examCursors.get(cand.exam.id) ?? [];
          let hoursLeftForBlock = effectiveAlloc;

          for (const cursor of cursors) {
            if (hoursLeftForBlock <= 0.02) break;
            const remPages = cursor.totalPages - cursor.nextPage + 1;
            if (remPages <= 0) continue;

            const pagesCanRead = Math.min(
              remPages,
              Math.max(1, Math.round(hoursLeftForBlock * cursor.pagesPerHour))
            );
            const actualHours = Math.min(
              remainingDayHours,
              Math.max(0.25, Math.round((pagesCanRead / cursor.pagesPerHour) * 4) / 4)
            );

            const startPage = cursor.nextPage;
            const endPage = cursor.nextPage + pagesCanRead - 1;
            cursor.nextPage = endPage + 1;

            generatedBlocks.push({
              id: `gen-${currentDate}-${blockCounter++}`,
              date: currentDate,
              examId: cand.exam.id,
              bookId: cursor.bookId,
              type: 'study',
              title: `${cursor.title} • pp. ${startPage}–${endPage}`,
              startPage,
              endPage,
              plannedHours: actualHours,
              completed: false,
            });

            remainingDayHours = Math.max(0, remainingDayHours - actualHours);
            hoursLeftForBlock = Math.max(0, hoursLeftForBlock - actualHours);
            usedExamToday.add(cand.exam.id);
            allocatedAny = true;
          }
        } else if (cand.mode === 'review' && !usedExamToday.has(cand.exam.id)) {
          const allocHours = Math.min(
            remainingDayHours,
            1.5,
            Math.max(0.5, Math.round(remainingDayHours * 2) / 2)
          );
          if (allocHours >= 0.5) {
            generatedBlocks.push({
              id: `gen-${currentDate}-${blockCounter++}`,
              date: currentDate,
              examId: cand.exam.id,
              type: 'review',
              title: `Ripasso & Simulazione d'esame`,
              plannedHours: allocHours,
              completed: false,
            });
            remainingDayHours = Math.max(0, remainingDayHours - allocHours);
            usedExamToday.add(cand.exam.id);
            allocatedAny = true;
          }
        }
      }

      if (!allocatedAny) break;
      pass++;
    }
  }

  // Compute feasibility per exam
  const feasibility: Record<string, ExamFeasibility> = {};
  for (const exam of exams) {
    const totalPages = exam.books.reduce((s, b) => s + b.totalPages, 0);
    const completedPages = exam.books.reduce((s, b) => s + b.completedPages, 0);
    const remainingPages = Math.max(0, totalPages - completedPages);
    const remainingStudyHours = exam.books.reduce(
      (s, b) => s + Math.max(0, b.totalPages - b.completedPages) / Math.max(1, b.pagesPerHour),
      0
    );
    const unscheduledHours = Math.round(getExamRemainingHours(exam.id) * 10) / 10;
    const daysUntilExam = diffDays(startDateISO, exam.examDate);

    let status: ExamFeasibility['status'] = 'on-track';
    if (remainingPages === 0) {
      status = 'completed';
    } else if (unscheduledHours > 0.2) {
      status = 'behind';
    } else {
      // Check if study spills into reviewDays
      const lastStudyBlock = generatedBlocks
        .filter((b) => b.examId === exam.id && b.type === 'study')
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      if (lastStudyBlock && diffDays(lastStudyBlock.date, exam.examDate) <= exam.reviewDays) {
        status = 'tight';
      }
    }

    feasibility[exam.id] = {
      examId: exam.id,
      totalPages,
      completedPages,
      remainingPages,
      remainingStudyHours: Math.round(remainingStudyHours * 10) / 10,
      unscheduledHours,
      daysUntilExam,
      status,
    };
  }

  const allBlocks = [...completedBlocks, ...generatedBlocks].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return { blocks: allBlocks, feasibility };
}

