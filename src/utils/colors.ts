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
    bg: 'bg-[#e7f3f8] dark:bg-[#1b3344]',
    bgSubtle: 'bg-[#f2f8fb] dark:bg-[#172834]',
    text: 'text-[#1b658a] dark:text-[#6cb6dc]',
    border: 'border-[#b9deee] dark:border-[#264b63]',
    dot: 'bg-[#2383e2]',
    progress: 'bg-[#2383e2]',
  },
  purple: {
    label: 'Viola',
    bg: 'bg-[#f4f0f7] dark:bg-[#2d233a]',
    bgSubtle: 'bg-[#f9f6fb] dark:bg-[#241c2e]',
    text: 'text-[#6940a5] dark:text-[#b48ee8]',
    border: 'border-[#ddd1eb] dark:border-[#433359]',
    dot: 'bg-[#9065b0]',
    progress: 'bg-[#9065b0]',
  },
  green: {
    label: 'Verde',
    bg: 'bg-[#edf3ec] dark:bg-[#1e3326]',
    bgSubtle: 'bg-[#f5f9f4] dark:bg-[#18281e]',
    text: 'text-[#356b46] dark:text-[#6cc08a]',
    border: 'border-[#c8decb] dark:border-[#2c4d38]',
    dot: 'bg-[#448361]',
    progress: 'bg-[#448361]',
  },
  amber: {
    label: 'Ambra',
    bg: 'bg-[#fbf3db] dark:bg-[#382d16]',
    bgSubtle: 'bg-[#fdf9ec] dark:bg-[#2b2212]',
    text: 'text-[#8c5a12] dark:text-[#e6b450]',
    border: 'border-[#eedba5] dark:border-[#544320]',
    dot: 'bg-[#d99b26]',
    progress: 'bg-[#d99b26]',
  },
  rose: {
    label: 'Rosa',
    bg: 'bg-[#fdebec] dark:bg-[#3b2022]',
    bgSubtle: 'bg-[#fef5f5] dark:bg-[#2e191b]',
    text: 'text-[#9e3336] dark:text-[#eb7c7f]',
    border: 'border-[#f4c7c9] dark:border-[#592e31]',
    dot: 'bg-[#d44c47]',
    progress: 'bg-[#d44c47]',
  },
  teal: {
    label: 'Ottanio',
    bg: 'bg-[#e6f5f3] dark:bg-[#193532]',
    bgSubtle: 'bg-[#f2faf9] dark:bg-[#142927]',
    text: 'text-[#1f6b64] dark:text-[#5cc7bc]',
    border: 'border-[#b5e1dc] dark:border-[#254f4b]',
    dot: 'bg-[#2b9389]',
    progress: 'bg-[#2b9389]',
  },
  indigo: {
    label: 'Indaco',
    bg: 'bg-[#eef0fb] dark:bg-[#222640]',
    bgSubtle: 'bg-[#f6f7fd] dark:bg-[#1b1e33]',
    text: 'text-[#3d4899] dark:text-[#8b96e8]',
    border: 'border-[#c8cef0] dark:border-[#343b63]',
    dot: 'bg-[#4f5bd5]',
    progress: 'bg-[#4f5bd5]',
  },
  orange: {
    label: 'Arancio',
    bg: 'bg-[#faebdd] dark:bg-[#3a2515]',
    bgSubtle: 'bg-[#fdf5ed] dark:bg-[#2d1d11]',
    text: 'text-[#9c4c14] dark:text-[#eba063]',
    border: 'border-[#f2cba7] dark:border-[#59381e]',
    dot: 'bg-[#d9730d]',
    progress: 'bg-[#d9730d]',
  },
};

export const COLOR_OPTIONS = Object.keys(EXAM_COLORS) as ExamColor[];
