import { DayPart, PartInfo, StartupProfile, TaskCategory } from '../types';

export const DAY_PARTS: Record<DayPart, PartInfo> = {
  MORNING: {
    id: 'MORNING',
    title: 'پارت ۱: صبح',
    subtitle: 'تمرکز عمیق و توسعه بنیادین',
    timeRange: '۰۷:۰۰ الی ۱۲:۰۰',
    startHour: 7,
    endHour: 12,
    iconName: 'Sun',
    focusArea: 'تمرکز عمیق، دروس سنگین دانشگاهی، معماری و توسعه هسته استارتاپ',
    accentColor: 'amber',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cardBg: 'from-amber-950/20 to-slate-900/90 border-amber-500/20'
  },
  MIDDAY: {
    id: 'MIDDAY',
    title: 'پارت ۲: ظهر',
    subtitle: 'کلاس‌ها، جلسات و تعاملات',
    timeRange: '۱۲:۰۰ الی ۱۶:۰۰',
    startHour: 12,
    endHour: 16,
    iconName: 'Building2',
    focusArea: 'کلاس‌های دانشگاه، جلسات تیم، هماهنگی و پیگیری‌های کاری',
    accentColor: 'sky',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    cardBg: 'from-sky-950/20 to-slate-900/90 border-sky-500/20'
  },
  EVENING: {
    id: 'EVENING',
    title: 'پارت ۳: عصر',
    subtitle: 'ورزش، انرژی و اسپرینت پروژه‌ها',
    timeRange: '۱۶:۰۰ الی ۲۰:۰۰',
    startHour: 16,
    endHour: 20,
    iconName: 'Dumbbell',
    focusArea: 'ورزش / باشگاه (۱۷:۰۰ الی ۱۸:۳۰)، پیگیری اسپرینت استارتاپ‌ها',
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cardBg: 'from-emerald-950/20 to-slate-900/90 border-emerald-500/20'
  },
  NIGHT: {
    id: 'NIGHT',
    title: 'پارت ۴: شب',
    subtitle: 'جمع‌بندی، یادگیری و بازیابی',
    timeRange: '۲۰:۰۰ الی ۲۴:۰۰',
    startHour: 20,
    endHour: 24,
    iconName: 'Moon',
    focusArea: 'جمع‌بندی روز، مطالعه آزاد، برنامه‌ریزی فردا، استراحت و خواب باکیفیت',
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    cardBg: 'from-indigo-950/20 to-slate-900/90 border-indigo-500/20'
  }
};

export const STARTUP_COLOR_PRESETS = [
  { name: 'نیلی فضایی (Indigo)', color: '#6366f1', label: 'Indigo' },
  { name: 'فیروزه‌ای نئون (Cyan)', color: '#06b6d4', label: 'Cyan' },
  { name: 'کهربایی طلایی (Amber)', color: '#f59e0b', label: 'Amber' },
  { name: 'سبز زمردی (Emerald)', color: '#10b981', label: 'Emerald' },
  { name: 'رز مرجانی (Rose)', color: '#f43f5e', label: 'Rose' },
  { name: 'بنفش سلطنتی (Purple)', color: '#a855f7', label: 'Purple' },
  { name: 'آبی اقیانوسی (Blue)', color: '#3b82f6', label: 'Blue' },
  { name: 'سبز دودی (Teal)', color: '#14b8a6', label: 'Teal' },
  { name: 'نارنجی اسپرینت (Orange)', color: '#f97316', label: 'Orange' },
  { name: 'سرخابی پرشور (Fuchsia)', color: '#d946ef', label: 'Fuchsia' },
  { name: 'سبز لیمویی (Lime)', color: '#84cc16', label: 'Lime' },
  { name: 'قرمز شعله‌ای (Red)', color: '#ef4444', label: 'Red' }
];

export const STARTUP_PROFILES: Record<string, StartupProfile> = {
  startup_1: {
    id: 'startup_1',
    name: 'زوپیت',
    englishName: 'Zopit',
    tagline: 'پلتفرم هوشمند خدمات آنلاین و لجستیک',
    stage: 'رشد اولیه (Growth)',
    color: '#6366f1',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    description: 'توسعه زیرساخت پردازش سفارشات و بهینه‌سازی الگوریتم‌های توزیع',
    keyMetrics: 'رشد ماهانه ۲۰٪، ۱۲ هزار کاربر فعال'
  },
  startup_2: {
    id: 'startup_2',
    name: 'مکتو',
    englishName: 'Makto',
    tagline: 'سامانه نوین تولید و نشر محتوای دانش‌بنیان',
    stage: 'اعتبارسنجی محصول (MVP)',
    color: '#06b6d4',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: 'معماری خط لوله محتوا، تست اولیه با ۱۰۰۰ کاربر آلفا',
    keyMetrics: 'نرخ تکمیل فرم‌های بازخورد ۷۴٪'
  },
  startup_3: {
    id: 'startup_3',
    name: 'کارر',
    englishName: 'Karer',
    tagline: 'شبکه حرفه‌ای مدیریت مهارت و استخدام تخصصی',
    stage: 'پیش‌بذری (Pre-Seed)',
    color: '#f59e0b',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'طراحی پروتوتایپ‌های اولیه و جذب سرمایه‌گذار فرشته',
    keyMetrics: '۳ قرارداد پایلوت با شرکت‌های همکار'
  },
  startup_4: {
    id: 'startup_4',
    name: 'سیویل مکس',
    englishName: 'CivilMax',
    tagline: 'نرم‌افزار جامع مدیریت پروژه‌های عمرانی و مهندسی',
    stage: 'مقیاس‌پذیری (Scaling)',
    color: '#10b981',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'ارتقای ماژول گزارش‌گیری مالی و هماهنگی با مهندسان ناظر',
    keyMetrics: '۸۵ کارگاه ساختمانی فعال در سامانه'
  }
};

export const CATEGORY_DEFINITIONS: Record<TaskCategory, { label: string; color: string; bg: string; text: string; border: string }> = {
  university: {
    label: 'دانشگاه',
    color: '#8b5cf6',
    bg: 'bg-purple-500/15',
    text: 'text-purple-300',
    border: 'border-purple-500/30'
  },
  startup_1: {
    label: 'استارتاپ زوپیت',
    color: '#6366f1',
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-300',
    border: 'border-indigo-500/30'
  },
  startup_2: {
    label: 'استارتاپ مکتو',
    color: '#06b6d4',
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-300',
    border: 'border-cyan-500/30'
  },
  startup_3: {
    label: 'استارتاپ کارر',
    color: '#f59e0b',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30'
  },
  startup_4: {
    label: 'استارتاپ سیویل مکس',
    color: '#10b981',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30'
  },
  job: {
    label: 'شغل / پروژه',
    color: '#3b82f6',
    bg: 'bg-blue-500/15',
    text: 'text-blue-300',
    border: 'border-blue-500/30'
  },
  home: {
    label: 'خانه / روزمره',
    color: '#ec4899',
    bg: 'bg-pink-500/15',
    text: 'text-pink-300',
    border: 'border-pink-500/30'
  },
  personal: {
    label: 'شخصی / سلامت',
    color: '#14b8a6',
    bg: 'bg-teal-500/15',
    text: 'text-teal-300',
    border: 'border-teal-500/30'
  }
};

// Dynamic Category Style Resolver that honors customized Startup Colors
export function getCategoryStyles(
  category: TaskCategory,
  startups?: Record<string, StartupProfile>
): {
  label: string;
  color: string;
  bg: string;
  text: string;
  border: string;
  customStyle?: {
    color: string;
    backgroundColor: string;
    borderColor: string;
  };
} {
  const defaultDef = CATEGORY_DEFINITIONS[category] || CATEGORY_DEFINITIONS.personal;

  if (category.startsWith('startup_') && startups && startups[category]) {
    const s = startups[category];
    const customHex = s.color || defaultDef.color;
    return {
      label: s.name ? `استارتاپ ${s.name}` : defaultDef.label,
      color: customHex,
      bg: defaultDef.bg,
      text: defaultDef.text,
      border: defaultDef.border,
      customStyle: {
        color: customHex,
        backgroundColor: `${customHex}1a`, // 10% opacity
        borderColor: `${customHex}4d` // 30% opacity
      }
    };
  }

  return defaultDef;
}

export const PRIORITY_CONFIG = {
  LOW: { label: 'عادی', color: 'text-slate-400', bg: 'bg-slate-800 border-slate-700' },
  MEDIUM: { label: 'متوسط', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-600/30' },
  HIGH: { label: 'فوری و مهم', color: 'text-rose-400 font-bold', bg: 'bg-rose-950/50 border-rose-500/40' }
};

export const MOOD_CONFIG = {
  energetic: { label: 'پرانرژی', icon: '💖', color: 'from-pink-500 to-rose-500' },
  focused: { label: 'متمرکز', icon: '🎯', color: 'from-indigo-500 to-blue-500' },
  productive: { label: 'پرکار', icon: '⚡', color: 'from-amber-500 to-yellow-500' },
  calm: { label: 'آرام', icon: '🌿', color: 'from-emerald-500 to-teal-500' },
  tired: { label: 'استراحت', icon: '☕', color: 'from-orange-500 to-stone-500' }
};
