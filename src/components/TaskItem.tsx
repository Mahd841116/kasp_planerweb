import React from 'react';
import { StartupProfile, Task } from '../types';
import { getCategoryStyles, PRIORITY_CONFIG } from '../utils/constants';
import { soundManager } from '../utils/audio';
import { 
  Check, 
  Clock, 
  Bell, 
  ArrowRightLeft, 
  Trash2, 
  Edit, 
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPersianDigits } from '../utils/jalali';

interface TaskItemProps {
  task: Task;
  startups?: Record<string, StartupProfile>;
  onToggleComplete: (taskId: string) => void;
  onOpenDetail: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onRescheduleTask: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  startups,
  onToggleComplete,
  onOpenDetail,
  onEditTask,
  onDeleteTask,
  onRescheduleTask
}) => {
  const categoryInfo = getCategoryStyles(task.category, startups);
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.LOW;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.isCompleted) {
      soundManager.playCompleteSound();
      // Confetti burst from button position
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { x, y },
        colors: [categoryInfo.color || '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'],
        disableForReducedMotion: true
      });
    } else {
      soundManager.playClickSound();
    }
    onToggleComplete(task.id);
  };

  return (
    <div
      onClick={() => onOpenDetail(task)}
      style={
        categoryInfo.customStyle
          ? {
              borderRight: `3px solid ${categoryInfo.color}`
            }
          : undefined
      }
      className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
        task.isCompleted
          ? 'bg-slate-900/40 border-slate-800/80 opacity-75 hover:opacity-100'
          : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/70 hover:border-slate-600 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleCheckboxClick}
        className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer ${
          task.isCompleted
            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
            : 'border-2 border-slate-500 hover:border-indigo-400 bg-slate-900/50'
        }`}
      >
        {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          {/* Title */}
          <h4
            className={`text-xs sm:text-sm font-semibold leading-snug transition-all ${
              task.isCompleted
                ? 'line-through text-slate-500'
                : 'text-slate-100 group-hover:text-indigo-200'
            }`}
          >
            {task.title}
          </h4>

          {/* Time badge */}
          {task.startTime && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0 bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700/50">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>
                {toPersianDigits(task.startTime)}
                {task.endTime ? ` - ${toPersianDigits(task.endTime)}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Description snippet if present */}
        {task.description && (
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Badges & Meta Row */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          {/* Category Chip with dynamic startup color */}
          <span
            style={
              categoryInfo.customStyle
                ? {
                    color: categoryInfo.color,
                    backgroundColor: categoryInfo.customStyle.backgroundColor,
                    borderColor: categoryInfo.customStyle.borderColor
                  }
                : undefined
            }
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
              !categoryInfo.customStyle ? `${categoryInfo.bg} ${categoryInfo.text} ${categoryInfo.border}` : ''
            }`}
          >
            {categoryInfo.label}
          </span>

          {/* Priority Chip */}
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-md border ${priorityInfo.bg} ${priorityInfo.color}`}
          >
            {priorityInfo.label}
          </span>

          {/* Alarm Badge */}
          {task.hasAlarm && (
            <span
              className="flex items-center gap-0.5 text-[10px] text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-500/30 font-mono"
              title={`یادآور در ساعت ${toPersianDigits(task.reminderTime || task.startTime)}`}
            >
              <Bell className="w-2.5 h-2.5 text-amber-400" />
              <span>{toPersianDigits(task.reminderTime || task.startTime)}</span>
            </span>
          )}

          {/* Deferred Badge */}
          {task.isDeferred && (
            <span
              className="flex items-center gap-0.5 text-[10px] text-rose-300 bg-rose-950/40 px-1.5 py-0.5 rounded-md border border-rose-500/30"
              title={task.deferredNote || 'کار معوقه / جبرانی'}
            >
              <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
              <span>جبرانی</span>
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Buttons on Hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 self-start">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playClickSound();
            onRescheduleTask(task);
          }}
          className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
          title="انتقال به روز دیگر (Reschedule)"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playClickSound();
            onEditTask(task);
          }}
          className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
          title="ویرایش کار"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playClickSound();
            onDeleteTask(task.id);
          }}
          className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 cursor-pointer"
          title="حذف"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
