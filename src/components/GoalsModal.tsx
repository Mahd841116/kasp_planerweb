import React, { useState } from 'react';
import { DayPart, Goal, GoalLevel, TaskCategory } from '../types';
import { CATEGORY_DEFINITIONS, DAY_PARTS } from '../utils/constants';
import { 
  X, 
  Target, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Layers, 
  Check 
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { toPersianDigits } from '../utils/jalali';

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  currentDate: string;
  onSaveGoal: (goal: Goal) => void;
  onToggleGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  initialPart?: DayPart;
  initialGoalToEdit?: Goal | null;
}

export const GoalsModal: React.FC<GoalsModalProps> = ({
  isOpen,
  onClose,
  goals,
  currentDate,
  onSaveGoal,
  onToggleGoal,
  onDeleteGoal,
  initialPart,
  initialGoalToEdit
}) => {
  const [activeTab, setActiveTab] = useState<GoalLevel>('PART');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<GoalLevel>('PART');
  const [part, setPart] = useState<DayPart>(initialPart || 'MORNING');
  const [category, setCategory] = useState<TaskCategory>('startup_1');
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    soundManager.playClickSound();
    setTitle('');
    setLevel(activeTab);
    setPart(initialPart || 'MORNING');
    setCategory('startup_1');
    setProgress(0);
    setEditingGoalId(null);
    setIsAddingGoal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    soundManager.playClickSound();
    onSaveGoal({
      id: editingGoalId || `goal-${Date.now()}`,
      title: title.trim(),
      level,
      targetScope: currentDate,
      part: level === 'PART' ? part : undefined,
      category,
      isCompleted: progress === 100,
      progress
    });

    setIsAddingGoal(false);
    setEditingGoalId(null);
  };

  const filteredGoals = goals.filter((g) => {
    if (activeTab === 'PART') return g.level === 'PART';
    if (activeTab === 'DAILY') return g.level === 'DAILY';
    if (activeTab === 'WEEKLY') return g.level === 'WEEKLY';
    return g.level === 'MONTHLY' || g.level === 'YEARLY';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Target className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100">
                مرکز تارگت‌ها و اهداف استراتژیک
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تعریف تارگت پارت‌های روز، اهداف روزانه، هفتگی و اسپرینت‌ها
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAddingGoal && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>تعریف تارگت</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="p-3 bg-slate-800/60 border-b border-slate-700/60 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('PART')}
            className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 ${
              activeTab === 'PART' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            تارگت‌های ۴ پارت روز
          </button>
          <button
            onClick={() => setActiveTab('DAILY')}
            className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 ${
              activeTab === 'DAILY' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            اهداف کلان امروز
          </button>
          <button
            onClick={() => setActiveTab('WEEKLY')}
            className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 ${
              activeTab === 'WEEKLY' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            اهداف اسپرینت هفتگی
          </button>
          <button
            onClick={() => setActiveTab('MONTHLY')}
            className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 ${
              activeTab === 'MONTHLY' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            تارگت‌های ماهانه و فصلی
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Add / Edit Form */}
          {isAddingGoal && (
            <form onSubmit={handleSave} className="p-4 rounded-2xl bg-slate-800/80 border border-emerald-500/40 space-y-3">
              <h4 className="text-xs font-bold text-emerald-300">
                {editingGoalId ? 'ویرایش تارگت' : 'ثبت تارگت جدید'}
              </h4>

              <div>
                <label className="text-xs text-slate-300 block mb-1">عنوان تارگت یا هدف:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: نهایی‌سازی ماژول پرداخت زوپیت، اتمام ۵ فصل کتاب..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">سطح هدف:</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as GoalLevel)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="PART">تارگت پارت زمانی</option>
                    <option value="DAILY">هدف روزانه</option>
                    <option value="WEEKLY">اسپرینت هفتگی</option>
                    <option value="MONTHLY">هدف ماهانه</option>
                  </select>
                </div>

                {level === 'PART' && (
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">پارت مربوطه:</label>
                    <select
                      value={part}
                      onChange={(e) => setPart(e.target.value as DayPart)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="MORNING">پارت ۱ (صبح)</option>
                      <option value="MIDDAY">پارت ۲ (ظهر)</option>
                      <option value="EVENING">پارت ۳ (عصر)</option>
                      <option value="NIGHT">پارت ۴ (شب)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-300 block mb-1">حوزه کاری:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {Object.entries(CATEGORY_DEFINITIONS).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="px-3 py-1 text-xs text-slate-400"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ثبت تارگت</span>
                </button>
              </div>
            </form>
          )}

          {/* Goals List */}
          <div className="space-y-2.5">
            {filteredGoals.length > 0 ? (
              filteredGoals.map((g) => {
                const catInfo = CATEGORY_DEFINITIONS[g.category] || CATEGORY_DEFINITIONS.personal;
                const partInfo = g.part ? DAY_PARTS[g.part] : null;

                return (
                  <div
                    key={g.id}
                    className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => {
                          if (!g.isCompleted) soundManager.playCompleteSound();
                          else soundManager.playClickSound();
                          onToggleGoal(g.id);
                        }}
                        className="text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                      >
                        {g.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className={`text-xs sm:text-sm font-bold truncate ${g.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                            {g.title}
                          </h5>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md border ${catInfo.bg} ${catInfo.text} ${catInfo.border}`}>
                            {catInfo.label}
                          </span>
                          {partInfo && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-700">
                              {partInfo.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        soundManager.playClickSound();
                        onDeleteGoal(g.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors shrink-0"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/20">
                <p className="text-xs text-slate-400">تارگتی در این سطح ثبت نشده است.</p>
                <button
                  onClick={handleOpenAdd}
                  className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  + افزودن اولین تارگت
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
