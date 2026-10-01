import React, { useState } from 'react';
import { Task } from '../types';
import { CATEGORY_DEFINITIONS, DAY_PARTS } from '../utils/constants';
import { 
  X, 
  History, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  Check, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { getPersianFullDate, getTodayJalali, toPersianDigits, addDaysToJalali, getJalaliDayOfWeek, parseJalaliDate } from '../utils/jalali';
import { soundManager } from '../utils/audio';

interface DeferredTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredTasks: Task[];
  onRescheduleToToday: (taskId: string) => void;
  onRescheduleToFriday: (taskId: string) => void;
  onBatchRescheduleToToday: () => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export const DeferredTasksModal: React.FC<DeferredTasksModalProps> = ({
  isOpen,
  onClose,
  deferredTasks,
  onRescheduleToToday,
  onRescheduleToFriday,
  onBatchRescheduleToToday,
  onDeleteTask,
  onCompleteTask
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <History className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100">
                  کارهای معوقه و بک‌لاگ (Backlog)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold font-mono">
                  {toPersianDigits(deferredTasks.length)} کار مانده
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تسک‌های انجام‌نشده روزهای قبل که نیاز به بازآرایی و زمان‌بندی مجدد دارند
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

        {/* Action Bar for Batch Operation */}
        {deferredTasks.length > 0 && (
          <div className="px-4 sm:px-6 py-3 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-slate-300">
              می‌توانید کارهای معوقه را به صورت یکجا یا تکی به امروز یا جمعه ریکاوری منتقل کنید:
            </span>
            <button
              onClick={() => {
                soundManager.playClickSound();
                onBatchRescheduleToToday();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>انتقال همه به امروز</span>
            </button>
          </div>
        )}

        {/* Task List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {deferredTasks.length > 0 ? (
            deferredTasks.map((task) => {
              const categoryInfo = CATEGORY_DEFINITIONS[task.category] || CATEGORY_DEFINITIONS.personal;
              const partInfo = DAY_PARTS[task.part];

              return (
                <div
                  key={task.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-100">
                          {task.title}
                        </h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${categoryInfo.bg} ${categoryInfo.text} ${categoryInfo.border}`}>
                          {categoryInfo.label}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-700">
                          {partInfo.title}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {task.deferredNote && (
                        <p className="text-[11px] text-amber-300 mt-1.5 bg-amber-950/40 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                          دلیل: {task.deferredNote}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>تاریخ اولیه: {getPersianFullDate(task.jalaliDate)}</span>
                      </div>
                    </div>

                    {/* Quick Reschedule Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      <button
                        onClick={() => {
                          soundManager.playClickSound();
                          onRescheduleToToday(task.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
                        title="انتقال به برنامه امروز"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>انتقال به امروز</span>
                      </button>

                      <button
                        onClick={() => {
                          soundManager.playClickSound();
                          onRescheduleToFriday(task.id);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
                        title="انتقال به جمعه (روز ریکاوری)"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>انتقال به جمعه</span>
                      </button>

                      <button
                        onClick={() => {
                          soundManager.playCompleteSound();
                          onCompleteTask(task.id);
                        }}
                        className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                        title="انجام شد"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                      </button>

                      <button
                        onClick={() => {
                          soundManager.playClickSound();
                          onDeleteTask(task.id);
                        }}
                        className="p-1.5 rounded-xl bg-slate-700 hover:bg-rose-900/80 text-slate-400 hover:text-rose-300 transition-colors"
                        title="حذف دائمی"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-200">بک‌لاگ کاملاً تمیز است!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                هیچ کار معوقه یا عقب‌افتاده‌ای ندارید. عالی پیش می‌روید!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
