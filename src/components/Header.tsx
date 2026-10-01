import React from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  BarChart3, 
  GraduationCap, 
  Rocket, 
  Target, 
  History, 
  Volume2, 
  VolumeX, 
  Settings, 
  Timer,
  Sparkles,
  Flame,
  TrendingUp,
  LayoutGrid,
  Search,
  Compass
} from 'lucide-react';
import { 
  getPersianFullDate, 
  getRelativeDayLabel, 
  addDaysToJalali, 
  getTodayJalali, 
  getJalaliDayOfWeek,
  toPersianDigits
} from '../utils/jalali';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  activeTab: 'daily' | 'insights';
  onTabChange: (tab: 'daily' | 'insights') => void;
  onOpenPanorama: () => void;
  onOpenCalendar: () => void;
  onOpenUniversity: () => void;
  onOpenStartups: () => void;
  onOpenGoals: () => void;
  onOpenDeferred: () => void;
  onOpenFocusTimer: () => void;
  onOpenHabits: () => void;
  onOpenEisenhower: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  deferredCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  totalTasksToday: number;
  completedTasksToday: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  activeTab,
  onTabChange,
  onOpenPanorama,
  onOpenCalendar,
  onOpenUniversity,
  onOpenStartups,
  onOpenGoals,
  onOpenDeferred,
  onOpenFocusTimer,
  onOpenHabits,
  onOpenEisenhower,
  onOpenCommandPalette,
  onOpenSettings,
  deferredCount,
  soundEnabled,
  onToggleSound,
  totalTasksToday,
  completedTasksToday
}) => {
  const todayStr = getTodayJalali();
  const isToday = currentDate === todayStr;
  const { year, month, day } = {
    year: parseInt(currentDate.split('-')[0]),
    month: parseInt(currentDate.split('-')[1]),
    day: parseInt(currentDate.split('-')[2])
  };
  const dayOfWeek = getJalaliDayOfWeek(year, month, day);
  const isFriday = dayOfWeek === 6; // جمعه

  const completionPercent = totalTasksToday > 0 ? Math.round((completedTasksToday / totalTasksToday) * 100) : 0;

  const handlePrevDay = () => {
    soundManager.playClickSound();
    onDateChange(addDaysToJalali(currentDate, -1));
  };

  const handleNextDay = () => {
    soundManager.playClickSound();
    onDateChange(addDaysToJalali(currentDate, 1));
  };

  const handleGoToToday = () => {
    soundManager.playClickSound();
    onDateChange(todayStr);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
        {/* Top bar: Brand, Main Tabs & Action Hub Buttons */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap pb-2.5 border-b border-slate-800/60">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Clock className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75"></span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-l from-indigo-300 via-amber-200 to-white bg-clip-text text-transparent">
                  کاسپ پلنر
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-950/90 border border-indigo-500/40 text-indigo-300 shadow-sm">
                  Casp Planner
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                سیستم جامع ۴ پارت روزانه • ماتریس تمرکز و رشد
              </p>
            </div>
          </div>

          {/* Quick Search & Command Palette Button */}
          <button
            onClick={() => { soundManager.playClickSound(); onOpenCommandPalette(); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all text-xs cursor-pointer group shadow-inner"
            title="جستجو در تمام تسک‌ها و دستورات سریع (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">جستجو یا دستور سریع...</span>
            <kbd className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
              Ctrl+K
            </kbd>
          </button>

          {/* Core View Switcher Tab (Daily 4-Parts vs Productivity Insights) */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner order-last md:order-none w-full md:w-auto justify-center">
            <button
              onClick={() => {
                soundManager.playClickSound();
                onTabChange('daily');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>برنامه ۴ پارت</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClickSound();
                onTabChange('insights');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'insights'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-cyan-300" />
              <span>تحلیل بهره‌وری (Insights)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Day Panorama Button */}
            <button
              onClick={() => { soundManager.playClickSound(); onOpenPanorama(); }}
              className="group relative flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ring-1 ring-indigo-400/40 cursor-pointer"
              title="نمای سراسرنما و گزارش جامع روز"
            >
              <BarChart3 className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">کل روز در یک نگاه</span>
              <span className="flex items-center justify-center text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono">
                {toPersianDigits(completionPercent)}%
              </span>
            </button>

            {/* Habit Tracker 🔥 */}
            <button
              onClick={() => { soundManager.playClickSound(); onOpenHabits(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-amber-300 text-xs border border-amber-500/30 hover:border-amber-500/50 transition-colors cursor-pointer"
              title="ردیاب عادات و زنجیره موفقیت روزانه"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30 animate-pulse" />
              <span className="hidden md:inline font-bold">عادات</span>
            </button>

            {/* Eisenhower Matrix 🧭 */}
            <button
              onClick={() => { soundManager.playClickSound(); onOpenEisenhower(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-indigo-300 text-xs border border-indigo-500/30 hover:border-indigo-500/50 transition-colors cursor-pointer"
              title="ماتریس اولویت‌بندی آیزنهاور (فوری و مهم)"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline font-bold">ماتریس</span>
            </button>

            {/* Pomodoro Timer */}
            <button
              onClick={() => { soundManager.playClickSound(); onOpenFocusTimer(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-amber-300 text-xs border border-amber-500/20 hover:border-amber-500/40 transition-colors cursor-pointer"
              title="تایمر تمرکز عمیق و پومودورو"
            >
              <Timer className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline font-medium">تمرکز</span>
            </button>

            {/* University Schedule */}
            <button
              onClick={() => { soundManager.playClickSound(); onOpenUniversity(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-purple-300 text-xs border border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer"
              title="برنامه هفتگی کلاس‌های دانشگاه"
            >
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span className="hidden lg:inline font-medium">دانشگاه</span>
            </button>

            {/* Startups Hub */}
            <button
              onClick={() => { soundManager.playClickSound(); onOpenStartups(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-cyan-300 text-xs border border-cyan-500/20 hover:border-cyan-500/40 transition-colors cursor-pointer"
              title="پروفایل و وظایف استارتاپ‌ها (زوپیت، مکتو، کارر، سیویل مکس)"
            >
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline font-medium">استارتاپ‌ها</span>
            </button>

            {/* Goals & Targets */}
            <button
              onClick={() => { soundManager.playClickSound(); onOpenGoals(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-emerald-300 text-xs border border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer"
              title="تارگت‌ها و اهداف پارت‌ها و روزانه"
            >
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline font-medium">تارگت‌ها</span>
            </button>

            {/* Deferred Backlog */}
            <button
              onClick={() => { soundManager.playClickSound(); onOpenDeferred(); }}
              className="relative flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-rose-300 text-xs border border-rose-500/20 hover:border-rose-500/40 transition-colors cursor-pointer"
              title="کارهای معوقه و جبرانی"
            >
              <History className="w-4 h-4 text-rose-400" />
              <span className="hidden xl:inline font-medium">معوقه‌ها</span>
              {deferredCount > 0 && (
                <span className="flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {toPersianDigits(deferredCount)}
                </span>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-colors cursor-pointer"
              title={soundEnabled ? 'قطع صداهای اعلانات' : 'فعال‌سازی صدا'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Settings */}
            <button
              onClick={() => { soundManager.playClickSound(); onOpenSettings(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-colors cursor-pointer"
              title="پشتیبان‌گیری و تنظیمات"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom bar: Date Navigation & Day Summary Status (Visible in Daily tab or quick date jump) */}
        {activeTab === 'daily' && (
          <div className="flex items-center justify-between gap-3 pt-2.5 flex-wrap">
            {/* Navigation Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevDay}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors active:scale-95 cursor-pointer"
                title="روز قبل"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => { soundManager.playClickSound(); onOpenCalendar(); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700/80 transition-colors group cursor-pointer shadow-inner"
                title="باز کردن تقویم کامل جلالی"
              >
                <CalendarIcon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-bold">
                  {getPersianFullDate(currentDate)}
                </span>
                <span className="text-[11px] text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-500/30">
                  {getRelativeDayLabel(currentDate)}
                </span>
              </button>

              <button
                onClick={handleNextDay}
                className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors active:scale-95 cursor-pointer"
                title="روز بعد"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {!isToday && (
                <button
                  onClick={handleGoToToday}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
                >
                  بازگشت به امروز
                </button>
              )}
            </div>

            {/* Status Badge & Friday Notice */}
            <div className="flex items-center gap-2">
              {isFriday ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>جمعه ریکاوری: مرور بک‌لاگ و استراحت</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {toPersianDigits(completedTasksToday)} از {toPersianDigits(totalTasksToday)} کار تکمیل شده
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
