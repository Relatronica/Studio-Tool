import { ExamColor } from '../types';

export interface ColorStyle {
  label: string;
  bg: string;
  bgSubtle: string;
  text: string;
  border: string;
  dot: string;
  progress: string;
}

export const EXAM_COLORS: Record<ExamColor, ColorStyle> = {
  blue: {
    label: 'Blu',
    bg: 'bg-[#e7f3f8]',
    bgSubtle: 'bg-[#f2f8fb]',
    text: 'text-[#1b658a]',
    border: 'border-[#b9deee]',
    dot: 'bg-[#2383e2]',
    progress: 'bg-[#2383e2]',
  },
  purple: {
    label: 'Viola',
    bg: 'bg-[#f4f0f7]',
    bgSubtle: 'bg-[#f9f6fb]',
    text: 'text-[#6940a5]',
    border: 'border-[#ddd1eb]',
    dot: 'bg-[#9065b0]',
    progress: 'bg-[#9065b0]',
  },
  green: {
    label: 'Verde',
    bg: 'bg-[#edf3ec]',
    bgSubtle: 'bg-[#f5f9f4]',
    text: 'text-[#356b46]',
    border: 'border-[#c8decb]',
    dot: 'bg-[#448361]',
    progress: 'bg-[#448361]',
  },
  amber: {
    label: 'Ambra',
    bg: 'bg-[#fbf3db]',
    bgSubtle: 'bg-[#fdf9ec]',
    text: 'text-[#8c5a12]',
    border: 'border-[#eedba5]',
    dot: 'bg-[#d99b26]',
    progress: 'bg-[#d99b26]',
  },
  rose: {
    label: 'Rosa',
    bg: 'bg-[#fdebec]',
    bgSubtle: 'bg-[#fef5f5]',
    text: 'text-[#9e3336]',
    border: 'border-[#f4c7c9]',
    dot: 'bg-[#d44c47]',
    progress: 'bg-[#d44c47]',
  },
  teal: {
    label: 'Ottanio',
    bg: 'bg-[#e6f5f3]',
    bgSubtle: 'bg-[#f2faf9]',
    text: 'text-[#1f6b64]',
    border: 'border-[#b5e1dc]',
    dot: 'bg-[#2b9389]',
    progress: 'bg-[#2b9389]',
  },
  indigo: {
    label: 'Indaco',
    bg: 'bg-[#eef0fb]',
    bgSubtle: 'bg-[#f6f7fd]',
    text: 'text-[#3d4899]',
    border: 'border-[#c8cef0]',
    dot: 'bg-[#4f5bd5]',
    progress: 'bg-[#4f5bd5]',
  },
  orange: {
    label: 'Arancio',
    bg: 'bg-[#faebdd]',
    bgSubtle: 'bg-[#fdf5ed]',
    text: 'text-[#9c4c14]',
    border: 'border-[#f2cba7]',
    dot: 'bg-[#d9730d]',
    progress: 'bg-[#d9730d]',
  },
};

export const COLOR_OPTIONS = Object.keys(EXAM_COLORS) as ExamColor[];

