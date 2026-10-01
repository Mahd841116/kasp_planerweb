import React, { useState, useEffect, useRef } from 'react';
import { DayPart, Habit, Task, UniversityCourse } from '../types';
import { CATEGORY_DEFINITIONS, DAY_PARTS } from '../utils/constants';
import { soundManager } from '../utils/audio';
import { 
  Search, 
  X, 
  Plus, 
  Clock, 
  GraduationCap, 
  Rocket, 
  Flame, 
  ArrowRight,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  courses: UniversityCourse[];
  habits: Habit[];
  onSelectTask: (task: Task) => void;
  onQuickCreateTask: (title: string, part: DayPart) => void;
  onOpenPanorama: () => void;
  onOpenCalendar: () => void;
  onOpenFocusTimer: () => void;
  onOpenHabits: () => void;
  onOpenEisenhower: () => void;
  currentDate: string;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  tasks,
  courses,
  habits,
  onSelectTask,
  onQuickCreateTask,
  onOpenPanorama,
  onOpenCalendar,
  onOpenFocusTimer,
  onOpenHabits,
  onOpenEisenhower,
  currentDate
}) => {
  const [query, setQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState<DayPart>('MORNING');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Search Results
  const matchingTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(trimmed) || 
    t.description?.toLowerCase().includes(trimmed)
  ).slice(0, 5);

  const matchingCourses = courses.filter(c => 
    c.courseName.toLowerCase().includes(trimmed) || 
    c.instructor.toLowerCase().includes(trimmed)
  );

  const matchingHabits = habits.filter(h => 
    h.title.toLowerCase().includes(trimmed)
  );

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    soundManager.playCompleteSound();
    onQuickCreateTask(query.trim(), selectedPart);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl shadow-indigo-950/80 overflow-hidden flex flex-col">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            placeholder="جستجو در تسک‌ها، دروس، عادات یا تایپ کار جدید و زدن اینتر..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Dynamic List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          
          {/* Quick Create Action when typing */}
          {trimmed && (
            <form onSubmit={handleCreateNew} className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-indigo-300 block">افزودن فوری تسک:</span>
                  <span className="text-sm font-bold text-white truncate block">«{query}»</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={selectedPart}
                  onChange={(e) => setSelectedPart(e.target.value as DayPart)}
                  className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  {Object.values(DAY_PARTS).map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  ثبت سریع ↵
                </button>
              </div>
            </form>
          )}

          {/* Quick Nav Shortcut Buttons */}
          {!trimmed && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 px-2 block">دسترسی‌های سریع کاسپ پلنر</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => { onClose(); onOpenPanorama(); }}
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-indigo-900/40 border border-slate-700/60 hover:border-indigo-500/40 text-left text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>کل روز در یک نگاه</span>
                </button>

                <button
                  onClick={() => { onClose(); onOpenFocusTimer(); }}
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-amber-900/40 border border-slate-700/60 hover:border-amber-500/40 text-left text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>تایمر تمرکز پومودورو</span>
                </button>

                <button
                  onClick={() => { onClose(); onOpenHabits(); }}
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-emerald-900/40 border border-slate-700/60 hover:border-emerald-500/40 text-left text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-emerald-400" />
                  <span>ردیاب عادات روزانه</span>
                </button>

                <button
                  onClick={() => { onClose(); onOpenEisenhower(); }}
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-purple-900/40 border border-slate-700/60 hover:border-purple-500/40 text-left text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Rocket className="w-4 h-4 text-purple-400" />
                  <span>ماتریس آیزنهاور</span>
                </button>

                <button
                  onClick={() => { onClose(); onOpenCalendar(); }}
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-sky-900/40 border border-slate-700/60 hover:border-sky-500/40 text-left text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span>تقویم ماهانه جلالی</span>
                </button>
              </div>
            </div>
          )}

          {/* Matching Tasks */}
          {matchingTasks.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 px-2 block">تسک‌های منطبق ({matchingTasks.length})</span>
              {matchingTasks.map(t => (
                <button
                  key={t.id}
                  onClick={() => { onSelectTask(t); onClose(); }}
                  className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700/40 text-right flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className={`w-4 h-4 ${t.isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className={`text-xs font-semibold truncate ${t.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {DAY_PARTS[t.part].title} • {t.jalaliDate}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Matching Courses */}
          {matchingCourses.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 px-2 block">کلاس‌های دانشگاه</span>
              {matchingCourses.map(c => (
                <div key={c.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-purple-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white">{c.courseName}</span>
                    <span className="text-slate-400 text-[11px]">({c.instructor})</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">{c.timeSlot} • {c.classroom}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matching Habits */}
          {matchingHabits.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 px-2 block">عادات روزانه</span>
              {matchingHabits.map(h => (
                <div key={h.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white">{h.title}</span>
                  </div>
                  <span className="text-amber-400 font-bold text-[11px]">{h.streak} روز زنجیره</span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>کلید میانبر باز کردن جستجوی سریع: <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Ctrl + K</kbd></span>
          <span>کاسپ پلنر</span>
        </div>

      </div>
    </div>
  );
};
