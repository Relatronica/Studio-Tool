export type ExamColor =
  | 'blue'
  | 'purple'
  | 'green'
  | 'amber'
  | 'rose'
  | 'teal'
  | 'indigo'
  | 'orange';

export type Priority = 'high' | 'medium' | 'low';

export interface Book {
  id: string;
  title: string;
  totalPages: number;
  completedPages: number;
  pagesPerHour: number;
}

export interface Exam {
  id: string;
  name: string;
  emoji: string;
  examDate: string; // YYYY-MM-DD
  color: ExamColor;
  reviewDays: number;
  priority: Priority;
  books: Book[];
  notes?: string;
}

export type WeeklyAvailability = Record<number, number>; // 0 (Sun) .. 6 (Sat) -> hours

export interface PlannerSettings {
  weeklyAvailability: WeeklyAvailability;
  blockedDates: string[]; // YYYY-MM-DD
  maxBlockHours: number;
}

export interface StudyBlock {
  id: string;
  date: string; // YYYY-MM-DD
  examId: string;
  bookId?: string;
  type: 'study' | 'review';
  title: string;
  startPage?: number;
  endPage?: number;
  plannedHours: number;
  completed: boolean;
}

export interface ExamFeasibility {
  examId: string;
  totalPages: number;
  completedPages: number;
  remainingPages: number;
  remainingStudyHours: number;
  unscheduledHours: number;
  daysUntilExam: number;
  status: 'completed' | 'on-track' | 'tight' | 'behind';
}

export interface ScheduleResult {
  blocks: StudyBlock[];
  feasibility: Record<string, ExamFeasibility>;
}

