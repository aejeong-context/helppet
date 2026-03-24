import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (years < 1) return `${months + (years * 12)}개월`;
  if (months < 0) return `${years - 1}세`;
  return `${years}세`;
}

export const CONDITION_CATEGORIES = {
  joint: '관절',
  heart: '심장',
  kidney: '신장',
  tumor: '종양',
  'senior-care': '노견케어',
  'hospital-review': '병원후기',
  general: '일반',
} as const;

export const CONDITION_LABELS = {
  appetite: '식욕',
  activity: '활동량',
  pain: '통증',
  mood: '기분',
} as const;
