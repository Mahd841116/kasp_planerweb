import React, { useState } from 'react';
import { StartupProfile, Task } from '../types';
import { getCategoryStyles, DAY_PARTS, PRIORITY_CONFIG } from '../utils/constants';
import { 
  X, 
  Clock, 
  Calendar, 
  Bell, 
  Check, 
  Edit, 
  Trash2, 
  ArrowRightLeft, 
  Layers, 
  AlertCircle,
  Copy
} from 'lucide-react';
import { 
  getPersianFullDate, 
  toPersianDigits, 
  addDaysToJalali 
} from '../utils/jalali';
import { soundManager } from '../utils/audio';

interface TaskDetailModalProps {
  task: Task | null;
  startups?: Record<string, StartupProfile>;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onReschedule: (task: Task, newDate: string, note?: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  startups,
  isOpen,
  onClose,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onReschedule
}) => {
  const [showRescheduleMenu, setShowRescheduleMenu] = useState(false);
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !task) return null;

  const categoryInfo = getCategoryStyles(task.category, startups);
  const partInfo = DAY_PARTS[task.part];
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.LOW;

  const handleCopyText = () => {
    const text = `📌 ${task.title}\n📅 تاریخ: ${getPersianFullDate(task.jalaliDate)}\n⏰ پارت: ${partInfo.title} (${task.startTime || ''} - ${task.endTime || ''})\n🏷️ دسته: ${categoryInfo.label}\n📝 توضیحات: ${task.description || '-'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundManager.playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickReschedule = (daysToAdd: number, reason: string) => {
    const newDate = addDaysToJalali(task.jalaliDate, daysToAdd);
    onReschedule(task, newDate, reason);
    setShowRescheduleMenu(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span 
              className="w-3.5 h-3.5 rounded-full shadow-md"
              style={{ backgroundColor: task.isCompleted ? '#10b981' : categoryInfo.color }}
            />
            <h3 className="text-base font-bold text-slate-100">جزئیات کامل کار</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="کپی متن کار"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {copied && (
            <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-semibold animate-pulse">
              اطلاعات تسک در کلیپ‌بورد کپی شد!
            </div>
          )}

          {/* Title */}
          <div>
            <h2 className={`text-lg sm:text-xl font-bold leading-relaxed ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'}`}>
              {task.title}
            </h2>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {/* Part */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                پارت زمانی
              </span>
              <span className="text-xs font-bold text-slate-200">
                {partInfo.title}
              </span>
            </div>

            {/* Category */}
            <div 
              className="p-2.5 rounded-xl border flex flex-col gap-1"
              style={{
                borderColor: categoryInfo.customStyle ? categoryInfo.customStyle.borderColor : undefined,
                backgroundColor: categoryInfo.customStyle ? categoryInfo.customStyle.backgroundColor : undefined
              }}
            >
              <span className="text-[10px] text-slate-400">حوزه کاری</span>
              <span 
                className="text-xs font-bold"
                style={{ color: categoryInfo.color }}
              >
                {categoryInfo.label}
              </span>
            </div>

            {/* Priority */}
            <div className={`p-2.5 rounded-xl border ${priorityInfo.bg} flex flex-col gap-1`}>
              <span className="text-[10px] text-slate-400">اولویت</span>
              <span className={`text-xs font-bold ${priorityInfo.color}`}>
                {priorityInfo.label}
              </span>
            </div>

            {/* Time */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                ساعت اجرا
              </span>
              <span className="text-xs font-bold text-slate-200 font-mono">
                {task.startTime ? `${toPersianDigits(task.startTime)} - ${toPersianDigits(task.endTime || '')}` : 'تعیین‌نشده'}
              </span>
            </div>
          </div>

          {/* Date & Reminder Row */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex-wrap text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>تاریخ برنامه‌ریزی:</span>
              <span className="font-bold text-white">
                {getPersianFullDate(task.jalaliDate)}
              </span>
            </div>

            {task.hasAlarm && (
              <div className="flex items-center gap-1.5 text-amber-400 font-mono">
                <Bell className="w-3.5 h-3.5" />
                <span>یادآور فعال: {toPersianDigits(task.reminderTime || task.startTime)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-300">توضیحات و یادداشت‌ها:</span>
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-xs sm:text-sm text-slate-200 leading-relaxed min-h-[70px] whitespace-pre-wrap">
              {task.description || <span className="text-slate-500 italic">توضیحاتی برای این کار وارد نشده است.</span>}
            </div>
          </div>

          {/* Deferred / Reschedule Note if exists */}
          {task.isDeferred && task.deferredNote && (
            <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">یادداشت کار معوقه:</span>
                <p className="mt-0.5">{task.deferredNote}</p>
              </div>
            </div>
          )}

          {/* Reschedule Dropdown Area */}
          {showRescheduleMenu && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
              <h4 className="text-xs font-bold text-indigo-200">انتقال کار به تاریخ دیگر:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickReschedule(1, 'انتقال به فردا')}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-100 text-xs border border-indigo-500/30 transition-colors cursor-pointer"
                >
                  انتقال به فردا (+۱ روز)
                </button>
                <button
                  onClick={() => handleQuickReschedule(2, 'انتقال به پس‌فردا')}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-100 text-xs border border-indigo-500/30 transition-colors cursor-pointer"
                >
                  پس‌فردا (+۲ روز)
                </button>
                <button
                  onClick={() => handleQuickReschedule(3, 'انتقال به جمعه ریکاوری')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 text-xs border border-emerald-500/30 transition-colors col-span-2 sm:col-span-1 cursor-pointer"
                >
                  جمعه (روز ریکاوری)
                </button>
              </div>

              <div className="pt-2 border-t border-indigo-500/30">
                <label className="text-[11px] text-slate-300 block mb-1">دلیل انتقال یا یادداشت جبرانی:</label>
                <input
                  type="text"
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder="مثال: اولویت‌بندی مجدد، تداخل با جلسه..."
                  className="w-full text-xs bg-slate-900/90 border border-indigo-500/30 rounded-lg p-2 text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2 flex-wrap">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClickSound();
                onToggleComplete(task.id);
                onClose();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                task.isCompleted
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{task.isCompleted ? 'علامت‌گذاری به عنوان انجام‌نشده' : 'تکمیل کار'}</span>
            </button>

            <button
              onClick={() => setShowRescheduleMenu(!showRescheduleMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>انتقال به روز دیگر</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClickSound();
                onEditTask(task);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>ویرایش</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClickSound();
                onDeleteTask(task.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
