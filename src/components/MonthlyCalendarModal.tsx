import React, { useState } from 'react';
import { Task, UniversityCourse } from '../types';
import { 
  PERSIAN_MONTH_NAMES, 
  PERSIAN_WEEKDAY_SHORT, 
  parseJalaliDate, 
  formatJalaliDate, 
  getDaysInJalaliMonth, 
  getJalaliDayOfWeek, 
  toPersianDigits, 
  getTodayJalali 
} from '../utils/jalali';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  GraduationCap, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MonthlyCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  tasks: Task[];
  courses: UniversityCourse[];
}

export const MonthlyCalendarModal: React.FC<MonthlyCalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  tasks,
  courses
}) => {
  const initial = parseJalaliDate(selectedDate);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  if (!isOpen) return null;

  const todayStr = getTodayJalali();
  const todayObj = parseJalaliDate(todayStr);

  const daysInMonth = getDaysInJalaliMonth(viewYear, viewMonth);
  // Get weekday of the first day of this month
  const firstDayOfWeek = getJalaliDayOfWeek(viewYear, viewMonth, 1);

  const handlePrevMonth = () => {
    soundManager.playClickSound();
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    soundManager.playClickSound();
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleGoToCurrentMonth = () => {
    soundManager.playClickSound();
    setViewYear(todayObj.year);
    setViewMonth(todayObj.month);
  };

  const handleDayClick = (day: number) => {
    soundManager.playClickSound();
    const dateStr = formatJalaliDate(viewYear, viewMonth, day);
    onSelectDate(dateStr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
              <CalendarIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100">
                تقویم هوشمند ماهانه جلالی
              </h2>
              <p className="text-xs text-slate-400">
                مشاهده تراکم کارها و کلاس‌های دانشگاه در ماه
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Navigation Row */}
        <div className="px-4 sm:px-6 py-3 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="ماه قبل"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 min-w-[140px] text-center">
              {PERSIAN_MONTH_NAMES[viewMonth - 1]} {toPersianDigits(viewYear)}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="ماه بعد"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGoToCurrentMonth}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 transition-colors"
          >
            ماه جاری
          </button>
        </div>

        {/* Calendar Grid Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
            {PERSIAN_WEEKDAY_SHORT.map((wShort, idx) => (
              <div
                key={idx}
                className={`py-1.5 text-xs font-bold rounded-lg ${
                  idx === 6 ? 'text-emerald-400 bg-emerald-950/20' : 'text-slate-400 bg-slate-800/40'
                }`}
              >
                {wShort}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty offset cells before day 1 */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-2xl bg-slate-900/30 opacity-25 border border-transparent" />
            ))}

            {/* Days 1 to daysInMonth */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNumber = idx + 1;
              const dateStr = formatJalaliDate(viewYear, viewMonth, dayNumber);
              const dayOfWeek = getJalaliDayOfWeek(viewYear, viewMonth, dayNumber);
              const isFriday = dayOfWeek === 6;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              // Tasks on this day
              const dayTasks = tasks.filter((t) => t.jalaliDate === dateStr);
              const totalDayTasks = dayTasks.length;
              const completedDayTasks = dayTasks.filter((t) => t.isCompleted).length;

              // Uni courses on this weekday
              const dayCourses = courses.filter((c) => c.dayOfWeek === dayOfWeek);

              return (
                <button
                  key={`day-${dayNumber}`}
                  type="button"
                  onClick={() => handleDayClick(dayNumber)}
                  className={`h-16 sm:h-20 p-1.5 rounded-2xl border flex flex-col justify-between transition-all duration-200 cursor-pointer relative text-right group ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-500 shadow-md ring-2 ring-indigo-500/50'
                      : isToday
                      ? 'bg-slate-800 border-indigo-500/60 shadow-sm'
                      : isFriday
                      ? 'bg-emerald-950/20 hover:bg-emerald-950/40 border-emerald-900/40'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                  }`}
                >
                  {/* Top: Day number & Today Badge */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-bold font-mono ${
                        isToday
                          ? 'text-indigo-400 font-black'
                          : isFriday
                          ? 'text-emerald-400'
                          : 'text-slate-200'
                      }`}
                    >
                      {toPersianDigits(dayNumber)}
                    </span>

                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    )}
                  </div>

                  {/* Middle / Bottom: Badges */}
                  <div className="space-y-1 w-full">
                    {/* Tasks count indicator */}
                    {totalDayTasks > 0 ? (
                      <div className="flex items-center justify-between text-[9px] sm:text-[10px] bg-slate-900/80 px-1 py-0.5 rounded-md border border-slate-700/60 font-mono">
                        <span className="text-slate-300">
                          {toPersianDigits(completedDayTasks)}/{toPersianDigits(totalDayTasks)}
                        </span>
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            completedDayTasks === totalDayTasks ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                      </div>
                    ) : isFriday ? (
                      <div className="text-[9px] text-emerald-400 font-medium truncate hidden sm:block">
                        ریکاوری 🌱
                      </div>
                    ) : null}

                    {/* Uni courses dot */}
                    {dayCourses.length > 0 && (
                      <div className="flex items-center gap-0.5 text-[9px] text-purple-300 font-mono">
                        <GraduationCap className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                        <span className="hidden sm:inline">{toPersianDigits(dayCourses.length)} کلاس</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> امروز
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> جمعه ریکاوری
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> کلاس دانشگاه
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
