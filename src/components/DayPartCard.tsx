import React from 'react';
import { DayPart, Goal, StartupProfile, Task } from '../types';
import { DAY_PARTS } from '../utils/constants';
import { TaskItem } from './TaskItem';
import { 
  Sun, 
  Building2, 
  Dumbbell, 
  Moon, 
  Plus, 
  Timer, 
  Bell, 
  Target, 
  CheckCircle2, 
  Circle,
  HelpCircle
} from 'lucide-react';
import { toPersianDigits } from '../utils/jalali';
import { soundManager } from '../utils/audio';

interface DayPartCardProps {
  partKey: DayPart;
  tasks: Task[];
  partGoal?: Goal;
  startups?: Record<string, StartupProfile>;
  isActiveCurrentPart: boolean;
  onAddTask: (part: DayPart) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onOpenTaskDetail: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onRescheduleTask: (task: Task) => void;
  onToggleGoalComplete: (goalId: string) => void;
  onOpenGoalForm: (part: DayPart, existingGoal?: Goal) => void;
  onStartFocusInPart: (part: DayPart) => void;
}

export const DayPartCard: React.FC<DayPartCardProps> = ({
  partKey,
  tasks,
  partGoal,
  startups,
  isActiveCurrentPart,
  onAddTask,
  onToggleTaskComplete,
  onOpenTaskDetail,
  onEditTask,
  onDeleteTask,
  onRescheduleTask,
  onToggleGoalComplete,
  onOpenGoalForm,
  onStartFocusInPart
}) => {
  const partInfo = DAY_PARTS[partKey];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Render Part Icon
  const renderIcon = () => {
    switch (partKey) {
      case 'MORNING':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'MIDDAY':
        return <Building2 className="w-5 h-5 text-sky-400" />;
      case 'EVENING':
        return <Dumbbell className="w-5 h-5 text-emerald-400" />;
      case 'NIGHT':
        return <Moon className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleAlarmTest = () => {
    soundManager.playAlarmSound();
  };

  return (
    <div
      className={`relative rounded-3xl p-4 sm:p-5 border transition-all duration-300 shadow-xl backdrop-blur-xl ${
        isActiveCurrentPart
          ? `bg-gradient-to-b ${partInfo.cardBg} ring-2 ring-indigo-400/50 shadow-indigo-500/10`
          : 'bg-slate-800/50 hover:bg-slate-800/70 border-slate-700/60'
      }`}
    >
      {/* Active Part Glow Indicator */}
      {isActiveCurrentPart && (
        <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-indigo-500 text-white text-[11px] font-bold tracking-wide shadow-md shadow-indigo-500/50 flex items-center gap-1.5 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-white"></span>
          <span>هم‌اکنون فعال در ساعت جاری</span>
        </div>
      )}

      {/* Part Card Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-inner">
            {renderIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-100">
                {partInfo.title}
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900/60 text-slate-300 border border-slate-700/60">
                {partInfo.timeRange}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {partInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-1">
          {/* Quick Focus Pomodoro button */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onStartFocusInPart(partKey);
            }}
            className="p-2 rounded-xl bg-slate-900/70 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700/70 transition-colors cursor-pointer"
            title="شروع تایمر تمرکز پومودورو در این پارت"
          >
            <Timer className="w-4 h-4" />
          </button>

          {/* Alarm reminder button */}
          <button
            onClick={handleAlarmTest}
            className="p-2 rounded-xl bg-slate-900/70 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border border-slate-700/70 transition-colors cursor-pointer"
            title="تست اعلان صوتی پارت"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onAddTask(partKey);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>افزودن کار</span>
          </button>
        </div>
      </div>

      {/* Focus Area guidance tip */}
      <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-slate-700/40 text-[11px] text-slate-300 flex items-center gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate">{partInfo.focusArea}</span>
      </div>

      {/* Part Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">پیشرفت پارت:</span>
          <span className="font-mono text-[11px] font-bold text-slate-200">
            {toPersianDigits(completedTasks)} از {toPersianDigits(totalTasks)} کار ({toPersianDigits(progressPercent)}%)
          </span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/40">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              progressPercent === 100
                ? 'bg-emerald-500'
                : progressPercent > 50
                ? 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Part Key Target Row */}
      <div className="mt-3.5 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Target className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 block font-medium">تارگت کلیدی این پارت:</span>
            {partGoal ? (
              <p className={`text-xs font-bold truncate ${partGoal.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {partGoal.title}
              </p>
            ) : (
              <p className="text-xs text-slate-500 italic">
                هنوز تارگتی برای این پارت ثبت نشده
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {partGoal ? (
            <button
              onClick={() => {
                if (!partGoal.isCompleted) soundManager.playCompleteSound();
                else soundManager.playClickSound();
                onToggleGoalComplete(partGoal.id);
              }}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              title={partGoal.isCompleted ? 'علامت‌گذاری به عنوان انجام نشده' : 'تکمیل تارگت'}
            >
              {partGoal.isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </button>
          ) : null}

          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenGoalForm(partKey, partGoal);
            }}
            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors cursor-pointer"
          >
            {partGoal ? 'ویرایش' : '+ تعیین'}
          </button>
        </div>
      </div>

      {/* Task List Inside Part */}
      <div className="mt-3.5 space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              startups={startups}
              onToggleComplete={onToggleTaskComplete}
              onOpenDetail={onOpenTaskDetail}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onRescheduleTask={onRescheduleTask}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/20">
            <p className="text-xs text-slate-400">کاری برای این پارت ثبت نشده است.</p>
            <button
              onClick={() => {
                soundManager.playClickSound();
                onAddTask(partKey);
              }}
              className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن اولین کار</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
