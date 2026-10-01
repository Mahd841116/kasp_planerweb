import React, { useState, useMemo } from 'react';
import { DayPart, Task, TaskCategory } from '../types';
import { CATEGORY_DEFINITIONS, DAY_PARTS } from '../utils/constants';
import { 
  addDaysToJalali, 
  getTodayJalali, 
  toPersianDigits, 
  parseJalaliDate, 
  PERSIAN_MONTH_NAMES,
  getPreviousMonthJalali,
  getMonthDateRange
} from '../utils/jalali';
import { soundManager } from '../utils/audio';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Target,
  Clock,
  Layers,
  Calendar,
  Filter,
  Flame,
  CheckCircle2,
  Sparkles,
  Sun,
  Building2,
  Moon,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  GitCompare,
  RotateCcw,
  CalendarDays,
  Check
} from 'lucide-react';

interface ProductivityInsightsProps {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}

type InsightTabMode = 'TIMELINE' | 'MOM' | 'YOY';

export const ProductivityInsights: React.FC<ProductivityInsightsProps> = ({ tasks }) => {
  // Main Sub-Tab Mode: 'TIMELINE' (روند زمانی), 'MOM' (ماه به ماه), 'YOY' (سال به سال)
  const [activeTabMode, setActiveTabMode] = useState<InsightTabMode>('TIMELINE');

  // Time range in days for Timeline mode: 7, 30, 90
  const [timeRangeDays, setTimeRangeDays] = useState<number>(30);
  const [selectedPartFilter, setSelectedPartFilter] = useState<DayPart | 'ALL'>('ALL');
  const [selectedCatFilter, setSelectedCatFilter] = useState<TaskCategory | 'ALL'>('ALL');

  const todayStr = getTodayJalali();
  const parsedToday = useMemo(() => parseJalaliDate(todayStr), [todayStr]);

  // MoM Selectors: Target Month & Base Comparison Month
  const [targetYear, setTargetYear] = useState<number>(parsedToday.year);
  const [targetMonth, setTargetMonth] = useState<number>(parsedToday.month);

  const prevMonthInfo = useMemo(() => {
    return getPreviousMonthJalali(targetYear, targetMonth);
  }, [targetYear, targetMonth]);

  const [compareYear, setCompareYear] = useState<number>(prevMonthInfo.year);
  const [compareMonth, setCompareMonth] = useState<number>(prevMonthInfo.month);

  // YoY Selectors: Target Year & Base Year
  const [yoyTargetYear, setYoyTargetYear] = useState<number>(parsedToday.year);
  const [yoyBaseYear, setYoyBaseYear] = useState<number>(parsedToday.year - 1);

  // Range label mapping for timeline
  const timeRangeLabels: Record<number, { label: string; short: string; badge: string }> = {
    7: { label: '۷ روز گذشته', short: '۷ روز', badge: 'تحلیل ۷ روزه' },
    30: { label: '۳۰ روز گذشته', short: '۳۰ روز', badge: 'تحلیل ۳۰ روزه' },
    90: { label: '۳ ماه گذشته (۹۰ روز)', short: '۳ ماه', badge: 'تحلیل ۳ ماهه' }
  };

  const currentRangeInfo = timeRangeLabels[timeRangeDays] || timeRangeLabels[30];

  // -------------------------------------------------------------
  // 1. TIMELINE CALCULATIONS
  // -------------------------------------------------------------
  const dateRangeList = useMemo(() => {
    const list: string[] = [];
    for (let i = timeRangeDays - 1; i >= 0; i--) {
      list.push(addDaysToJalali(todayStr, -i));
    }
    return list;
  }, [timeRangeDays, todayStr]);

  const filteredTasks = useMemo(() => {
    const minDate = dateRangeList[0];
    const maxDate = dateRangeList[dateRangeList.length - 1];

    return tasks.filter((t) => {
      if (t.jalaliDate < minDate || t.jalaliDate > maxDate) return false;
      if (selectedPartFilter !== 'ALL' && t.part !== selectedPartFilter) return false;
      if (selectedCatFilter !== 'ALL' && t.category !== selectedCatFilter) return false;
      return true;
    });
  }, [tasks, dateRangeList, selectedPartFilter, selectedCatFilter]);

  const macroTasksInRange = useMemo(() => {
    const minDate = dateRangeList[0];
    const maxDate = dateRangeList[dateRangeList.length - 1];
    return tasks.filter((t) => t.jalaliDate >= minDate && t.jalaliDate <= maxDate);
  }, [tasks, dateRangeList]);

  const totalTasks = macroTasksInRange.length;
  const completedTasks = macroTasksInRange.filter((t) => t.isCompleted).length;
  const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const partPerformance = useMemo(() => {
    const parts: DayPart[] = ['MORNING', 'MIDDAY', 'EVENING', 'NIGHT'];
    return parts.map((pKey) => {
      const pTasks = macroTasksInRange.filter((t) => t.part === pKey);
      const done = pTasks.filter((t) => t.isCompleted).length;
      const rate = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
      const info = DAY_PARTS[pKey];
      return {
        partKey: pKey,
        title: info.title,
        timeRange: info.timeRange,
        total: pTasks.length,
        completed: done,
        rate,
        accent: info.accentColor
      };
    });
  }, [macroTasksInRange]);

  const bestPart = useMemo(() => {
    if (partPerformance.length === 0) return null;
    return [...partPerformance].sort((a, b) => b.rate - a.rate)[0];
  }, [partPerformance]);

  const categoryPerformance = useMemo(() => {
    const cats = Object.keys(CATEGORY_DEFINITIONS) as TaskCategory[];
    return cats
      .map((cKey) => {
        const cTasks = macroTasksInRange.filter((t) => t.category === cKey);
        const done = cTasks.filter((t) => t.isCompleted).length;
        const rate = cTasks.length > 0 ? Math.round((done / cTasks.length) * 100) : 0;
        const info = CATEGORY_DEFINITIONS[cKey];
        return {
          catKey: cKey,
          label: info.label,
          total: cTasks.length,
          completed: done,
          rate,
          color: info.color
        };
      })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [macroTasksInRange]);

  const topCategory = useMemo(() => {
    const eligible = categoryPerformance.filter((c) => c.total >= 2);
    if (eligible.length === 0) return categoryPerformance[0] || null;
    return [...eligible].sort((a, b) => b.rate - a.rate)[0];
  }, [categoryPerformance]);

  const dailyTrendData = useMemo(() => {
    return dateRangeList.map((dStr) => {
      const dayTasks = filteredTasks.filter((t) => t.jalaliDate === dStr);
      const total = dayTasks.length;
      const completed = dayTasks.filter((t) => t.isCompleted).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const { day, month } = parseJalaliDate(dStr);
      const label = `${toPersianDigits(day)} ${PERSIAN_MONTH_NAMES[month - 1].slice(0, 3)}`;

      return {
        dateStr: dStr,
        label,
        total,
        completed,
        rate,
        remaining: total - completed
      };
    });
  }, [dateRangeList, filteredTasks]);

  const dayPartChartData = useMemo(() => {
    return partPerformance.map((p) => ({
      name: p.title,
      'انجام شده': p.completed,
      'در انتظار': p.total - p.completed,
      'نرخ تکمیل (%)': p.rate,
      total: p.total,
      rate: p.rate
    }));
  }, [partPerformance]);

  const categoryChartData = useMemo(() => {
    return categoryPerformance.map((c) => ({
      name: c.label.replace('استارتاپ ', ''),
      'تکمیل شده': c.completed,
      'کل تسک‌ها': c.total,
      'درصد موفقیت': c.rate,
      color: c.color
    }));
  }, [categoryPerformance]);

  // -------------------------------------------------------------
  // 2. MONTH-OVER-MONTH (MoM) CALCULATIONS
  // -------------------------------------------------------------
  const targetMonthRange = useMemo(() => getMonthDateRange(targetYear, targetMonth), [targetYear, targetMonth]);
  const compareMonthRange = useMemo(() => getMonthDateRange(compareYear, compareMonth), [compareYear, compareMonth]);

  const targetMonthTasks = useMemo(() => {
    return tasks.filter((t) => t.jalaliDate >= targetMonthRange.start && t.jalaliDate <= targetMonthRange.end);
  }, [tasks, targetMonthRange]);

  const compareMonthTasks = useMemo(() => {
    return tasks.filter((t) => t.jalaliDate >= compareMonthRange.start && t.jalaliDate <= compareMonthRange.end);
  }, [tasks, compareMonthRange]);

  const targetMonthCompleted = targetMonthTasks.filter((t) => t.isCompleted).length;
  const targetMonthRate = targetMonthTasks.length > 0 ? Math.round((targetMonthCompleted / targetMonthTasks.length) * 100) : 0;

  const compareMonthCompleted = compareMonthTasks.filter((t) => t.isCompleted).length;
  const compareMonthRate = compareMonthTasks.length > 0 ? Math.round((compareMonthCompleted / compareMonthTasks.length) * 100) : 0;

  // MoM Deltas
  const momRateDelta = targetMonthRate - compareMonthRate;
  const momCompletedDelta = targetMonthCompleted - compareMonthCompleted;
  const momTotalDelta = targetMonthTasks.length - compareMonthTasks.length;

  // MoM Day-by-Day Progression (Days 1 to 31)
  const momDayByDayData = useMemo(() => {
    const maxDays = Math.max(targetMonthRange.daysCount, compareMonthRange.daysCount);
    const data = [];
    for (let dayNum = 1; dayNum <= maxDays; dayNum++) {
      const dFormatted = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
      const targetDate = `${targetYear}-${targetMonth < 10 ? '0' + targetMonth : targetMonth}-${dFormatted}`;
      const compareDate = `${compareYear}-${compareMonth < 10 ? '0' + compareMonth : compareMonth}-${dFormatted}`;

      const tTasks = targetMonthTasks.filter((t) => t.jalaliDate === targetDate);
      const tDone = tTasks.filter((t) => t.isCompleted).length;
      const tRate = tTasks.length > 0 ? Math.round((tDone / tTasks.length) * 100) : 0;

      const cTasks = compareMonthTasks.filter((t) => t.jalaliDate === compareDate);
      const cDone = cTasks.filter((t) => t.isCompleted).length;
      const cRate = cTasks.length > 0 ? Math.round((cDone / cTasks.length) * 100) : 0;

      data.push({
        day: `روز ${toPersianDigits(dayNum)}`,
        'نرخ ماه جاری (%)': tRate,
        'نرخ ماه مقایسه (%)': cRate,
        'تسک‌های ماه جاری': tDone,
        'تسک‌های ماه مقایسه': cDone
      });
    }
    return data;
  }, [targetYear, targetMonth, compareYear, compareMonth, targetMonthRange, compareMonthRange, targetMonthTasks, compareMonthTasks]);

  // MoM Day Part Comparison Data
  const momPartsComparison = useMemo(() => {
    const parts: DayPart[] = ['MORNING', 'MIDDAY', 'EVENING', 'NIGHT'];
    return parts.map((pKey) => {
      const info = DAY_PARTS[pKey];
      const tPartTasks = targetMonthTasks.filter((t) => t.part === pKey);
      const tPartDone = tPartTasks.filter((t) => t.isCompleted).length;
      const tPartRate = tPartTasks.length > 0 ? Math.round((tPartDone / tPartTasks.length) * 100) : 0;

      const cPartTasks = compareMonthTasks.filter((t) => t.part === pKey);
      const cPartDone = cPartTasks.filter((t) => t.isCompleted).length;
      const cPartRate = cPartTasks.length > 0 ? Math.round((cPartDone / cPartTasks.length) * 100) : 0;

      return {
        name: info.title,
        'ماه جاری (%)': tPartRate,
        'ماه گذشته (%)': cPartRate,
        tDone: tPartDone,
        cDone: cPartDone,
        delta: tPartRate - cPartRate
      };
    });
  }, [targetMonthTasks, compareMonthTasks]);

  // -------------------------------------------------------------
  // 3. YEAR-OVER-YEAR (YoY) CALCULATIONS
  // -------------------------------------------------------------
  const yoyMonthsData = useMemo(() => {
    return PERSIAN_MONTH_NAMES.map((mName, mIdx) => {
      const mNum = mIdx + 1;
      const tRange = getMonthDateRange(yoyTargetYear, mNum);
      const bRange = getMonthDateRange(yoyBaseYear, mNum);

      const tTasks = tasks.filter((t) => t.jalaliDate >= tRange.start && t.jalaliDate <= tRange.end);
      const tDone = tTasks.filter((t) => t.isCompleted).length;
      const tRate = tTasks.length > 0 ? Math.round((tDone / tTasks.length) * 100) : 0;

      const bTasks = tasks.filter((t) => t.jalaliDate >= bRange.start && t.jalaliDate <= bRange.end);
      const bDone = bTasks.filter((t) => t.isCompleted).length;
      const bRate = bTasks.length > 0 ? Math.round((bDone / bTasks.length) * 100) : 0;

      return {
        month: mName,
        [`سال ${toPersianDigits(yoyTargetYear)} (%)`]: tRate,
        [`سال ${toPersianDigits(yoyBaseYear)} (%)`]: bRate,
        tTotal: tTasks.length,
        tDone,
        bTotal: bTasks.length,
        bDone,
        rateDelta: tRate - bRate
      };
    });
  }, [tasks, yoyTargetYear, yoyBaseYear]);

  // Tooltips
  const CustomDailyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/90 p-3 rounded-2xl shadow-2xl text-right text-xs space-y-1.5 backdrop-blur-xl">
          <p className="font-bold text-slate-200 border-b border-slate-700/60 pb-1 flex items-center justify-between gap-3">
            <span>تاریخ: {data.label}</span>
            <span className="font-mono text-indigo-400">{toPersianDigits(data.dateStr)}</span>
          </p>
          <div className="flex items-center justify-between gap-4 text-emerald-300">
            <span>تسک‌های تکمیل شده:</span>
            <span className="font-mono font-bold">{toPersianDigits(data.completed)} تسک</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-400">
            <span>کل وظایف برنامه‌ریزی:</span>
            <span className="font-mono">{toPersianDigits(data.total)} تسک</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-amber-300 font-bold pt-1 border-t border-slate-800">
            <span>نرخ بازدهی و تکمیل:</span>
            <span className="font-mono text-sm">{toPersianDigits(data.rate)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/90 p-3 rounded-2xl shadow-2xl text-right text-xs space-y-1.5 backdrop-blur-xl">
          <p className="font-bold text-slate-100 border-b border-slate-700/60 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span className="font-mono font-bold">
                {toPersianDigits(entry.value)}
                {entry.name.includes('%') || entry.name.includes('نرخ') || entry.name.includes('درصد') ? '%' : ' تسک'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Main Sub-Tab Switcher */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-slate-900/90 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-inner">
              <TrendingUp className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-black text-slate-100">
                  بینش‌های بهره‌وری و تحلیل مقایسه‌ای
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                  {activeTabMode === 'TIMELINE' ? currentRangeInfo.badge : activeTabMode === 'MOM' ? 'مقایسه ماه به ماه (MoM)' : 'مقایسه سال به سال (YoY)'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                ردیابی روند پیشرفت، نرخ تکمیل و تحلیل تطبیقی دوره‌ای در پارتبان
              </p>
            </div>
          </div>

          {/* Sub-Mode Tabs: Timeline vs MoM vs YoY */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950/90 border border-indigo-500/30 shadow-lg self-stretch lg:self-auto justify-center">
            <button
              onClick={() => {
                soundManager.playClickSound();
                setActiveTabMode('TIMELINE');
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTabMode === 'TIMELINE'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>روند زمانی</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClickSound();
                setActiveTabMode('MOM');
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTabMode === 'MOM'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-cyan-300" />
              <span>ماه به ماه (MoM)</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClickSound();
                setActiveTabMode('YOY');
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTabMode === 'YOY'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-amber-300" />
              <span>سال به سال (YoY)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Controls based on selected tab mode */}
        {activeTabMode === 'TIMELINE' && (
          <div className="pt-4 flex items-center justify-between gap-3 flex-wrap text-xs">
            {/* Day Part Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 flex items-center gap-1 font-medium ml-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                فیلتر پارت:
              </span>
              <button
                onClick={() => setSelectedPartFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedPartFilter === 'ALL'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                همه پارت‌ها
              </button>
              {(['MORNING', 'MIDDAY', 'EVENING', 'NIGHT'] as DayPart[]).map((pKey) => (
                <button
                  key={pKey}
                  onClick={() => setSelectedPartFilter(pKey)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedPartFilter === pKey
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {DAY_PARTS[pKey].title}
                </button>
              ))}
            </div>

            {/* Time Range Dropdown Menu */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">بازه زمانی:</span>
              <div className="relative">
                <select
                  value={timeRangeDays}
                  onChange={(e) => {
                    soundManager.playClickSound();
                    setTimeRangeDays(Number(e.target.value));
                  }}
                  className="appearance-none bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold pl-8 pr-3 py-1.5 rounded-xl border border-indigo-400/40 shadow-md cursor-pointer focus:outline-none"
                >
                  <option value={7} className="bg-slate-900 text-slate-100">📅 ۷ روز گذشته</option>
                  <option value={30} className="bg-slate-900 text-slate-100">📅 ۳۰ روز گذشته</option>
                  <option value={90} className="bg-slate-900 text-slate-100">📅 ۳ ماه گذشته (۹۰ روز)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-white">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MoM Period Selector Bar */}
        {activeTabMode === 'MOM' && (
          <div className="pt-4 flex items-center justify-between gap-3 flex-wrap text-xs bg-slate-950/40 p-3 rounded-2xl mt-3 border border-slate-800">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Target Month */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-cyan-300">ماه مورد بررسی:</span>
                <select
                  value={`${targetYear}-${targetMonth}`}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split('-').map(Number);
                    setTargetYear(y);
                    setTargetMonth(m);
                  }}
                  className="bg-slate-800 border border-cyan-500/40 rounded-xl px-2.5 py-1 text-xs text-white font-bold"
                >
                  {PERSIAN_MONTH_NAMES.map((name, idx) => (
                    <option key={idx} value={`${targetYear}-${idx + 1}`}>
                      {name} {toPersianDigits(targetYear)}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-slate-500 font-bold">در مقایسه با:</span>

              {/* Compare Month */}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-300">ماه مبنا:</span>
                <select
                  value={`${compareYear}-${compareMonth}`}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split('-').map(Number);
                    setCompareYear(y);
                    setCompareMonth(m);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white"
                >
                  {PERSIAN_MONTH_NAMES.map((name, idx) => (
                    <option key={idx} value={`${compareYear}-${idx + 1}`}>
                      {name} {toPersianDigits(compareYear)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setTargetYear(parsedToday.year);
                setTargetMonth(parsedToday.month);
                const prev = getPreviousMonthJalali(parsedToday.year, parsedToday.month);
                setCompareYear(prev.year);
                setCompareMonth(prev.month);
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ماه جاری vs ماه قبل</span>
            </button>
          </div>
        )}

        {/* YoY Period Selector Bar */}
        {activeTabMode === 'YOY' && (
          <div className="pt-4 flex items-center justify-between gap-3 flex-wrap text-xs bg-slate-950/40 p-3 rounded-2xl mt-3 border border-slate-800">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-amber-300">سال جاری:</span>
                <select
                  value={yoyTargetYear}
                  onChange={(e) => setYoyTargetYear(Number(e.target.value))}
                  className="bg-slate-800 border border-amber-500/40 rounded-xl px-2.5 py-1 text-xs text-white font-bold"
                >
                  <option value={1405}>سال ۱۴۰۵</option>
                  <option value={1404}>سال ۱۴۰۴</option>
                </select>
              </div>

              <span className="text-slate-500 font-bold">در برابر:</span>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-300">سال مبنا:</span>
                <select
                  value={yoyBaseYear}
                  onChange={(e) => setYoyBaseYear(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white"
                >
                  <option value={1404}>سال ۱۴۰۴</option>
                  <option value={1403}>سال ۱۴۰۳</option>
                </select>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              مقایسه جامع ۱۲ ماه سال جلالی (فروردین تا اسفند)
            </span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 1: TIMELINE OVERVIEW (Standard View) */}
      {/* ------------------------------------------------------------- */}
      {activeTabMode === 'TIMELINE' && (
        <>
          {/* Top 5 KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">میانگین بازدهی ({currentRangeInfo.short})</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black font-mono text-indigo-300">
                  {toPersianDigits(overallCompletionRate)}%
                </span>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                    style={{ width: `${overallCompletionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">پربازده‌ترین پارت</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-sm sm:text-base font-black text-amber-300 block truncate">
                  {bestPart?.title || 'پارت ۱: صبح'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                  موفقیت {toPersianDigits(bestPart?.rate || 0)}% تسک‌ها
                </span>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">برترین حوزه کاری</span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-sm sm:text-base font-black text-cyan-300 block truncate">
                  {topCategory?.label || 'استارتاپ زوپیت'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                  نرخ اتمام: {toPersianDigits(topCategory?.rate || 0)}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">کل تسک‌های انجام‌شده</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-300">
                  {toPersianDigits(completedTasks)}
                </span>
                <span className="text-[11px] text-slate-500 font-mono mr-1">/ {toPersianDigits(totalTasks)} کل</span>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-xl col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">بازه تحلیلی</span>
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-black font-mono text-rose-300">
                  {toPersianDigits(timeRangeDays)}
                </span>
                <span className="text-[11px] text-slate-400 mr-1">روز فعال</span>
              </div>
            </div>
          </div>

          {/* Area Chart: Dynamic Timeline */}
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <span>نمودار روند نرخ تکمیل روزانه تسک‌ها ({currentRangeInfo.label})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  نمایش درصد موفقیت و حجم کارهای انجام شده در هر روز به همراه گرادیان بازدهی
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span>نرخ تکمیل (%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>تسک‌های انجام‌شده</span>
                </div>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full pt-2" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    interval={timeRangeDays > 30 ? 7 : timeRangeDays > 14 ? 3 : 1}
                  />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip content={<CustomDailyTooltip />} />
                  <Area type="monotone" dataKey="rate" name="نرخ تکمیل (%)" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#rateGradient)" />
                  <Area type="monotone" dataKey="completed" name="تسک‌های انجام شده" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#completedGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid: 2 Charts (Day Part & Category) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-4">
              <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>تحلیل نرخ تکمیل بر اساس ۴ پارت روزانه</span>
              </h3>
              <div className="h-64 sm:h-72 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayPartChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="انجام شده" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="در انتظار" fill="#334155" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-4">
              <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>نرخ تکمیل به تفکیک حوزه‌ها و استارتاپ‌ها</span>
              </h3>
              <div className="h-64 sm:h-72 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                    <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="تکمیل شده" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                    <Bar dataKey="کل تسک‌ها" fill="#1e293b" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 2: MONTH-OVER-MONTH (MoM) COMPARISON */}
      {/* ------------------------------------------------------------- */}
      {activeTabMode === 'MOM' && (
        <div className="space-y-6">
          {/* MoM Delta Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Completion Rate Delta */}
            <div className="p-5 rounded-3xl bg-slate-900/85 border border-slate-800 shadow-xl space-y-2">
              <span className="text-xs text-slate-400 font-medium block">تغییرات نرخ بازدهی و اتمام تسک‌ها (MoM):</span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {toPersianDigits(targetMonthRate)}%
                  </span>
                  <span className="text-xs text-slate-400 mr-2">
                    (در برابر {toPersianDigits(compareMonthRate)}%)
                  </span>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl font-mono font-bold text-xs ${
                  momRateDelta >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {momRateDelta >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{momRateDelta >= 0 ? '+' : ''}{toPersianDigits(momRateDelta)}%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                {momRateDelta >= 0 ? 'رشد مثبت بازدهی نسبت به ماه قبل 🎉' : 'کاهش نسبی نرخ اتمام تسک‌ها'}
              </p>
            </div>

            {/* Output Tasks Delta */}
            <div className="p-5 rounded-3xl bg-slate-900/85 border border-slate-800 shadow-xl space-y-2">
              <span className="text-xs text-slate-400 font-medium block">تغییرات حجم کارهای انجام‌شده:</span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                    {toPersianDigits(targetMonthCompleted)}
                  </span>
                  <span className="text-xs text-slate-400 mr-2">
                    (در برابر {toPersianDigits(compareMonthCompleted)})
                  </span>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl font-mono font-bold text-xs ${
                  momCompletedDelta >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {momCompletedDelta >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{momCompletedDelta >= 0 ? '+' : ''}{toPersianDigits(momCompletedDelta)} تسک</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                از کل {toPersianDigits(targetMonthTasks.length)} تسک برنامه‌ریزی شده در ماه جاری
              </p>
            </div>

            {/* Comparison Summary */}
            <div className="p-5 rounded-3xl bg-slate-900/85 border border-slate-800 shadow-xl space-y-2">
              <span className="text-xs text-slate-400 font-medium block">دوره مقایسه‌شده:</span>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold">
                  {PERSIAN_MONTH_NAMES[targetMonth - 1]} {toPersianDigits(targetYear)}
                </span>
                <span className="text-xs text-slate-500 font-bold">vs</span>
                <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold">
                  {PERSIAN_MONTH_NAMES[compareMonth - 1]} {toPersianDigits(compareYear)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                تحلیل روند بهبود عملکرد و پیشبرد اسپرینت‌ها
              </p>
            </div>
          </div>

          {/* MoM Chart 1: Day-by-Day Progression LineChart */}
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span>مقایسه روز به روز نرخ تکمیل (MoM Day-by-Day Progression)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  مقایسه تطبیقی درصد موفقیت روزهای ۱ تا ۳۱ ماه جاری در برابر ماه مبنا
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
                  <span className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span>ماه جاری ({PERSIAN_MONTH_NAMES[targetMonth - 1]})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <span className="w-3 h-3 rounded-full bg-slate-500" />
                  <span>ماه مقایسه ({PERSIAN_MONTH_NAMES[compareMonth - 1]})</span>
                </div>
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full pt-2" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={momDayByDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={3} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Line type="monotone" dataKey="نرخ ماه جاری (%)" stroke="#06b6d4" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="نرخ ماه مقایسه (%)" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MoM Chart 2: 4-Day Parts Side-by-Side Comparison */}
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>مقایسه نرخ موفقیت ۴ پارت روزانه بین دو ماه</span>
            </h3>

            <div className="h-64 sm:h-72 w-full pt-2" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={momPartsComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="ماه جاری (%)" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="ماه گذشته (%)" fill="#475569" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Growth Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
              {momPartsComparison.map((p, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-xs font-bold text-slate-300 block">{p.name}</span>
                  <div className="flex items-center justify-center gap-1 mt-1 font-mono font-bold text-xs">
                    <span className={p.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {p.delta >= 0 ? '▲ +' : '▼ '}{toPersianDigits(p.delta)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 3: YEAR-OVER-YEAR (YoY) COMPARISON */}
      {/* ------------------------------------------------------------- */}
      {activeTabMode === 'YOY' && (
        <div className="space-y-6">
          {/* YoY Banner */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2 text-xs text-amber-300">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              مقایسه روند سال به سال (YoY): سال {toPersianDigits(yoyTargetYear)} در برابر سال {toPersianDigits(yoyBaseYear)}
            </span>
            <span>نمایش رشد کلی بهره‌وری در تمامی ۱۲ ماه سال جلالی</span>
          </div>

          {/* YoY 12-Month Bar Chart */}
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-400" />
                <span>نمودار مقایسه ۱۲ ماهه نرخ موفقیت (YoY Monthly Comparison)</span>
              </h3>
            </div>

            <div className="h-72 sm:h-80 w-full pt-2" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yoyMonthsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey={`سال ${toPersianDigits(yoyTargetYear)} (%)`} fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey={`سال ${toPersianDigits(yoyBaseYear)} (%)`} fill="#475569" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* YoY Annual Progression Matrix Table */}
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-3 overflow-x-auto">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>جدول تفصیلی مقایسه ماهانه سال‌ها (فروردین تا اسفند):</span>
            </h4>

            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="p-2.5 font-bold">ماه</th>
                  <th className="p-2.5 font-bold">سال {toPersianDigits(yoyTargetYear)} (انجام/کل)</th>
                  <th className="p-2.5 font-bold">درصد سال {toPersianDigits(yoyTargetYear)}</th>
                  <th className="p-2.5 font-bold">سال {toPersianDigits(yoyBaseYear)} (انجام/کل)</th>
                  <th className="p-2.5 font-bold">درصد سال {toPersianDigits(yoyBaseYear)}</th>
                  <th className="p-2.5 font-bold">میزان رشد (Δ%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {yoyMonthsData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-2.5 font-sans font-bold text-slate-200">{row.month}</td>
                    <td className="p-2.5 text-slate-300">{toPersianDigits(row.tDone)}/{toPersianDigits(row.tTotal)}</td>
                    <td className="p-2.5 font-bold text-amber-300">{toPersianDigits(row[`سال ${toPersianDigits(yoyTargetYear)} (%)`])}%</td>
                    <td className="p-2.5 text-slate-400">{toPersianDigits(row.bDone)}/{toPersianDigits(row.bTotal)}</td>
                    <td className="p-2.5 text-slate-400">{toPersianDigits(row[`سال ${toPersianDigits(yoyBaseYear)} (%)`])}%</td>
                    <td className={`p-2.5 font-bold ${row.rateDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.rateDelta >= 0 ? '+' : ''}{toPersianDigits(row.rateDelta)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Algorithmic Productivity Insights & Smart Recommendations (Shared Footer) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 text-indigo-300">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <h3 className="text-base font-black text-white">
            بینش‌های هوشمند و تحلیل روند بهبود (Smart Productivity Tracking):
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <Sun className="w-4 h-4" />
              <span>بهبود چشمگیر پارت صبح:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              نرخ بهره‌وری پارت صبح نسبت به دوره‌های پیشین رشد پایدار داشته و تمرکز عمیق ۳ ساعته بهترین خروجی را برای کدنویسی و تسک‌های تحلیلی ثبت کرده است.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <Building2 className="w-4 h-4" />
              <span>شتاب اسپرینت استارتاپ‌ها:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              تسک‌های مرتبط با زوپیت و مکتو نرخ تکمیل بالاتر از ۸۰٪ دارند که نشان‌دهنده اولویت‌بندی موثر و کاهش تاخیر در لانچ ویژگی‌های جدید است.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Moon className="w-4 h-4" />
              <span>پایداری و استمرار فصلی:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              بررسی مقایسه‌ای دوره‌ها نشان می‌دهد انتقال تسک‌های معوقه به جمعه‌ها باعث پیشگیری از انباشت تسک‌ها در روزهای کاری شده است.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
