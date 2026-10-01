import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { StartupProfile, TaskCategory } from '../types';
import { CATEGORY_DEFINITIONS, getCategoryStyles } from '../utils/constants';
import { toPersianDigits } from '../utils/jalali';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: TaskCategory | 'ALL' | 'UNCOMPLETED' | 'HIGH_PRIORITY';
  onSelectCategory: (cat: TaskCategory | 'ALL' | 'UNCOMPLETED' | 'HIGH_PRIORITY') => void;
  taskCounts: Record<string, number>;
  startups?: Record<string, StartupProfile>;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  taskCounts,
  startups
}) => {
  return (
    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 p-3 mb-6 space-y-3">
      {/* Search Input Row */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="جستجوی سریع در عنوان و توضیحات تسک‌های امروز..."
          className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pr-9 pl-9 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-1 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>فیلتر:</span>
        </div>

        {/* All Chip */}
        <button
          onClick={() => onSelectCategory('ALL')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <span>همه کارها</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-md font-mono">
            {toPersianDigits(taskCounts['ALL'] || 0)}
          </span>
        </button>

        {/* Uncompleted Only */}
        <button
          onClick={() => onSelectCategory('UNCOMPLETED')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
            selectedCategory === 'UNCOMPLETED'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <span>در انتظار انجام</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-md font-mono">
            {toPersianDigits(taskCounts['UNCOMPLETED'] || 0)}
          </span>
        </button>

        {/* High Priority Only */}
        <button
          onClick={() => onSelectCategory('HIGH_PRIORITY')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
            selectedCategory === 'HIGH_PRIORITY'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <span>🔥 فوری و مهم</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded-md font-mono">
            {toPersianDigits(taskCounts['HIGH_PRIORITY'] || 0)}
          </span>
        </button>

        {/* Specific Categories */}
        {(Object.keys(CATEGORY_DEFINITIONS) as TaskCategory[]).map((key) => {
          const info = getCategoryStyles(key, startups);
          const count = taskCounts[key] || 0;
          const isSelected = selectedCategory === key;

          return (
            <button
              key={key}
              onClick={() => onSelectCategory(key)}
              style={
                isSelected && info.customStyle
                  ? {
                      backgroundColor: info.color,
                      color: '#ffffff'
                    }
                  : undefined
              }
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg shrink-0 font-medium transition-colors cursor-pointer ${
                isSelected
                  ? !info.customStyle ? 'bg-slate-100 text-slate-900 font-bold shadow-sm' : 'font-bold shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: info.color }}
              />
              <span>{info.label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${isSelected ? 'bg-black/30 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {toPersianDigits(count)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
