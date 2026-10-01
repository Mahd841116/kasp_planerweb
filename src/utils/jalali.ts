/**
 * Accurate Jalali (Shamsi) Date Utilities for Partban
 */

export interface JalaliDateObj {
  year: number;
  month: number; // 1 to 12
  day: number; // 1 to 31
}

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
];

export const PERSIAN_WEEKDAY_NAMES = [
  'شنبه',
  'یک‌شنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه'
];

export const PERSIAN_WEEKDAY_SHORT = [
  'ش',
  'ی',
  'د',
  'س',
  'چ',
  'پ',
  'ج'
];

// Convert Gregorian to Jalali
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDateObj {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  let jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { year: jy, month: jm, day: jd };
}

// Convert Jalali to Gregorian
export function jalaliToGregorian(jy: number, jm: number, jd: number): { year: number; month: number; day: number } {
  let jy2 = jy + 1595;
  let days = -355668 + (365 * jy2) + (Math.floor(jy2 / 33) * 8) + Math.floor(((jy2 % 33) + 3) / 4) + jd + ((jm < 7) ? ((jm - 1) * 31) : (((jm - 7) * 30) + 186));
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 13 && days >= sal_a[gm]) {
    days -= sal_a[gm];
    gm++;
  }
  return { year: gy, month: gm, day: days + 1 };
}

// Is Jalali year a leap year
export function isJalaliLeapYear(jy: number): boolean {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  let bl = breaks.length;
  let jp = breaks[0];
  let jump = 0;
  if (jy < jp || jy >= breaks[bl - 1]) return false;
  for (let i = 1; i < bl; i++) {
    let jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    jp = jm;
  }
  let n = jy - jp;
  if (jump - n < 6) n = n - jump + Math.floor((jump + 4) / 33) * 33;
  let leap = ((((n + 1) % 33) - 1) % 4);
  if (leap === -1) leap = 4;
  return leap === 0;
}

// Days in a specific Jalali month
export function getDaysInJalaliMonth(year: number, month: number): number {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
}

// Get current Jalali date string "YYYY-MM-DD"
export function getTodayJalali(): string {
  const now = new Date();
  const j = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return formatJalaliDate(j.year, j.month, j.day);
}

// Format YYYY-MM-DD
export function formatJalaliDate(year: number, month: number, day: number): string {
  const m = month < 10 ? `0${month}` : `${month}`;
  const d = day < 10 ? `0${day}` : `${day}`;
  return `${year}-${m}-${d}`;
}

// Parse string "1405-07-08" to object
export function parseJalaliDate(dateStr: string): JalaliDateObj {
  if (!dateStr || !dateStr.includes('-')) {
    return { year: 1405, month: 7, day: 8 };
  }
  const parts = dateStr.split('-').map(Number);
  return {
    year: parts[0] || 1405,
    month: parts[1] || 1,
    day: parts[2] || 1
  };
}

// Get previous Jalali month
export function getPreviousMonthJalali(year: number, month: number): { year: number; month: number } {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}

// Get next Jalali month
export function getNextMonthJalali(year: number, month: number): { year: number; month: number } {
  if (month === 12) {
    return { year: year + 1, month: 1 };
  }
  return { year, month: month + 1 };
}

// Get date range string for full Jalali month
export function getMonthDateRange(year: number, month: number): { start: string; end: string; daysCount: number } {
  const daysCount = getDaysInJalaliMonth(year, month);
  const start = formatJalaliDate(year, month, 1);
  const end = formatJalaliDate(year, month, daysCount);
  return { start, end, daysCount };
}

// Get day of week index (0: شنبه, 1: یکشنبه, ..., 6: جمعه)
export function getJalaliDayOfWeek(year: number, month: number, day: number): number {
  const g = jalaliToGregorian(year, month, day);
  const date = new Date(g.year, g.month - 1, g.day);
  // JS getDay(): 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  // In Persian calendar: Saturday is 0, Sunday is 1, ..., Friday is 6
  const jsDay = date.getDay();
  const persianDay = (jsDay + 1) % 7;
  return persianDay;
}

// Full descriptive Persian date string e.g. "چهارشنبه، ۸ مهر ۱۴۰۵"
export function getPersianFullDate(dateStr: string): string {
  const { year, month, day } = parseJalaliDate(dateStr);
  const dayOfWeek = getJalaliDayOfWeek(year, month, day);
  const weekName = PERSIAN_WEEKDAY_NAMES[dayOfWeek];
  const monthName = PERSIAN_MONTH_NAMES[month - 1];
  return `${weekName}، ${toPersianDigits(day)} ${monthName} ${toPersianDigits(year)}`;
}

// Relative human day label e.g. "امروز", "فردا", "دیروز", or full date
export function getRelativeDayLabel(dateStr: string): string {
  const today = getTodayJalali();
  if (dateStr === today) return 'امروز';
  
  const tomorrow = addDaysToJalali(today, 1);
  if (dateStr === tomorrow) return 'فردا';

  const yesterday = addDaysToJalali(today, -1);
  if (dateStr === yesterday) return 'دیروز';

  const { day, month } = parseJalaliDate(dateStr);
  return `${toPersianDigits(day)} ${PERSIAN_MONTH_NAMES[month - 1]}`;
}

// Add/subtract days from Jalali date string
export function addDaysToJalali(dateStr: string, daysToAdd: number): string {
  const { year, month, day } = parseJalaliDate(dateStr);
  const g = jalaliToGregorian(year, month, day);
  const d = new Date(g.year, g.month - 1, g.day);
  d.setDate(d.getDate() + daysToAdd);
  const j = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return formatJalaliDate(j.year, j.month, j.day);
}

// Convert English numbers to Persian digits
export function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num
    .toString()
    .replace(/\d/g, (x) => persianDigits[parseInt(x, 10)]);
}

// Convert Persian digits to English digits
export function toEnglishDigits(str: string): string {
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replace(persianDigits[i], i.toString());
  }
  return res;
}

// Determine active DayPart based on current clock hour (00-23)
export function getCurrentActivePart(): 'MORNING' | 'MIDDAY' | 'EVENING' | 'NIGHT' {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 12) return 'MORNING';
  if (hour >= 12 && hour < 16) return 'MIDDAY';
  if (hour >= 16 && hour < 20) return 'EVENING';
  return 'NIGHT'; // 20:00 to 07:00 next day
}
