import React, { useState } from 'react';
import { DayNote, Habit, Task } from '../types';
import { soundManager } from '../utils/audio';
import { toPersianDigits, getPersianFullDate } from '../utils/jalali';
import { 
  Sparkles, 
  Flame, 
  Droplets, 
  Share2, 
  Copy, 
  Check, 
  CheckCircle2, 
  Target, 
  ChevronDown, 
  ChevronUp,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyBriefingCardProps {
  currentDate: string;
  dayNote?: DayNote;
  onUpdateDayNote: (note: Partial<DayNote>) => void;
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => void;
  tasks: Task[];
  onOpenHabits: () => void;
  onOpenEisenhower: () => void;
}

const MOTIVATIONAL_TIPS = [
  "پارت صبح (۰۷:۰۰ تا ۱۲:۰۰) طلایی‌ترین زمان روز برای ساختن هسته استارتاپ و تسلط بر مباحث سنگین است.",
  "با تکمیل تسک‌های با اولویت فوری و مهم در پارت ۱ و ۲، فشار کاری عصر به حداقل می‌رسد.",
  "انرژی خود را در پارت ۳ با ۳۰ دقیقه ورزش بازیابی کنید تا پارت ۴ شب پربار و آرامی داشته باشید.",
  "پارت شب را به جمع‌بندی روز، شکرگزاری و تنظیم ذهن برای فتح روز بعد اختصاص دهید."
];

export const DailyBriefingCard: React.FC<DailyBriefingCardProps> = ({
  currentDate,
  dayNote,
  onUpdateDayNote,
  habits,
  onToggleHabit,
  tasks,
  onOpenHabits,
  onOpenEisenhower
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const waterGlasses = dayNote?.waterGlasses || 0;
  const todayTasks = tasks.filter(t => t.jalaliDate === currentDate);
  const completedToday = todayTasks.filter(t => t.isCompleted).length;

  const tipIndex = Math.abs(currentDate.split('-').reduce((acc, part) => acc + parseInt(part), 0)) % MOTIVATIONAL_TIPS.length;
  const currentTip = MOTIVATIONAL_TIPS[tipIndex];

  const handleWaterClick = (count: number) => {
    soundManager.playClickSound();
    onUpdateDayNote({ waterGlasses: count });
  };

  const handleCopySchedule = () => {
    soundManager.playClickSound();
    const text = `📋 برنامه روزانه کاسپ پلنر (${getPersianFullDate(currentDate)}):\n` +
      `🔥 وضعیت: ${completedToday} از ${todayTasks.length} تسک انجام شده\n\n` +
      `🌅 پارت ۱ (صبح): ${todayTasks.filter(t => t.part === 'MORNING').map(t => (t.isCompleted ? '✅ ' : '⏳ ') + t.title).join('\n') || 'آزاد'}\n\n` +
      `☀️ پارت ۲ (ظهر): ${todayTasks.filter(t => t.part === 'MIDDAY').map(t => (t.isCompleted ? '✅ ' : '⏳ ') + t.title).join('\n') || 'آزاد'}\n\n` +
      `🏋️ پارت ۳ (عصر): ${todayTasks.filter(t => t.part === 'EVENING').map(t => (t.isCompleted ? '✅ ' : '⏳ ') + t.title).join('\n') || 'آزاد'}\n\n` +
      `🌙 پارت ۴ (شب): ${todayTasks.filter(t => t.part === 'NIGHT').map(t => (t.isCompleted ? '✅ ' : '⏳ ') + t.title).join('\n') || 'آزاد'}\n\n` +
      `⚡ مدیریت شده با کاسپ پلنر (Casp Planner)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-xl transition-all">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        
        {/* Quote & Sparkle */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300">راهبرد روزانه کاسپ پلنر</span>
              <span className="hidden sm:inline-block text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                ۴ پارت استراتژیک
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-0.5 line-clamp-1">
              {currentTip}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopySchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="کپی متن کامل برنامه روز جهت ارسال در پیام‌رسان‌ها"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-indigo-400" />}
            <span className="hidden sm:inline">{copied ? 'کپی شد!' : 'اشتراک برنامه'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'خلاصه' : 'عادات و آب'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Quick Habit & Hydration Bar */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          
          {/* Quick Habit Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Flame className="w-4 h-4" />
                <span>عادات کلیدی امروز (کلیک برای ثبت فوری)</span>
              </div>
              <button
                onClick={onOpenHabits}
                className="text-indigo-400 hover:text-indigo-300 transition-colors text-[11px]"
              >
                مشاهده همه عادات ←
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {habits.slice(0, 4).map(habit => {
                const isDone = habit.completedDates.includes(currentDate);
                return (
                  <button
                    key={habit.id}
                    onClick={() => {
                      soundManager.playClickSound();
                      if (!isDone) {
                        soundManager.playCompleteSound();
                        confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
                      }
                      onToggleHabit(habit.id, currentDate);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800/90 border border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                    <span>{habit.title}</span>
                    {isDone && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hydration / Water Tracker (8 glasses) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Droplets className="w-4 h-4" />
                <span>ردیاب مصرف آب ({toPersianDigits(waterGlasses)} از ۸ لیوان)</span>
              </div>
              <span className="text-[11px] text-slate-500">هیدراته بمانید</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <button
                  key={num}
                  onClick={() => handleWaterClick(waterGlasses === num ? num - 1 : num)}
                  className={`flex-1 h-8 rounded-xl transition-all flex items-center justify-center text-xs font-bold cursor-pointer ${
                    num <= waterGlasses
                      ? 'bg-gradient-to-t from-cyan-600 to-sky-400 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800/80 border border-slate-700/60 text-slate-500 hover:border-cyan-500/40'
                  }`}
                  title={`${num} لیوان آب`}
                >
                  <Droplets className={`w-3.5 h-3.5 ${num <= waterGlasses ? 'text-white' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
