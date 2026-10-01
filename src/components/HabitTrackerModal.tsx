import React, { useState } from 'react';
import { DayPart, Habit, TaskCategory } from '../types';
import { CATEGORY_DEFINITIONS, DAY_PARTS } from '../utils/constants';
import { soundManager } from '../utils/audio';
import { addDaysToJalali, getTodayJalali, toPersianDigits, getJalaliDayOfWeek, PERSIAN_WEEKDAY_SHORT } from '../utils/jalali';
import { 
  X, 
  Flame, 
  Plus, 
  Check, 
  Dumbbell, 
  BookOpen, 
  Zap, 
  Droplets, 
  Moon, 
  Heart, 
  Sparkles, 
  Trash2,
  Trophy,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HabitTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => void;
  onDeleteHabit: (habitId: string) => void;
  currentDate: string;
}

const AVAILABLE_ICONS = [
  { name: 'Zap', icon: Zap, label: 'تمرکز و انرژی' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'ورزش و تندرستی' },
  { name: 'BookOpen', icon: BookOpen, label: 'مطالعه و یادگیری' },
  { name: 'Droplets', icon: Droplets, label: 'آب و سلامت' },
  { name: 'Moon', icon: Moon, label: 'خواب و استراحت' },
  { name: 'Heart', icon: Heart, label: 'روابط و خانواده' },
  { name: 'Sparkles', icon: Sparkles, label: 'انگیزه و رشد' }
];

const HABIT_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#f43f5e', '#3b82f6'
];

export const HabitTrackerModal: React.FC<HabitTrackerModalProps> = ({
  isOpen,
  onClose,
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  currentDate
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('personal');
  const [newPart, setNewPart] = useState<DayPart | undefined>('MORNING');
  const [newIcon, setNewIcon] = useState('Zap');
  const [newColor, setNewColor] = useState('#6366f1');
  const [newTargetDays, setNewTargetDays] = useState(7);

  if (!isOpen) return null;

  // Generate last 7 days for the weekly check matrix
  const daysList: string[] = [];
  for (let i = 6; i >= 0; i--) {
    daysList.push(addDaysToJalali(currentDate, -i));
  }

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddHabit({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      category: newCategory,
      targetPart: newPart,
      icon: newIcon,
      color: newColor,
      targetDaysPerWeek: newTargetDays
    });

    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
    soundManager.playCompleteSound();
  };

  const handleCheck = (habitId: string, date: string, wasCompleted: boolean) => {
    soundManager.playClickSound();
    if (!wasCompleted) {
      soundManager.playCompleteSound();
      if (date === currentDate) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    }
    onToggleHabit(habitId, date);
  };

  // Calculate consistency
  const totalChecks = habits.reduce((acc, h) => {
    const checksInWeek = daysList.filter(d => h.completedDates.includes(d)).length;
    return acc + checksInWeek;
  }, 0);
  const maxPossibleChecks = habits.length * 7;
  const weeklyRate = maxPossibleChecks > 0 ? Math.round((totalChecks / maxPossibleChecks) * 100) : 0;

  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Dumbbell': return <Dumbbell className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Droplets': return <Droplets className={className} />;
      case 'Moon': return <Moon className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      default: return <Zap className={className} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-indigo-950/50 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">ردیاب عادات و زنجیره موفقیت</h2>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  تکرار روزانه
                </span>
              </div>
              <p className="text-xs text-slate-400">
                پایبندی به عادات کلیدی در ۴ پارت شبانه‌روز برای دستیابی به حداکثر بهره‌وری
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdding ? 'بستن فرم' : 'عادت جدید'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/60 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">عادات فعال</span>
                <span className="text-xl font-bold text-white">{toPersianDigits(habits.length)} مورد</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/60 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">نرخ پایبندی ۷ روز اخیر</span>
                <span className="text-xl font-bold text-indigo-300">{toPersianDigits(weeklyRate)}%</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/60 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">ثبت‌های امروز</span>
                <span className="text-xl font-bold text-emerald-300">
                  {toPersianDigits(habits.filter(h => h.completedDates.includes(currentDate)).length)} از {toPersianDigits(habits.length)}
                </span>
              </div>
            </div>
          </div>

          {/* Add Habit Inline Form */}
          {isAdding && (
            <form onSubmit={handleCreateHabit} className="p-5 rounded-2xl bg-slate-800/90 border border-indigo-500/40 space-y-4 animate-fade-in shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                تعریف عادت روزانه جدید در کاسپ پلنر
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">عنوان عادت *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثلاً: ۳۰ دقیقه ورزش صبحگاهی، مطالعه، کدنویسی عمیق"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">پارت زمانی هدف</label>
                  <select
                    value={newPart || ''}
                    onChange={(e) => setNewPart(e.target.value ? (e.target.value as DayPart) : undefined)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">تمام طول روز (شناور)</option>
                    {Object.values(DAY_PARTS).map(part => (
                      <option key={part.id} value={part.id}>{part.title} ({part.timeRange})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">توضیحات و یادداشت</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="هدف و چرایی انجام این عادت..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">دسته‌بندی</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {Object.entries(CATEGORY_DEFINITIONS).map(([catKey, catDef]) => (
                      <option key={catKey} value={catKey}>{catDef.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">آیکون</label>
                  <div className="flex items-center gap-1.5">
                    {AVAILABLE_ICONS.map(item => (
                      <button
                        type="button"
                        key={item.name}
                        onClick={() => setNewIcon(item.name)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          newIcon === item.name 
                            ? 'bg-indigo-600 text-white border-indigo-400' 
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title={item.label}
                      >
                        <item.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">رنگ سازمانی</label>
                  <div className="flex items-center gap-1.5">
                    {HABIT_COLORS.map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${newColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-600 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer"
                >
                  ذخیره عادت
                </button>
              </div>
            </form>
          )}

          {/* Habits Table / Card Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2">
              <span>لیست عادات روزانه</span>
              <span className="hidden sm:inline">سابقه ۷ روز اخیر (روی هر روز کلیک کنید)</span>
            </div>

            {habits.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
                <Flame className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">هنوز هیچ عادتی ثبت نشده است.</p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                >
                  اولین عادت خود را بسازید
                </button>
              </div>
            ) : (
              habits.map((habit) => {
                const isDoneToday = habit.completedDates.includes(currentDate);
                const partInfo = habit.targetPart ? DAY_PARTS[habit.targetPart] : null;

                return (
                  <div
                    key={habit.id}
                    className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    {/* Left: Habit Info & Today Check */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* Check Button for Today */}
                      <button
                        onClick={() => handleCheck(habit.id, currentDate, isDoneToday)}
                        className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 cursor-pointer ${
                          isDoneToday 
                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/40' 
                            : 'bg-slate-900 border-2 border-slate-600 hover:border-emerald-500 text-transparent hover:text-slate-400'
                        }`}
                        title={isDoneToday ? 'تکمیل شده در روز جاری' : 'کلیک برای ثبت انجام امروز'}
                      >
                        {isDoneToday ? <Check className="w-6 h-6 stroke-[3]" /> : renderIcon(habit.icon, 'w-5 h-5 text-slate-400')}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-sm font-bold truncate ${isDoneToday ? 'text-emerald-300' : 'text-white'}`}>
                            {habit.title}
                          </h4>
                          {partInfo && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-700">
                              {partInfo.title}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                            <Flame className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{toPersianDigits(habit.streak)} روز متوالی</span>
                          </div>
                        </div>

                        {habit.description && (
                          <p className="text-xs text-slate-400 mt-1 truncate">{habit.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Right: 7-Day Dot Matrix */}
                    <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/50">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {daysList.map((dayDate) => {
                          const isDone = habit.completedDates.includes(dayDate);
                          const isCurrent = dayDate === currentDate;
                          const dayNum = parseInt(dayDate.split('-')[2]);
                          const parts = dayDate.split('-');
                          const dayOfWeek = getJalaliDayOfWeek(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
                          const dayName = PERSIAN_WEEKDAY_SHORT[dayOfWeek];

                          return (
                            <button
                              key={dayDate}
                              onClick={() => handleCheck(habit.id, dayDate, isDone)}
                              className={`flex flex-col items-center justify-center w-8 h-10 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                                isDone
                                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                                  : 'bg-slate-900/80 border border-slate-700/60 text-slate-500 hover:border-slate-500'
                              } ${isCurrent ? 'ring-1 ring-amber-400/80' : ''}`}
                              title={`${dayName} (${dayDate}): ${isDone ? 'تکمیل شده' : 'انجام نشده'}`}
                            >
                              <span className="text-[9px] text-slate-400 font-normal">{dayName}</span>
                              <span className="font-mono">{toPersianDigits(dayNum)}</span>
                              {isDone && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5"></span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => onDeleteHabit(habit.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors opacity-60 group-hover:opacity-100 cursor-pointer"
                        title="حذف این عادت"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>نکته: تداوم در زنجیره عادات کلید تمرکز در ۴ پارت روزانه است.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};
