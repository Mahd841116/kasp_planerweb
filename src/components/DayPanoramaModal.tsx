import React, { useState } from 'react';
import { DayNote, DayPart, Task, UniversityCourse } from '../types';
import { CATEGORY_DEFINITIONS, DAY_PARTS, MOOD_CONFIG, PRIORITY_CONFIG } from '../utils/constants';
import { 
  X, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  Sparkles, 
  Copy, 
  Check, 
  Flame, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  getPersianFullDate, 
  toPersianDigits, 
  getJalaliDayOfWeek, 
  parseJalaliDate 
} from '../utils/jalali';
import { soundManager } from '../utils/audio';

interface DayPanoramaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  tasks: Task[];
  courses: UniversityCourse[];
  dayNote?: DayNote;
  onOpenTaskDetail: (task: Task) => void;
}

export const DayPanoramaModal: React.FC<DayPanoramaModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  tasks,
  courses,
  dayNote,
  onOpenTaskDetail
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const remainingTasks = totalTasks - completedTasks;
  const highPriorityTasks = tasks.filter((t) => t.priority === 'HIGH');
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Find university courses for today's day of week
  const { year, month, day } = parseJalaliDate(currentDate);
  const dayOfWeek = getJalaliDayOfWeek(year, month, day);
  const todayCourses = courses.filter((c) => c.dayOfWeek === dayOfWeek);

  const moodInfo = dayNote?.mood ? MOOD_CONFIG[dayNote.mood] : null;

  // Generate Daily text report
  const handleCopyReport = () => {
    soundManager.playClickSound();
    let text = `📊 گزارش روزانه پارتبان | ${getPersianFullDate(currentDate)}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🎯 میزان پیشرفت: ${toPersianDigits(completionPercent)}% (${toPersianDigits(completedTasks)} از ${toPersianDigits(totalTasks)} کار)\n`;
    if (moodInfo) {
      text += `💖 وضعیت انرژی و حس روز: ${moodInfo.icon} ${moodInfo.label}\n`;
    }
    if (dayNote?.reflection) {
      text += `📝 یادداشت روز: ${dayNote.reflection}\n`;
    }
    text += `\n📌 تفکیک پارت‌های ۴گانه:\n`;

    (['MORNING', 'MIDDAY', 'EVENING', 'NIGHT'] as DayPart[]).forEach((pKey) => {
      const pInfo = DAY_PARTS[pKey];
      const pTasks = tasks.filter((t) => t.part === pKey);
      const pDone = pTasks.filter((t) => t.isCompleted).length;
      text += `\n🔹 ${pInfo.title} (${toPersianDigits(pDone)}/${toPersianDigits(pTasks.length)}):\n`;
      if (pTasks.length === 0) {
        text += `  - بدون تسک ثبت‌شده\n`;
      } else {
        pTasks.forEach((t) => {
          text += `  ${t.isCompleted ? '✅' : '⏳'} ${t.title} [${t.startTime || ''}]\n`;
        });
      }
    });

    if (todayCourses.length > 0) {
      text += `\n🎓 کلاس‌های دانشگاه امروز:\n`;
      todayCourses.forEach((c) => {
        text += `  • ${c.courseName} (${c.timeSlot}) - استاد ${c.instructor} [${c.classroom}]\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-inner">
              <BarChart3 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-100">
                  سراسرنما: کل روز در یک نگاه
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono">
                  {toPersianDigits(completionPercent)}% تکمیل
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{getPersianFullDate(currentDate)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="کپی متن گزارش روزانه"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'کپی شد!' : 'کپی گزارش'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">کل وظایف امروز</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">
                  {toPersianDigits(totalTasks)}
                </span>
                <span className="text-[11px] text-slate-400">تسک</span>
              </div>
            </div>

            {/* Completed */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between">
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                انجام شده
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
                  {toPersianDigits(completedTasks)}
                </span>
                <span className="text-[11px] text-emerald-400">{toPersianDigits(completionPercent)}%</span>
              </div>
            </div>

            {/* Remaining */}
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col justify-between">
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                در انتظار انجام
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {toPersianDigits(remainingTasks)}
                </span>
                <span className="text-[11px] text-amber-400">تسک</span>
              </div>
            </div>

            {/* High Priority */}
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex flex-col justify-between">
              <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                فوری و مهم
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl sm:text-3xl font-black text-rose-300 font-mono">
                  {toPersianDigits(highPriorityTasks.length)}
                </span>
                <span className="text-[11px] text-rose-400">اولویت بالا</span>
              </div>
            </div>
          </div>

          {/* Mood & Note Banner if set */}
          {(moodInfo || dayNote?.reflection) && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800/80 to-indigo-950/40 border border-slate-700/60 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {moodInfo && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-bold text-white">
                    <span className="text-base">{moodInfo.icon}</span>
                    <span>حس روز: {moodInfo.label}</span>
                  </div>
                )}
                {dayNote?.reflection && (
                  <p className="text-xs text-slate-300 italic">
                    «{dayNote.reflection}»
                  </p>
                )}
              </div>
              {dayNote?.focusScore && (
                <span className="text-xs text-amber-400 font-bold bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  سطح تمرکز: {toPersianDigits(dayNote.focusScore)} از ۵ ⭐
                </span>
              )}
            </div>
          )}

          {/* 4-Part Day Timeline Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>تایملاین وضعیت ۴ پارت روز:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['MORNING', 'MIDDAY', 'EVENING', 'NIGHT'] as DayPart[]).map((pKey) => {
                const pInfo = DAY_PARTS[pKey];
                const pTasks = tasks.filter((t) => t.part === pKey);
                const pCompleted = pTasks.filter((t) => t.isCompleted).length;
                const pPercent = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;

                return (
                  <div
                    key={pKey}
                    className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-100 block">
                          {pInfo.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {pInfo.timeRange}
                        </span>
                      </div>
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-200 border border-slate-700">
                        {toPersianDigits(pCompleted)} / {toPersianDigits(pTasks.length)} ({toPersianDigits(pPercent)}%)
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${pPercent}%` }}
                      />
                    </div>

                    {/* Tasks inside part */}
                    <div className="space-y-1.5">
                      {pTasks.length > 0 ? (
                        pTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              onClose();
                              onOpenTaskDetail(t);
                            }}
                            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 cursor-pointer transition-colors text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${t.isCompleted ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                              <span className={`truncate font-medium ${t.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                {t.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {toPersianDigits(t.startTime)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-500 italic py-1">کاری برای این پارت تعریف نشده</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's University Schedule */}
          {todayCourses.length > 0 && (
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span>کلاس‌های دانشگاهی امروز ({todayCourses.length} درس):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {todayCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/20 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100">{c.courseName}</span>
                      <span className="font-mono text-[11px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-500/30">
                        {c.timeSlot}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>استاد: {c.instructor}</span>
                      <span>{c.classroom}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
