import React, { useState, useEffect, useRef } from 'react';
import { DayPart, Task } from '../types';
import { DAY_PARTS } from '../utils/constants';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2,
  CloudRain,
  Headphones,
  Coffee,
  Waves,
  Music2
} from 'lucide-react';
import { toPersianDigits } from '../utils/jalali';
import { soundManager, AmbientSoundType } from '../utils/audio';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  initialPart?: DayPart;
  onCompleteTask?: (taskId: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  tasks,
  initialPart = 'MORNING',
  onCompleteTask
}) => {
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [ambientType, setAmbientType] = useState<AmbientSoundType>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.3);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      const candidate = tasks.find((t) => t.part === initialPart && !t.isCompleted);
      if (candidate) {
        setSelectedTaskId(candidate.id);
      } else if (tasks.length > 0) {
        setSelectedTaskId(tasks[0].id);
      }
    } else {
      soundManager.stopAmbient();
      setAmbientType('none');
    }
  }, [isOpen, initialPart, tasks]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            soundManager.playTimerFinishedSound();
            soundManager.stopAmbient();
            setAmbientType('none');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  if (!isOpen) return null;

  const handleStartPause = () => {
    soundManager.playClickSound();
    if (!isRunning && ambientType !== 'none') {
      soundManager.startAmbient(ambientType);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = (minutes = durationMinutes) => {
    soundManager.playClickSound();
    setIsRunning(false);
    setDurationMinutes(minutes);
    setSecondsRemaining(minutes * 60);
  };

  const handleSelectPreset = (minutes: number) => {
    handleReset(minutes);
  };

  const handleToggleAmbient = (type: AmbientSoundType) => {
    soundManager.playClickSound();
    if (ambientType === type) {
      soundManager.stopAmbient();
      setAmbientType('none');
    } else {
      setAmbientType(type);
      if (isRunning) {
        soundManager.startAmbient(type);
      } else {
        soundManager.startAmbient(type);
      }
    }
  };

  const handleVolumeChange = (v: number) => {
    setAmbientVolume(v);
    soundManager.setAmbientVolume(v);
  };

  const handleMarkSelectedDone = () => {
    if (selectedTaskId && onCompleteTask) {
      soundManager.playCompleteSound();
      onCompleteTask(selectedTaskId);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(0, Math.min(100, ((durationMinutes * 60 - secondsRemaining) / (durationMinutes * 60)) * 100));
  const currentTask = tasks.find((t) => t.id === selectedTaskId);
  const partInfo = DAY_PARTS[initialPart];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-lg animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl shadow-indigo-950/80 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">تایمر تمرکز عمیق کاسپ پلنر</h2>
              <span className="text-[11px] text-slate-400">
                پارت انتخابی: {partInfo?.title || 'صبح'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.stopAmbient();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center justify-center space-y-6">
          
          {/* Preset Buttons */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap w-full">
            {[
              { min: 25, label: 'پومودورو (۲۵ د)' },
              { min: 50, label: 'تمرکز عمیق (۵۰ د)' },
              { min: 90, label: 'اسپرینت (۹۰ د)' },
              { min: 5, label: 'استراحت کوتاه (۵ د)' },
              { min: 15, label: 'استراحت بلند (۱۵ د)' }
            ].map((p) => (
              <button
                key={p.min}
                onClick={() => handleSelectPreset(p.min)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  durationMinutes === p.min
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-105'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Glowing Circular Timer Display */}
          <div className="relative w-60 h-60 flex items-center justify-center">
            {/* SVG Ring Progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="120"
                cy="120"
                r="105"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="120"
                cy="120"
                r="105"
                stroke="currentColor"
                strokeWidth="10"
                className="text-amber-500 transition-all duration-1000 ease-linear drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 105}
                strokeDashoffset={2 * Math.PI * 105 * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-wider drop-shadow-md">
                {toPersianDigits(formatTime(secondsRemaining))}
              </span>
              <span className="text-xs font-semibold text-amber-400 mt-2 flex items-center gap-1">
                {isRunning ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    در حال تمرکز عمیق...
                  </>
                ) : (
                  'آماده شروع'
                )}
              </span>
            </div>
          </div>

          {/* Active Task Selector */}
          <div className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">تسک هدف برای این بازه:</span>
              {currentTask && (
                <button
                  onClick={handleMarkSelectedDone}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تیک زدن انجام کار</span>
                </button>
              )}
            </div>

            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
            >
              <option value="">بدون انتخاب تسک (تمرکز آزاد)</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.isCompleted ? '✓ ' : ''}[{DAY_PARTS[t.part].title}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Ambient Sound Selector */}
          <div className="w-full bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5 text-indigo-300">
                <Music2 className="w-3.5 h-3.5" />
                <span>صدای پس‌زمینه تمرکز (امبینت)</span>
              </div>
              <span className="text-[10px] text-slate-500">پخش زنده صوتی</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { type: 'rain' as AmbientSoundType, label: 'باران', icon: CloudRain },
                { type: 'alpha432' as AmbientSoundType, label: 'امواج ۴۳۲Hz', icon: Waves },
                { type: 'cafe' as AmbientSoundType, label: 'کافه', icon: Coffee },
                { type: 'whitenoise' as AmbientSoundType, label: 'نویز سفید', icon: Headphones }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleToggleAmbient(item.type)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    ambientType === item.type
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 mb-1" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {ambientType !== 'none' && (
              <div className="flex items-center gap-3 pt-1">
                <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
                <button
                  onClick={() => handleToggleAmbient(ambientType)}
                  className="text-[10px] text-rose-400 hover:underline shrink-0"
                >
                  قطع صدا
                </button>
              </div>
            )}
          </div>

          {/* Controls: Play, Pause, Reset */}
          <div className="flex items-center justify-center gap-4 w-full pt-1">
            <button
              onClick={() => handleReset()}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="ریست تایمر"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={handleStartPause}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-base shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                isRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400/40'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/30 ring-2 ring-amber-300/50'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>توقف موقت</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>شروع تمرکز</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
