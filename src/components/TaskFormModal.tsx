import React, { useState, useEffect } from 'react';
import { DayPart, Priority, Task, TaskCategory } from '../types';
import { CATEGORY_DEFINITIONS, DAY_PARTS, PRIORITY_CONFIG } from '../utils/constants';
import { 
  X, 
  Check, 
  Clock, 
  Calendar, 
  Bell, 
  Tag, 
  Flag, 
  Layers
} from 'lucide-react';
import { getPersianFullDate, parseJalaliDate, formatJalaliDate, getTodayJalali } from '../utils/jalali';
import { soundManager } from '../utils/audio';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (taskData: Partial<Task>) => void;
  initialDate: string;
  initialPart?: DayPart;
  taskToEdit?: Task | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  initialDate,
  initialPart = 'MORNING',
  taskToEdit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jalaliDate, setJalaliDate] = useState(initialDate);
  const [part, setPart] = useState<DayPart>(initialPart);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<TaskCategory>('startup_1');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [hasAlarm, setHasAlarm] = useState(false);
  const [reminderTime, setReminderTime] = useState('07:50');
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setJalaliDate(taskToEdit.jalaliDate);
      setPart(taskToEdit.part);
      setStartTime(taskToEdit.startTime || '08:00');
      setEndTime(taskToEdit.endTime || '10:00');
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setHasAlarm(taskToEdit.hasAlarm);
      setReminderTime(taskToEdit.reminderTime || taskToEdit.startTime || '07:50');
    } else {
      setTitle('');
      setDescription('');
      setJalaliDate(initialDate);
      setPart(initialPart);
      // set sensible default times based on chosen part
      if (initialPart === 'MORNING') {
        setStartTime('08:00');
        setEndTime('10:00');
      } else if (initialPart === 'MIDDAY') {
        setStartTime('13:00');
        setEndTime('15:00');
      } else if (initialPart === 'EVENING') {
        setStartTime('17:00');
        setEndTime('18:30');
      } else {
        setStartTime('21:00');
        setEndTime('22:30');
      }
      setCategory('startup_1');
      setPriority('MEDIUM');
      setHasAlarm(false);
      setReminderTime('07:50');
    }
    setError('');
  }, [taskToEdit, initialDate, initialPart, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('لطفاً عنوان کار را وارد کنید.');
      return;
    }

    soundManager.playClickSound();
    onSaveTask({
      id: taskToEdit ? taskToEdit.id : undefined,
      title: title.trim(),
      description: description.trim(),
      jalaliDate,
      part,
      startTime,
      endTime,
      category,
      priority,
      hasAlarm,
      reminderTime: hasAlarm ? (reminderTime || startTime) : undefined,
      isCompleted: taskToEdit ? taskToEdit.isCompleted : false,
      isDeferred: taskToEdit ? taskToEdit.isDeferred : false
    });
    onClose();
  };

  const handlePartChange = (newPart: DayPart) => {
    setPart(newPart);
    if (newPart === 'MORNING' && !taskToEdit) {
      setStartTime('08:00');
      setEndTime('10:00');
    } else if (newPart === 'MIDDAY' && !taskToEdit) {
      setStartTime('13:00');
      setEndTime('15:00');
    } else if (newPart === 'EVENING' && !taskToEdit) {
      setStartTime('17:00');
      setEndTime('18:30');
    } else if (newPart === 'NIGHT' && !taskToEdit) {
      setStartTime('21:00');
      setEndTime('22:30');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-100">
              {taskToEdit ? 'ویرایش تسک' : 'افزودن کار جدید'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-semibold">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              عنوان کار <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="مثال: طراحی اسکیما دیتابیس زوپیت، کلاس هوش مصنوعی..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              autoFocus
            />
          </div>

          {/* Day Part Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>پارت زمانی روز:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(DAY_PARTS) as DayPart[]).map((pKey) => {
                const info = DAY_PARTS[pKey];
                const isSelected = part === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => handlePartChange(pKey)}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block text-xs font-bold">{info.title}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">{info.timeRange}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Start Time */}
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>ساعت شروع:</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>ساعت پایان:</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>تاریخ شمسی:</span>
              </label>
              <input
                type="text"
                value={jalaliDate}
                onChange={(e) => setJalaliDate(e.target.value)}
                placeholder="1405-07-08"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>حوزه کاری و استارتاپ:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.entries(CATEGORY_DEFINITIONS) as [TaskCategory, { label: string; text: string; bg: string; border: string }][]).map(([catKey, catInfo]) => {
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? `${catInfo.bg} ${catInfo.border} ${catInfo.text} ring-1 ring-current font-bold`
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs">{catInfo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1 mb-1.5">
              <Flag className="w-3.5 h-3.5 text-rose-400" />
              <span>سطح اولویت:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(PRIORITY_CONFIG) as [Priority, { label: string; color: string; bg: string }][]).map(([pKey, pInfo]) => {
                const isSelected = priority === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => setPriority(pKey)}
                    className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? `${pInfo.bg} ${pInfo.color} ring-1 ring-current font-bold`
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {pInfo.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alarm / Reminder Toggle */}
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">یادآور صوتی (Alarm)</span>
                <span className="text-[11px] text-slate-400">پخش زنگ صوتی در ساعت تعیین شده</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasAlarm && (
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-slate-900 border border-amber-500/40 rounded-lg px-2 py-1 text-xs text-amber-300 font-mono"
                />
              )}
              <input
                type="checkbox"
                checked={hasAlarm}
                onChange={(e) => setHasAlarm(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              توضیحات و نکات تکمیلی:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="شرح کار، لینک‌ها، پیش‌نیازها و اهداف خروجی این تسک..."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{taskToEdit ? 'بروزرسانی کار' : 'ثبت کار در پارت'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
