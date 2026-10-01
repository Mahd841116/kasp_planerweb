import React, { useState } from 'react';
import { StartupProfile, Task } from '../types';
import { STARTUP_COLOR_PRESETS } from '../utils/constants';
import { 
  X, 
  Rocket, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Check, 
  Palette,
  Sparkles
} from 'lucide-react';
import { toPersianDigits } from '../utils/jalali';
import { soundManager } from '../utils/audio';

interface StartupHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  startups: Record<string, StartupProfile>;
  tasks: Task[];
  onSaveStartup: (key: string, profile: StartupProfile) => void;
  onAddTaskForStartup: (startupKey: string) => void;
  onOpenTaskDetail: (task: Task) => void;
}

export const StartupHubModal: React.FC<StartupHubModalProps> = ({
  isOpen,
  onClose,
  startups,
  tasks,
  onSaveStartup,
  onAddTaskForStartup,
  onOpenTaskDetail
}) => {
  const [selectedStartupKey, setSelectedStartupKey] = useState<string>('startup_1');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit form state
  const currentStartup = startups[selectedStartupKey] || startups['startup_1'];
  const [name, setName] = useState(currentStartup?.name || '');
  const [tagline, setTagline] = useState(currentStartup?.tagline || '');
  const [stage, setStage] = useState(currentStartup?.stage || '');
  const [description, setDescription] = useState(currentStartup?.description || '');
  const [keyMetrics, setKeyMetrics] = useState(currentStartup?.keyMetrics || '');
  const [customColor, setCustomColor] = useState(currentStartup?.color || '#6366f1');

  if (!isOpen) return null;

  const startupTasks = tasks.filter((t) => t.category === selectedStartupKey);
  const completedCount = startupTasks.filter((t) => t.isCompleted).length;
  const progressPercent = startupTasks.length > 0 ? Math.round((completedCount / startupTasks.length) * 100) : 0;

  const handleSelectStartup = (key: string) => {
    soundManager.playClickSound();
    setSelectedStartupKey(key);
    const s = startups[key];
    if (s) {
      setName(s.name);
      setTagline(s.tagline);
      setStage(s.stage);
      setDescription(s.description);
      setKeyMetrics(s.keyMetrics || '');
      setCustomColor(s.color || '#6366f1');
    }
    setIsEditingProfile(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playCompleteSound();
    onSaveStartup(selectedStartupKey, {
      ...currentStartup,
      name,
      tagline,
      stage,
      description,
      keyMetrics,
      color: customColor,
      bgColor: 'bg-slate-900/80',
      borderColor: 'border-slate-700'
    });
    setIsEditingProfile(false);
  };

  const handleColorChange = (hex: string) => {
    setCustomColor(hex);
    // Instant live preview and auto save
    onSaveStartup(selectedStartupKey, {
      ...currentStartup,
      color: hex
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Rocket className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-100">
                  هاب استارتاپ‌ها و رنگ‌های سازمانی (Startup Hub)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                  کاسپ پلنر
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                شخصی‌سازی نام، رنگ اختصاصی سازمانی و مدیریت اسپرینت‌های ۴ استارتاپ پیش‌فرض
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

        {/* Startup Selector Tabs */}
        <div className="p-3 sm:px-6 bg-slate-800/60 border-b border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(startups).map(([key, s]) => {
            const isSelected = selectedStartupKey === key;
            const count = tasks.filter((t) => t.category === key).length;
            const sColor = s.color || '#6366f1';

            return (
              <button
                key={key}
                onClick={() => handleSelectStartup(key)}
                style={{
                  borderColor: isSelected ? sColor : 'rgba(51, 65, 85, 0.6)',
                  backgroundColor: isSelected ? `${sColor}18` : 'rgba(15, 23, 42, 0.6)'
                }}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected ? 'shadow-lg ring-2 ring-indigo-500/30' : 'hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: sColor }}
                    />
                    <span className="text-xs font-black text-white">{s.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {s.englishName}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400">{s.stage}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded-md font-mono"
                    style={{ backgroundColor: `${sColor}25`, color: sColor }}
                  >
                    {toPersianDigits(count)} تسک
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Startup Card Banner */}
          <div 
            className="p-4 sm:p-5 rounded-3xl border relative space-y-4 shadow-xl"
            style={{
              borderColor: `${currentStartup.color || '#6366f1'}40`,
              backgroundColor: `${currentStartup.color || '#6366f1'}12`
            }}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-4 h-4 rounded-full shadow-md animate-pulse" 
                      style={{ backgroundColor: currentStartup.color || '#6366f1' }}
                    />
                    <h3 className="text-xl font-black text-white">{currentStartup.name}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-xs text-slate-200 font-mono">
                    {currentStartup.englishName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                    {currentStartup.stage}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                  {currentStartup.tagline}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ویرایش مشخصات و رنگ</span>
                </button>
                <button
                  onClick={() => {
                    soundManager.playClickSound();
                    onAddTaskForStartup(selectedStartupKey);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>تسک جدید برای {currentStartup.name}</span>
                </button>
              </div>
            </div>

            {/* Live Startup Custom Color Picker Bar */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <span>انتخاب رنگ اختصاصی این استارتاپ (اعمال در تسک‌های ۴ پارت روزانه):</span>
                </span>
                <span 
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border"
                  style={{ 
                    color: currentStartup.color || '#6366f1',
                    borderColor: `${currentStartup.color || '#6366f1'}50`,
                    backgroundColor: `${currentStartup.color || '#6366f1'}15`
                  }}
                >
                  {currentStartup.color || '#6366f1'}
                </span>
              </div>

              {/* 12 Color Presets */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {STARTUP_COLOR_PRESETS.map((preset) => {
                  const isSelected = (currentStartup.color || '#6366f1').toLowerCase() === preset.color.toLowerCase();
                  return (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => handleColorChange(preset.color)}
                      className={`w-7 h-7 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                        isSelected ? 'scale-125 ring-2 ring-white shadow-lg' : 'hover:scale-110 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  );
                })}

                {/* Custom Color Input */}
                <div className="flex items-center gap-1 mr-2 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400">سفارشی:</span>
                  <input
                    type="color"
                    value={currentStartup.color || '#6366f1'}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Description & Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-100 block mb-1">شرح ماموریت و استراتژی:</span>
                {currentStartup.description}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-slate-100 flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    شاخص‌های کلیدی عملکرد (KPIs):
                  </span>
                  <p className="text-emerald-300 font-medium">{currentStartup.keyMetrics || 'در حال اعتبارسنجی'}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                  <span>پیشرفت وظایف:</span>
                  <span className="font-mono font-bold text-white">
                    {toPersianDigits(completedCount)} از {toPersianDigits(startupTasks.length)} ({toPersianDigits(progressPercent)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form if open */}
          {isEditingProfile && (
            <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-indigo-300">ویرایش اطلاعات استارتاپ:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">نام استارتاپ:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">شعار یا برچسب:</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">مرحله رشد:</label>
                  <input
                    type="text"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">شرح ماموریت:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">شاخص‌های کلیدی:</label>
                <input
                  type="text"
                  value={keyMetrics}
                  onChange={(e) => setKeyMetrics(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1 text-xs text-slate-400 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ذخیره تغییرات</span>
                </button>
              </div>
            </form>
          )}

          {/* Tasks Pipeline for this startup */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center justify-between">
              <span>لیست وظایف و اسپرینت‌های استارتاپ {currentStartup.name}:</span>
              <span className="text-[11px] font-mono text-slate-400">
                {toPersianDigits(startupTasks.length)} تسک
              </span>
            </h4>

            {startupTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {startupTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onClose();
                      onOpenTaskDetail(t);
                    }}
                    style={{
                      borderLeft: `4px solid ${currentStartup.color || '#6366f1'}`
                    }}
                    className="p-3.5 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 flex items-start justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: t.isCompleted ? '#10b981' : (currentStartup.color || '#6366f1') }} 
                        />
                        <h5 className={`text-xs font-bold truncate ${t.isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                          {t.title}
                        </h5>
                      </div>
                      {t.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {t.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                        <span className="font-mono">{toPersianDigits(t.jalaliDate)}</span>
                        <span>•</span>
                        <span className="font-mono">{toPersianDigits(t.startTime)}</span>
                      </div>
                    </div>

                    <span 
                      className="text-[10px] px-2 py-0.5 rounded-md font-mono shrink-0"
                      style={{ 
                        backgroundColor: t.isCompleted ? '#10b98120' : `${currentStartup.color || '#6366f1'}20`,
                        color: t.isCompleted ? '#10b981' : (currentStartup.color || '#6366f1')
                      }}
                    >
                      {t.isCompleted ? 'تکمیل شده' : 'در حال انجام'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30">
                <p className="text-xs text-slate-400">هیچ تسکی برای این استارتاپ ثبت نشده است.</p>
                <button
                  onClick={() => {
                    soundManager.playClickSound();
                    onAddTaskForStartup(selectedStartupKey);
                    onClose();
                  }}
                  className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                >
                  + افزودن اولین تسک
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
