import React, { useState } from 'react';
import { DayPart, EisenhowerQuadrant, Task } from '../types';
import { CATEGORY_DEFINITIONS, DAY_PARTS } from '../utils/constants';
import { soundManager } from '../utils/audio';
import { toPersianDigits } from '../utils/jalali';
import { 
  X, 
  Compass, 
  AlertTriangle, 
  Target, 
  Clock, 
  Trash2, 
  Check, 
  ArrowRightLeft, 
  Sparkles,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EisenhowerMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onUpdateTask: (task: Task) => void;
  onQuickAdd: (part: DayPart) => void;
  currentDate: string;
}

export const EisenhowerMatrixModal: React.FC<EisenhowerMatrixModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onToggleTask,
  onUpdateTask,
  onQuickAdd,
  currentDate
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (!isOpen) return null;

  // Filter tasks for the active date
  const todayTasks = tasks.filter(t => t.jalaliDate === currentDate);

  // Group tasks into 4 Eisenhower quadrants based on priority or explicit flag
  const getQuadrant = (task: Task): EisenhowerQuadrant => {
    if (task.eisenhower) return task.eisenhower;
    if (task.priority === 'HIGH') {
      return task.part === 'MORNING' || task.part === 'MIDDAY' ? 'DO_FIRST' : 'SCHEDULE';
    }
    if (task.priority === 'MEDIUM') return 'SCHEDULE';
    return task.part === 'NIGHT' ? 'ELIMINATE' : 'DELEGATE';
  };

  const doFirstTasks = todayTasks.filter(t => getQuadrant(t) === 'DO_FIRST');
  const scheduleTasks = todayTasks.filter(t => getQuadrant(t) === 'SCHEDULE');
  const delegateTasks = todayTasks.filter(t => getQuadrant(t) === 'DELEGATE');
  const eliminateTasks = todayTasks.filter(t => getQuadrant(t) === 'ELIMINATE');

  const handleSetQuadrant = (task: Task, quad: EisenhowerQuadrant) => {
    soundManager.playClickSound();
    onUpdateTask({
      ...task,
      eisenhower: quad
    });
  };

  const handleSetPart = (task: Task, part: DayPart) => {
    soundManager.playClickSound();
    onUpdateTask({
      ...task,
      part
    });
  };

  const handleToggle = (taskId: string, wasCompleted: boolean) => {
    soundManager.playClickSound();
    if (!wasCompleted) {
      soundManager.playCompleteSound();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    }
    onToggleTask(taskId);
  };

  const renderTaskRow = (task: Task) => {
    const cat = CATEGORY_DEFINITIONS[task.category] || CATEGORY_DEFINITIONS.personal;
    const part = DAY_PARTS[task.part];

    return (
      <div
        key={task.id}
        className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 group ${
          task.isCompleted 
            ? 'bg-slate-900/60 border-emerald-500/30 opacity-70' 
            : 'bg-slate-800/90 border-slate-700 hover:border-slate-500'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            onClick={() => handleToggle(task.id, task.isCompleted)}
            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              task.isCompleted 
                ? 'bg-emerald-500 text-white' 
                : 'border border-slate-500 hover:border-emerald-400'
            }`}
          >
            {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <div className="min-w-0 flex-1">
            <span className={`font-semibold block truncate ${task.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
              {task.title}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
              <span className={`px-1.5 py-0.2 rounded font-medium ${cat.bg} ${cat.text}`}>
                {cat.label}
              </span>
              <span className="text-slate-400">
                {part.title} ({task.startTime})
              </span>
            </div>
          </div>
        </div>

        {/* Quick Quadrant / Part Mover Dropdown */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
          <select
            value={task.part}
            onChange={(e) => handleSetPart(task, e.target.value as DayPart)}
            className="bg-slate-900 text-[10px] text-slate-300 border border-slate-700 rounded-lg px-1.5 py-0.5 focus:outline-none"
            title="تغییر پارت زمانی"
          >
            <option value="MORNING">پارت ۱: صبح</option>
            <option value="MIDDAY">پارت ۲: ظهر</option>
            <option value="EVENING">پارت ۳: عصر</option>
            <option value="NIGHT">پارت ۴: شب</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl shadow-indigo-950/50 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">ماتریس اولویت‌بندی آیزنهاور</h2>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  تفکیک فوری و مهم
                </span>
              </div>
              <p className="text-xs text-slate-400">
                دسته‌بندی استراتژیک تسک‌های روز برای تصمیم‌گیری سریع و تخصیص به ۴ پارت اصلی
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Quadrants Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Q1: Urgent & Important (DO FIRST) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/30 to-slate-900 border-2 border-rose-500/40 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-rose-300">۱. انجام سریع (فوری و مهم)</h3>
                  <span className="text-[10px] text-slate-400">بحران‌ها، ددلاین‌های امروز، سرور و باگ‌های حیاتی</span>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-500/30 font-mono">
                {toPersianDigits(doFirstTasks.length)}
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-56">
              {doFirstTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">هیچ تسک بحرانی و فوری برای امروز نیست. عالی است! 🎉</div>
              ) : (
                doFirstTasks.map(renderTaskRow)
              )}
            </div>
          </div>

          {/* Q2: Not Urgent but Important (SCHEDULE - Core Focus) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-900 border-2 border-indigo-500/40 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-indigo-500/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-indigo-300">۲. پارت‌بندی و تمرکز عمیق (مهم غیرفوری)</h3>
                  <span className="text-[10px] text-slate-400">معماری استارتاپ، مطالعه دروس، ورزش، رشد بلندمدت</span>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-500/30 font-mono">
                {toPersianDigits(scheduleTasks.length)}
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-56">
              {scheduleTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">تسکی در این بخش نیست. اهداف استراتژیک را اضافه کنید.</div>
              ) : (
                scheduleTasks.map(renderTaskRow)
              )}
            </div>
          </div>

          {/* Q3: Urgent but Not Important (DELEGATE / BATCH) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 to-slate-900 border-2 border-amber-500/40 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-300">۳. واگذاری یا تجمیع سریع (فوری غیرمهم)</h3>
                  <span className="text-[10px] text-slate-400">پاسخ به ایمیل‌ها، هماهنگی‌های روتین، پیام‌های گروهی</span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-500/30 font-mono">
                {toPersianDigits(delegateTasks.length)}
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-56">
              {delegateTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">موردی در این دسته ثبت نشده است.</div>
              ) : (
                delegateTasks.map(renderTaskRow)
              )}
            </div>
          </div>

          {/* Q4: Not Urgent & Not Important (ELIMINATE) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900 border-2 border-slate-700/60 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-slate-400 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-300">۴. حذف یا زمان استراحت (غیرفوری غیرمهم)</h3>
                  <span className="text-[10px] text-slate-400">شبکه‌های اجتماعی، وبگردی بی‌هدف، کارهای اضافه</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-700 font-mono">
                {toPersianDigits(eliminateTasks.length)}
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-56">
              {eliminateTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">کارهای کم‌ارزش به حداقل رسیده است.</div>
              ) : (
                eliminateTasks.map(renderTaskRow)
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>نکته طلایی: ۸۰٪ انرژی خود را در پارت‌های ۱ و ۳ روی کارهای خانه ۲ (مهم غیرفوری) بگذارید.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            بستن ماتریس
          </button>
        </div>

      </div>
    </div>
  );
};
