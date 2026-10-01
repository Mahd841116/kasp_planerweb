import React, { useRef, useState } from 'react';
import { 
  X, 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Check, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { storage } from '../utils/storage';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onDataReload: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  onDataReload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleExportJSON = () => {
    soundManager.playClickSound();
    const fullData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      tasks: storage.getTasks(),
      goals: storage.getGoals(),
      courses: storage.getCourses(),
      startups: storage.getStartups(),
      dayNotes: storage.getDayNotes(),
      habits: storage.getHabits()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `casp-planner-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setStatusMsg('فایل پشتیبان کاسپ پلنر با موفقیت ذخیره شد!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.tasks) storage.setTasks(json.tasks);
        if (json.goals) storage.setGoals(json.goals);
        if (json.courses) storage.setCourses(json.courses);
        if (json.startups) storage.setStartups(json.startups);
        if (json.dayNotes) storage.setDayNotes(json.dayNotes);
        if (json.habits) storage.setHabits(json.habits);

        soundManager.playCompleteSound();
        setStatusMsg('اطلاعات پشتیبان با موفقیت بازیابی شد!');
        onDataReload();
        setTimeout(() => setStatusMsg(''), 3000);
      } catch {
        setStatusMsg('خطا در خواندن فایل JSON. ساختار فایل نامعتبر است.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm('آیا مطمئن هستید؟ همه داده‌ها با اطلاعات نمونه و پیش‌فرض اولیه جایگزین خواهند شد.')) {
      soundManager.playClickSound();
      storage.resetToDemo();
      onDataReload();
      setStatusMsg('داده‌ها به حالت نمونه اولیه بازنشانی شدند.');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100">
                تنظیمات و پشتیبان‌گیری
              </h2>
              <p className="text-xs text-slate-400">
                مدیریت داده‌ها، خروجی JSON و تنظیمات صوتی
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {statusMsg && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-emerald-300 font-bold text-center animate-pulse">
              {statusMsg}
            </div>
          )}

          {/* Sound Preferences */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-900 text-indigo-400">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-bold text-slate-100 text-sm block">صداهای تعاملی و اعلان‌ها</span>
                <span className="text-slate-400 text-[11px]">پخش صدای تکمیل تسک، زنگ تایمر تمرکز و کلیک‌ها</span>
              </div>
            </div>

            <button
              onClick={onToggleSound}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                soundEnabled
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {soundEnabled ? 'فعال' : 'غیرفعال'}
            </button>
          </div>

          {/* Backup & Data Management */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 text-xs">مدیریت فایل و داده‌های محلی:</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Export */}
              <button
                onClick={handleExportJSON}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 flex items-center gap-3 text-right transition-colors group cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-100 block">پشتیبان‌گیری (JSON)</span>
                  <span className="text-[10px] text-slate-400">دانلود فایل پشتیبان کامل داده‌ها</span>
                </div>
              </button>

              {/* Import */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 flex items-center gap-3 text-right transition-colors group cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-100 block">بازیابی فایل (Restore)</span>
                  <span className="text-[10px] text-slate-400">انتخاب فایل JSON پشتیبان</span>
                </div>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportJSON}
                accept=".json"
                className="hidden"
              />
            </div>

            {/* Reset to Demo */}
            <button
              onClick={handleResetDemo}
              className="w-full p-3.5 rounded-2xl bg-slate-800/40 hover:bg-rose-950/30 border border-slate-700 hover:border-rose-500/30 flex items-center justify-between text-right transition-colors text-slate-300 hover:text-rose-300"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span className="font-bold">بازنشانی به داده‌های نمونه اولیه (Demo)</span>
              </div>
              <span className="text-[11px] text-slate-500">Reset All</span>
            </button>
          </div>

          {/* About Applet */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2 text-slate-400 text-[11px] leading-relaxed">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>درباره پارتبان (Partban)</span>
            </div>
            <p>
              سیستم مدیریت زمان بر اساس متدولوژی تقسیم روز به ۴ پارت زمانی مجزا برای دانشجویان، مهندسان و هم‌بنیان‌گذاران استارتاپ. داده‌ها به صورت امن در مرورگر شما نگهداری می‌شوند.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
