import React, { useState } from 'react';
import { DayNote, MoodType } from '../types';
import { MOOD_CONFIG } from '../utils/constants';
import { soundManager } from '../utils/audio';
import { Edit3, Check, Star } from 'lucide-react';
import { toPersianDigits } from '../utils/jalali';

interface MoodTrackerProps {
  currentDate: string;
  dayNote?: DayNote;
  onSaveDayNote: (note: DayNote) => void;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  currentDate,
  dayNote,
  onSaveDayNote
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [reflectionText, setReflectionText] = useState(dayNote?.reflection || '');
  const [focusScore, setFocusScore] = useState<number>(dayNote?.focusScore || 4);

  const currentMood = dayNote?.mood;

  const handleSelectMood = (mood: MoodType) => {
    soundManager.playClickSound();
    onSaveDayNote({
      jalaliDate: currentDate,
      mood,
      reflection: dayNote?.reflection || '',
      focusScore: dayNote?.focusScore || 4
    });
  };

  const handleSaveReflection = () => {
    soundManager.playClickSound();
    onSaveDayNote({
      jalaliDate: currentDate,
      mood: dayNote?.mood || 'focused',
      reflection: reflectionText,
      focusScore: focusScore
    });
    setIsEditingNote(false);
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/60 p-3 sm:p-4 shadow-xl mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Mood Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <span className="text-xs font-bold text-slate-300 ml-1">
            حس و انرژی روز:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(Object.entries(MOOD_CONFIG) as [MoodType, { label: string; icon: string; color: string }][]).map(([key, config]) => {
              const isSelected = currentMood === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectMood(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? `bg-gradient-to-r ${config.color} text-white shadow-md shadow-indigo-500/20 scale-105 ring-2 ring-white/30`
                      : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/40'
                  }`}
                >
                  <span className="text-sm">{config.icon}</span>
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Focus Score & Reflection Expander */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-700/50">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400">سطح تمرکز:</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    soundManager.playClickSound();
                    setFocusScore(s);
                    onSaveDayNote({
                      jalaliDate: currentDate,
                      mood: dayNote?.mood || 'focused',
                      reflection: dayNote?.reflection || '',
                      focusScore: s
                    });
                  }}
                  className="p-0.5 hover:scale-125 transition-transform"
                  title={`سطح ${toPersianDigits(s)} از ۵`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      s <= (dayNote?.focusScore || focusScore)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setReflectionText(dayNote?.reflection || '');
              setIsEditingNote(!isEditingNote);
            }}
            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-950/50 hover:bg-indigo-900/50 px-2.5 py-1 rounded-lg border border-indigo-500/30 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{dayNote?.reflection ? 'یادداشت روزانه' : '+ یادداشت روز'}</span>
          </button>
        </div>
      </div>

      {/* Reflection Note input area (when open or exists) */}
      {isEditingNote ? (
        <div className="mt-3 pt-3 border-t border-slate-700/60">
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="یادداشت یا بازتاب روزانه... (دستاوردهای مهم، چالش‌ها، یا برنامه برای فردا)"
            rows={2}
            className="w-full text-xs sm:text-sm bg-slate-900/80 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={() => setIsEditingNote(false)}
              className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
            >
              انصراف
            </button>
            <button
              onClick={handleSaveReflection}
              className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>ذخیره یادداشت</span>
            </button>
          </div>
        </div>
      ) : dayNote?.reflection ? (
        <div className="mt-2.5 pt-2.5 border-t border-slate-700/40 text-xs text-slate-300 bg-slate-900/40 rounded-xl p-2.5 flex items-start justify-between">
          <p className="italic leading-relaxed font-light">«{dayNote.reflection}»</p>
        </div>
      ) : null}
    </div>
  );
};
