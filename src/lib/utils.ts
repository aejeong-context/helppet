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

/**
 * Asia/Seoul (KST, UTC+9) 기준 날짜 포매터.
 * 한국 단일 시장 가정. 다국가 지원 시 사용자 timezone 필드로 확장.
 */
const KST_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * KST 기준 오늘 날짜를 YYYY-MM-DD 형식으로 반환.
 */
export function getToday(): string {
  return KST_FORMATTER.format(new Date());
}

/**
 * KST 기준 n일 전 날짜를 YYYY-MM-DD 형식으로 반환.
 * @param days - 0 이상의 정수. 0이면 오늘과 동일.
 */
export function getDaysAgo(days: number): string {
  const [y, m, d] = getToday().split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d - days));
  return KST_FORMATTER.format(date);
}

/**
 * KST 기준 n년 전 (같은 월/일) 날짜를 YYYY-MM-DD 형식으로 반환.
 * birthDate fallback 등 연도 기반 계산에 사용.
 */
export function getYearsAgo(years: number): string {
  const [y, m, d] = getToday().split('-').map(Number);
  return `${y - years}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
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
