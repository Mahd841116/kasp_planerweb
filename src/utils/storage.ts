import { Goal, StartupProfile, Task, UniversityCourse, DayNote, DayPart, TaskCategory, Habit } from '../types';
import { getTodayJalali, addDaysToJalali, parseJalaliDate } from './jalali';
import { STARTUP_PROFILES } from './constants';

const STORAGE_KEYS = {
  TASKS: 'casp_tasks_v2',
  GOALS: 'casp_goals_v2',
  COURSES: 'casp_courses_v2',
  STARTUPS: 'casp_startups_v2',
  DAY_NOTES: 'casp_day_notes_v2',
  HABITS: 'casp_habits_v2',
  SETTINGS: 'casp_settings_v2'
};

export function getInitialHabits(): Habit[] {
  const today = getTodayJalali();
  const d1 = addDaysToJalali(today, -1);
  const d2 = addDaysToJalali(today, -2);
  const d3 = addDaysToJalali(today, -3);

  return [
    {
      id: 'h-1',
      title: 'ورزش و حرکات کششی صبحگاهی',
      description: 'حداقل ۳۰ دقیقه تمرین بدنی، یوگا یا پیاده‌روی سریع',
      category: 'personal',
      targetPart: 'MORNING',
      icon: 'Dumbbell',
      color: '#10b981',
      streak: 4,
      completedDates: [d3, d2, d1, today],
      targetDaysPerWeek: 6,
      createdAt: new Date().toISOString()
    },
    {
      id: 'h-2',
      title: 'تمرکز عمیق بدون موبایل (Deep Work)',
      description: 'حداقل ۹۰ دقیقه کدنویسی یا توسعه هسته بدون نوتیفیکیشن',
      category: 'startup_1',
      targetPart: 'MORNING',
      icon: 'Zap',
      color: '#6366f1',
      streak: 3,
      completedDates: [d2, d1, today],
      targetDaysPerWeek: 5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'h-3',
      title: 'مطالعه تخصصی و مرور مقالات روز',
      description: '۳۰ دقیقه مطالعه کتاب‌های مدیریت، مهندسی نرم‌افزار یا هوش مصنوعی',
      category: 'university',
      targetPart: 'NIGHT',
      icon: 'BookOpen',
      color: '#8b5cf6',
      streak: 5,
      completedDates: [d3, d2, d1],
      targetDaysPerWeek: 7,
      createdAt: new Date().toISOString()
    },
    {
      id: 'h-4',
      title: 'نوشیدن ۸ لیوان آب و هیدراتاسیون',
      description: 'سلامت جسمانی و حفظ تمرکز در طول ۴ پارت روزانه',
      category: 'personal',
      targetPart: 'EVENING',
      icon: 'Droplets',
      color: '#06b6d4',
      streak: 2,
      completedDates: [d1, today],
      targetDaysPerWeek: 7,
      createdAt: new Date().toISOString()
    },
    {
      id: 'h-5',
      title: 'جمع‌بندی روز و ثبت گزارش پارت ۴',
      description: 'مرور اهداف محقق‌شده، شکرگزاری و آماده‌سازی تسک‌های فردا',
      category: 'personal',
      targetPart: 'NIGHT',
      icon: 'Moon',
      color: '#f59e0b',
      streak: 4,
      completedDates: [d3, d2, d1],
      targetDaysPerWeek: 7,
      createdAt: new Date().toISOString()
    }
  ];
}

// Seed initial realistic data with 30-day history
export function getInitialTasks(): Task[] {
  const today = getTodayJalali();
  const yesterday = addDaysToJalali(today, -1);
  const tomorrow = addDaysToJalali(today, 1);

  const initialTasks: Task[] = [
    // Today Part 1 - Morning
    {
      id: 't-1',
      title: 'طراحی معماری میکروسرویس دیتابیس زوپیت',
      description: 'طراحی اسکیما و کوئری‌های بهینه برای مدیریت سفارشات پرترافیک در PostgreSQL و کش Redis',
      jalaliDate: today,
      part: 'MORNING',
      startTime: '07:30',
      endTime: '09:30',
      category: 'startup_1',
      priority: 'HIGH',
      isCompleted: true,
      isDeferred: false,
      hasAlarm: true,
      reminderTime: '07:25',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    },
    {
      id: 't-2',
      title: 'مطالعه و حل تمرینات الگوریتم پیشرفته دانشگاه',
      description: 'فصل ۴ کتاب طراحی الگوریتم: الگوریتم‌های حریصانه و گراف‌های جهت‌دار فصلی',
      jalaliDate: today,
      part: 'MORNING',
      startTime: '10:00',
      endTime: '11:45',
      category: 'university',
      priority: 'MEDIUM',
      isCompleted: false,
      isDeferred: false,
      hasAlarm: false,
      createdAt: new Date().toISOString()
    },
    // Today Part 2 - Midday
    {
      id: 't-3',
      title: 'کلاس آنلاین هوش مصنوعی و یادگیری ماشین',
      description: 'جلسه حل تمرین شبکه‌های عصبی عمیق در تالار مجازی با دکتر رضایی',
      jalaliDate: today,
      part: 'MIDDAY',
      startTime: '12:30',
      endTime: '14:30',
      category: 'university',
      priority: 'HIGH',
      isCompleted: true,
      isDeferred: false,
      hasAlarm: true,
      reminderTime: '12:20',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    },
    {
      id: 't-4',
      title: 'جلسه هماهنگی و همگام‌سازی تیم مکتو با مدیر محصول',
      description: 'بررسی شاخص‌های کلیدی فیدبک کاربران در مرحله MVP و اولویت‌بندی باگ‌های گزارش‌شده',
      jalaliDate: today,
      part: 'MIDDAY',
      startTime: '15:00',
      endTime: '15:50',
      category: 'startup_2',
      priority: 'MEDIUM',
      isCompleted: false,
      isDeferred: false,
      hasAlarm: true,
      reminderTime: '14:55',
      createdAt: new Date().toISOString()
    },
    // Today Part 3 - Evening
    {
      id: 't-5',
      title: 'ورزش و تمرینات قدرتی در باشگاه',
      description: 'تمرین سینه و سرشانه + ۲۰ دقیقه هوازی پرفشار و حرکات کششی انعطاف‌پذیری',
      jalaliDate: today,
      part: 'EVENING',
      startTime: '17:00',
      endTime: '18:30',
      category: 'personal',
      priority: 'HIGH',
      isCompleted: false,
      isDeferred: false,
      hasAlarm: true,
      reminderTime: '16:45',
      createdAt: new Date().toISOString()
    },
    {
      id: 't-6',
      title: 'اسپرینت توسعه ماژول مالی سیویل مکس',
      description: 'پیاده‌سازی کامپوننت گزارش صورت‌وضعیت مهندسی کارگاهی با کتابخانه React',
      jalaliDate: today,
      part: 'EVENING',
      startTime: '18:45',
      endTime: '19:55',
      category: 'startup_4',
      priority: 'MEDIUM',
      isCompleted: false,
      isDeferred: false,
      hasAlarm: false,
      createdAt: new Date().toISOString()
    },
    // Today Part 4 - Night
    {
      id: 't-7',
      title: 'مطالعه ۳۰ صفحه کتاب «طراحی تجربه کاربری داده‌محور»',
      description: 'فصل ۵: روش‌های تست کاربردپذیری با کاربران واقعی بدون نیاز به ابزارهای پرهزینه',
      jalaliDate: today,
      part: 'NIGHT',
      startTime: '20:30',
      endTime: '21:30',
      category: 'personal',
      priority: 'LOW',
      isCompleted: false,
      isDeferred: false,
      hasAlarm: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 't-8',
      title: 'جمع‌بندی دستاوردهای روز و چیدمان پارت‌های فردا',
      description: 'ثبت احساس روز، بررسی وضعیت تارگت‌های هفتگی و تنظیم زنگ بیدارباش ساعت ۰۶:۴۵',
      jalaliDate: today,
      part: 'NIGHT',
      startTime: '22:00',
      endTime: '22:30',
      category: 'home',
      priority: 'MEDIUM',
      isCompleted: false,
      isDeferred: false,
      hasAlarm: true,
      reminderTime: '21:55',
      createdAt: new Date().toISOString()
    },
    // Deferred / Past Backlog Tasks
    {
      id: 't-backlog-1',
      title: 'بررسی پیچ‌دک استارتاپ کارر برای سرمایه‌گذار فرشته',
      description: 'اصلاح اسلایدهای اندازه بازار (TAM/SAM/SOM) و پیش‌بینی جریان نقدی ۲ ساله',
      jalaliDate: yesterday,
      part: 'EVENING',
      startTime: '18:00',
      endTime: '19:30',
      category: 'startup_3',
      priority: 'HIGH',
      isCompleted: false,
      isDeferred: true,
      deferredNote: 'به دلیل تداخل با جلسه اضطراری، نیاز به انتقال به امروز یا جمعه ریکاوری دارد.',
      hasAlarm: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 't-backlog-2',
      title: 'خرید تجهیزات شبکه و کابل برای اتاق کار خانگی',
      description: 'تهیه روتر گیگابیتی و کابل Cat6 برای اتصال پرسرعت به سرور محلی',
      jalaliDate: yesterday,
      part: 'MIDDAY',
      startTime: '14:00',
      endTime: '15:00',
      category: 'home',
      priority: 'LOW',
      isCompleted: false,
      isDeferred: true,
      deferredNote: 'انتقال به برنامه آخر هفته',
      hasAlarm: false,
      createdAt: new Date().toISOString()
    },
    // Tomorrow Task
    {
      id: 't-tom-1',
      title: 'جلسه دمو ویژگی جدید زوپیت با مشتریان شرکتی',
      description: 'ارائه آنلاین داشبورد تحلیل سفارشات برای مدیران ناوگان',
      jalaliDate: tomorrow,
      part: 'MORNING',
      startTime: '09:00',
      endTime: '10:30',
      category: 'startup_1',
      priority: 'HIGH',
      isCompleted: false,
      isDeferred: false,
      hasAlarm: true,
      reminderTime: '08:45',
      createdAt: new Date().toISOString()
    }
  ];

  // Generate 30 days of realistic history for rich Productivity Insights analytics
  const categoriesList: TaskCategory[] = ['university', 'startup_1', 'startup_2', 'startup_3', 'startup_4', 'job', 'home', 'personal'];
  const sampleTitles: Record<TaskCategory, string[]> = {
    university: ['حل تمارین شبکه کامپیوتری', 'آماده‌سازی اسلایدهای سمینار یادگیری عمیق', 'مطالعه میان‌ترم هوش مصنوعی', 'پروژه عملی درس سیستم‌های عامل'],
    startup_1: ['طراحی وب‌هوک‌های درگاه پرداخت زوپیت', 'بهینه‌سازی کوئری‌های Postgres در زوپیت', 'تست استرس سرورهای پردازش سفارش', 'بازبینی کدهای اسپرینت زوپیت'],
    startup_2: ['انتشار نسخه آزمایشی سامانه مکتو', 'طراحی پروتوتایپ صفحات محتوای مکتو', 'بررسی فیدبک کاربران مرحله MVP مکتو', 'تنظیم خط لوله تحریریه دانش‌بنیان'],
    startup_3: ['بررسی مدل درآمدی استارتاپ کارر', 'جلسه با مشاور حقوقی قراردادهای کارر', 'طراحی سیستم امتیازدهی مهارت در کارر', 'تحلیل رقبا در بازار استخدام تخصصی'],
    startup_4: ['طراحی فرم ثبت کارکرد کارگاه سیویل مکس', 'رفع باگ ماژول متره و برآورد مهندسی', 'جلسه تست با مهندسین ناظر ساختمانی', 'هماهنگی با تیم پشتیبانی سیویل مکس'],
    job: ['توسعه کامپوننت‌های رابط کاربری پروژه کلاینت', 'جلسه استندآپ صبحگاهی با کارفرما', 'مستندسازی APIهای سامانه شرکتی', 'ریفکتور ماژول احراز هویت'],
    home: ['ساماندهی فایل‌های بکاپ و مستندات خانگی', 'خرید اقلام ضروری و تجهیزات میز کار', 'رسیدگی به امور مالی و فاکتورها', 'نظافت و ارگونومی فضای کاری'],
    personal: ['ورزش و تمرینات استقامتی در باشگاه', 'مطالعه ۳۰ دقیقه کتاب تخصصی', 'مدیتیشن و پیاده‌روی عصرگاهی', 'مرور اهداف فردی و بازنگری سلامت']
  };

  const partsList: DayPart[] = ['MORNING', 'MIDDAY', 'EVENING', 'NIGHT'];

  for (let dayOffset = 1; dayOffset <= 90; dayOffset++) {
    const pastDateStr = addDaysToJalali(today, -dayOffset);
    // 3 to 6 tasks per day
    const tasksInDay = 3 + ((dayOffset * 7) % 4);

    for (let tIndex = 0; tIndex < tasksInDay; tIndex++) {
      const part = partsList[tIndex % 4];
      const category = categoriesList[(dayOffset + tIndex * 2) % categoriesList.length];
      const titles = sampleTitles[category];
      const title = titles[(dayOffset + tIndex) % titles.length];
      
      // Realistic completion rate: morning & startups have higher completion, some variation
      const pseudoRand = ((dayOffset * 17 + tIndex * 31) % 100);
      let isCompleted = pseudoRand > 28; // ~72% completion rate overall
      if (part === 'MORNING') isCompleted = pseudoRand > 18; // 82% in morning
      if (part === 'NIGHT') isCompleted = pseudoRand > 38; // 62% in night

      const startH = part === 'MORNING' ? '08:30' : part === 'MIDDAY' ? '13:00' : part === 'EVENING' ? '17:30' : '21:00';
      const endH = part === 'MORNING' ? '10:30' : part === 'MIDDAY' ? '14:30' : part === 'EVENING' ? '19:00' : '22:30';

      initialTasks.push({
        id: `hist-${dayOffset}-${tIndex}`,
        title: `${title} (${pastDateStr.slice(5)})`,
        description: `انجام و پیگیری تسک مرتبط با ${category} در ${pastDateStr}`,
        jalaliDate: pastDateStr,
        part,
        startTime: startH,
        endTime: endH,
        category,
        priority: tIndex === 0 ? 'HIGH' : tIndex === 1 ? 'MEDIUM' : 'LOW',
        isCompleted,
        isDeferred: !isCompleted && pseudoRand > 75,
        hasAlarm: pseudoRand % 3 === 0,
        createdAt: new Date(Date.now() - dayOffset * 86400000).toISOString(),
        completedAt: isCompleted ? new Date(Date.now() - dayOffset * 86400000 + 7200000).toISOString() : undefined
      });
    }
  }

  // Also seed sample data for last year (1404) for YoY comparison
  const parsedToday = parseJalaliDate(today);
  const lastYear = parsedToday.year - 1;
  for (let m = 1; m <= 12; m++) {
    const daysInLastYearM = m <= 6 ? 31 : m <= 11 ? 30 : 29;
    for (let d = 1; d <= daysInLastYearM; d += 3) {
      const dFormatted = d < 10 ? `0${d}` : `${d}`;
      const mFormatted = m < 10 ? `0${m}` : `${m}`;
      const dateStr = `${lastYear}-${mFormatted}-${dFormatted}`;
      const category = categoriesList[(m + d) % categoriesList.length];
      const part = partsList[(d + m) % 4];
      const titles = sampleTitles[category];
      const title = titles[(d + m) % titles.length];
      const isCompleted = ((d * 13 + m * 7) % 100) > 42; // ~58% completion rate last year (to show clear YoY positive improvement!)

      initialTasks.push({
        id: `yoy-${lastYear}-${m}-${d}`,
        title: `${title} (${lastYear}/${mFormatted})`,
        description: `تسک پارتبان در سال ${lastYear}`,
        jalaliDate: dateStr,
        part,
        startTime: '09:00',
        endTime: '11:00',
        category,
        priority: 'MEDIUM',
        isCompleted,
        isDeferred: !isCompleted,
        hasAlarm: false,
        createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
        completedAt: isCompleted ? new Date(Date.now() - 365 * 86400000 + 7200000).toISOString() : undefined
      });
    }
  }

  return initialTasks;
}

export function getInitialGoals(): Goal[] {
  const today = getTodayJalali();
  return [
    {
      id: 'g-1',
      title: 'تکمیل هسته موتور قیمت‌گذاری استارتاپ زوپیت',
      level: 'PART',
      targetScope: today,
      part: 'MORNING',
      category: 'startup_1',
      isCompleted: true,
      progress: 100
    },
    {
      id: 'g-2',
      title: 'حضور فعال در جلسات تیم و کلاس شبکه',
      level: 'PART',
      targetScope: today,
      part: 'MIDDAY',
      category: 'university',
      isCompleted: false,
      progress: 50
    },
    {
      id: 'g-3',
      title: 'اجرای دقیق برنامه تمرینی باشگاه بدون تاخیر',
      level: 'PART',
      targetScope: today,
      part: 'EVENING',
      category: 'personal',
      isCompleted: false,
      progress: 0
    },
    {
      id: 'g-4',
      title: 'خاموش کردن نمایشگرها قبل از ساعت ۲۳:۳۰ برای خواب عمیق',
      level: 'PART',
      targetScope: today,
      part: 'NIGHT',
      category: 'personal',
      isCompleted: false,
      progress: 0
    },
    {
      id: 'g-daily',
      title: 'اتمام حداقل ۵ تسک حیاتی روز و حفظ تمرکز عمیق بدون شبکه‌های اجتماعی',
      level: 'DAILY',
      targetScope: today,
      category: 'personal',
      isCompleted: false,
      progress: 60
    },
    {
      id: 'g-weekly',
      title: 'انتشار نسخه آزمایشی ۱.۲ استارتاپ مکتو و ارسال برای تسترها',
      level: 'WEEKLY',
      targetScope: today.substring(0, 7),
      category: 'startup_2',
      isCompleted: false,
      progress: 40
    }
  ];
}

export function getInitialCourses(): UniversityCourse[] {
  return [
    {
      id: 'c-1',
      courseName: 'طراحی الگوریتم‌های پیشرفته',
      instructor: 'دکتر قریشی',
      classroom: 'دانشکده کامپیوتر - کلاس ۲۰۴',
      dayOfWeek: 0, // شنبه
      timeSlot: '۰۸:۰۰ الی ۱۰:۰۰',
      color: '#8b5cf6',
      notes: 'پروژه میان‌ترم در هفته هشتم تحویل داده شود'
    },
    {
      id: 'c-2',
      courseName: 'هوش مصنوعی و یادگیری عمیق',
      instructor: 'دکتر رضایی',
      classroom: 'تالار مجازی / هیبریدی',
      dayOfWeek: 2, // دوشنبه
      timeSlot: '۱۲:۳۰ الی ۱۴:۳۰',
      color: '#06b6d4',
      notes: 'تمرین کدنویسی PyTorch هر هفته تحویل داده شود'
    },
    {
      id: 'c-3',
      courseName: 'امنیت سیستم‌های ابری و شبکه',
      instructor: 'مهندس حسینی',
      classroom: 'آزمایشگاه شبکه - طبقه ۳',
      dayOfWeek: 4, // چهارشنبه
      timeSlot: '۱۰:۰۰ الی ۱۲:۰۰',
      color: '#10b981',
      notes: 'آزمون کوئیز اول هفته آینده'
    },
    {
      id: 'c-4',
      courseName: 'مدیریت و کارآفرینی در فناوری اطلاعات',
      instructor: 'دکتر میرزایی',
      classroom: 'آمفی‌تئاتر خوارزمی',
      dayOfWeek: 4, // چهارشنبه
      timeSlot: '۱۳:۳۰ الی ۱۵:۳۰',
      color: '#f59e0b',
      notes: 'ارائه مدل بیزنس کنواس استارتاپ‌ها'
    }
  ];
}

export function getInitialDayNotes(): DayNote[] {
  const today = getTodayJalali();
  return [
    {
      jalaliDate: today,
      mood: 'focused',
      reflection: 'روز بسیار منظم با شروع پرانرژی در پارت صبح.',
      focusScore: 5
    }
  ];
}

// Storage helpers with safe try/catch
export const storage = {
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        const initial = getInitialTasks();
        storage.setTasks(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return getInitialTasks();
    }
  },

  setTasks: (tasks: Task[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch {
      // storage full or disabled
    }
  },

  getGoals: (): Goal[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (!data) {
        const initial = getInitialGoals();
        storage.setGoals(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return getInitialGoals();
    }
  },

  setGoals: (goals: Goal[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch {
      //
    }
  },

  getCourses: (): UniversityCourse[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (!data) {
        const initial = getInitialCourses();
        storage.setCourses(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return getInitialCourses();
    }
  },

  setCourses: (courses: UniversityCourse[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch {
      //
    }
  },

  getStartups: (): Record<string, StartupProfile> => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STARTUPS);
      if (!data) {
        storage.setStartups(STARTUP_PROFILES);
        return STARTUP_PROFILES;
      }
      return JSON.parse(data);
    } catch {
      return STARTUP_PROFILES;
    }
  },

  setStartups: (startups: Record<string, StartupProfile>): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.STARTUPS, JSON.stringify(startups));
    } catch {
      //
    }
  },

  getDayNotes: (): DayNote[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAY_NOTES);
      if (!data) {
        const initial = getInitialDayNotes();
        storage.setDayNotes(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return getInitialDayNotes();
    }
  },

  setDayNotes: (notes: DayNote[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.DAY_NOTES, JSON.stringify(notes));
    } catch {
      //
    }
  },

  getHabits: (): Habit[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (!data) {
        const initial = getInitialHabits();
        storage.setHabits(initial);
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return getInitialHabits();
    }
  },

  setHabits: (habits: Habit[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch {
      //
    }
  },

  resetToDemo: (): void => {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.STARTUPS);
    localStorage.removeItem(STORAGE_KEYS.DAY_NOTES);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
  }
};
