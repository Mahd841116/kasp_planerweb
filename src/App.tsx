import React, { useState, useEffect, useMemo } from 'react';
import { 
  DayNote, 
  DayPart, 
  Goal, 
  Habit,
  StartupProfile, 
  Task, 
  TaskCategory, 
  UniversityCourse 
} from './types';
import { 
  getTodayJalali, 
  getCurrentActivePart, 
  getPersianFullDate, 
  addDaysToJalali,
  toPersianDigits,
  getJalaliDayOfWeek,
  parseJalaliDate
} from './utils/jalali';
import { storage } from './utils/storage';
import { soundManager } from './utils/audio';
import { Header } from './components/Header';
import { MoodTracker } from './components/MoodTracker';
import { DailyBriefingCard } from './components/DailyBriefingCard';
import { FilterBar } from './components/FilterBar';
import { DayPartCard } from './components/DayPartCard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskFormModal } from './components/TaskFormModal';
import { DayPanoramaModal } from './components/DayPanoramaModal';
import { DeferredTasksModal } from './components/DeferredTasksModal';
import { MonthlyCalendarModal } from './components/MonthlyCalendarModal';
import { UniversityScheduleModal } from './components/UniversityScheduleModal';
import { StartupHubModal } from './components/StartupHubModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { GoalsModal } from './components/GoalsModal';
import { HabitTrackerModal } from './components/HabitTrackerModal';
import { EisenhowerMatrixModal } from './components/EisenhowerMatrixModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { SettingsModal } from './components/SettingsModal';
import { ProductivityInsights } from './components/ProductivityInsights';
import { 
  Plus, 
  Bell, 
  Sparkles, 
  Layers, 
  Calendar, 
  AlertTriangle,
  GraduationCap,
  Flame,
  Compass,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Primary State
  const [activeTab, setActiveTab] = useState<'daily' | 'insights'>('daily');
  const [currentDate, setCurrentDate] = useState<string>(() => getTodayJalali());
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks());
  const [goals, setGoals] = useState<Goal[]>(() => storage.getGoals());
  const [courses, setCourses] = useState<UniversityCourse[]>(() => storage.getCourses());
  const [startups, setStartups] = useState<Record<string, StartupProfile>>(() => storage.getStartups());
  const [dayNotes, setDayNotes] = useState<DayNote[]>(() => storage.getDayNotes());
  const [habits, setHabits] = useState<Habit[]>(() => storage.getHabits());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Realtime Day Part (updated every minute)
  const [currentRealtimePart, setCurrentRealtimePart] = useState<DayPart>(() => getCurrentActivePart());

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'ALL' | 'UNCOMPLETED' | 'HIGH_PRIORITY'>('ALL');

  // Modals Visibility
  const [isPanoramaOpen, setIsPanoramaOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isUniversityOpen, setIsUniversityOpen] = useState(false);
  const [isStartupsOpen, setIsStartupsOpen] = useState(false);
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isDeferredOpen, setIsDeferredOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isEisenhowerOpen, setIsEisenhowerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Task Form & Detail Modal State
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskFormInitialPart, setTaskFormInitialPart] = useState<DayPart>('MORNING');
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

  // Goal Form State
  const [goalFormInitialPart, setGoalFormInitialPart] = useState<DayPart | undefined>(undefined);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  // Focus Timer Target Part
  const [focusInitialPart, setFocusInitialPart] = useState<DayPart>('MORNING');

  // Active Live Alarm Notification Toast
  const [alarmToast, setAlarmToast] = useState<{ title: string; partTitle: string } | null>(null);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live part and alarm clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRealtimePart(getCurrentActivePart());

      // Check for alarms matching current hour:minute
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${hh}:${mm}`;

      const todayStr = getTodayJalali();
      if (currentDate === todayStr) {
        const matchingTask = tasks.find(
          (t) => t.jalaliDate === todayStr && t.hasAlarm && t.reminderTime === timeStr && !t.isCompleted
        );

        if (matchingTask) {
          soundManager.playAlarmSound();
          setAlarmToast({
            title: matchingTask.title,
            partTitle: matchingTask.part
          });
          setTimeout(() => setAlarmToast(null), 8000);
        }
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [tasks, currentDate]);

  // Sync state helpers
  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    storage.setTasks(newTasks);
  };

  const updateGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    storage.setGoals(newGoals);
  };

  const updateCourses = (newCourses: UniversityCourse[]) => {
    setCourses(newCourses);
    storage.setCourses(newCourses);
  };

  const updateStartups = (newStartups: Record<string, StartupProfile>) => {
    setStartups(newStartups);
    storage.setStartups(newStartups);
  };

  const updateDayNotes = (newNotes: DayNote[]) => {
    setDayNotes(newNotes);
    storage.setDayNotes(newNotes);
  };

  const updateHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    storage.setHabits(newHabits);
  };

  // Sound Toggle Handler
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.soundEnabled = next;
    if (next) soundManager.playClickSound();
  };

  // Reload all from storage
  const handleReloadAllData = () => {
    setTasks(storage.getTasks());
    setGoals(storage.getGoals());
    setCourses(storage.getCourses());
    setStartups(storage.getStartups());
    setDayNotes(storage.getDayNotes());
    setHabits(storage.getHabits());
  };

  // Filter tasks for the selected date
  const tasksForCurrentDate = useMemo(() => {
    return tasks.filter((t) => t.jalaliDate === currentDate);
  }, [tasks, currentDate]);

  // Backlog deferred tasks count
  const deferredTasksList = useMemo(() => {
    const today = getTodayJalali();
    return tasks.filter((t) => !t.isCompleted && (t.isDeferred || t.jalaliDate < today));
  }, [tasks]);

  // Filtered tasks by Category & Search
  const filteredTasks = useMemo(() => {
    return tasksForCurrentDate.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = task.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      // Category filter
      if (selectedCategory === 'ALL') return true;
      if (selectedCategory === 'UNCOMPLETED') return !task.isCompleted;
      if (selectedCategory === 'HIGH_PRIORITY') return task.priority === 'HIGH';
      return task.category === selectedCategory;
    });
  }, [tasksForCurrentDate, searchQuery, selectedCategory]);

  // Task Counts for FilterBar
  const taskCountsMap = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: tasksForCurrentDate.length,
      UNCOMPLETED: tasksForCurrentDate.filter(t => !t.isCompleted).length,
      HIGH_PRIORITY: tasksForCurrentDate.filter(t => t.priority === 'HIGH').length
    };
    tasksForCurrentDate.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [tasksForCurrentDate]);

  // Current Day Note
  const currentDayNote = useMemo(() => {
    return dayNotes.find((n) => n.jalaliDate === currentDate);
  }, [dayNotes, currentDate]);

  // Handle Save / Update Day Note
  const handleSaveDayNote = (note: DayNote) => {
    const existingIndex = dayNotes.findIndex((n) => n.jalaliDate === currentDate);
    let updated: DayNote[];
    if (existingIndex >= 0) {
      updated = [...dayNotes];
      updated[existingIndex] = note;
    } else {
      updated = [...dayNotes, note];
    }
    updateDayNotes(updated);
  };

  const handleUpdateDayNotePartial = (noteUpdate: Partial<DayNote>) => {
    const existingIndex = dayNotes.findIndex((n) => n.jalaliDate === currentDate);
    let updated: DayNote[];
    if (existingIndex >= 0) {
      updated = [...dayNotes];
      updated[existingIndex] = { ...updated[existingIndex], ...noteUpdate };
    } else {
      updated = [...dayNotes, { jalaliDate: currentDate, ...noteUpdate }];
    }
    updateDayNotes(updated);
  };

  // Task Actions
  const handleToggleTaskComplete = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const willBeCompleted = !target.isCompleted;
    if (willBeCompleted) {
      soundManager.playCompleteSound();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          isCompleted: willBeCompleted,
          completedAt: willBeCompleted ? new Date().toISOString() : undefined
        };
      }
      return t;
    });
    updateTasks(updated);
  };

  const handleUpdateTask = (task: Task) => {
    const updated = tasks.map((t) => (t.id === task.id ? task : t));
    updateTasks(updated);
  };

  const handleSaveTaskPartial = (partialTask: Partial<Task>) => {
    if (taskToEdit && taskToEdit.id) {
      const updated = tasks.map((t) => {
        if (t.id === taskToEdit.id) {
          return {
            ...t,
            ...partialTask
          } as Task;
        }
        return t;
      });
      updateTasks(updated);
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: partialTask.title || 'کار بدون عنوان',
        description: partialTask.description || '',
        jalaliDate: partialTask.jalaliDate || currentDate,
        part: partialTask.part || 'MORNING',
        startTime: partialTask.startTime || '08:00',
        endTime: partialTask.endTime || '10:00',
        category: partialTask.category || 'personal',
        priority: partialTask.priority || 'MEDIUM',
        isCompleted: false,
        isDeferred: false,
        hasAlarm: !!partialTask.hasAlarm,
        reminderTime: partialTask.reminderTime,
        createdAt: new Date().toISOString()
      };
      updateTasks([...tasks, newTask]);
    }
    soundManager.playCompleteSound();
    setIsTaskFormOpen(false);
    setTaskToEdit(null);
  };

  const handleQuickCreateTask = (title: string, part: DayPart) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      description: '',
      jalaliDate: currentDate,
      part,
      startTime: part === 'MORNING' ? '08:00' : part === 'MIDDAY' ? '13:00' : part === 'EVENING' ? '17:00' : '21:00',
      endTime: part === 'MORNING' ? '09:30' : part === 'MIDDAY' ? '14:30' : part === 'EVENING' ? '18:30' : '22:30',
      category: 'personal',
      priority: 'MEDIUM',
      isCompleted: false,
      isDeferred: false,
      hasAlarm: false,
      createdAt: new Date().toISOString()
    };
    updateTasks([...tasks, newTask]);
  };

  const handleDeleteTask = (taskId: string) => {
    soundManager.playClickSound();
    const updated = tasks.filter((t) => t.id !== taskId);
    updateTasks(updated);
    setIsTaskDetailOpen(false);
    setSelectedTaskDetail(null);
  };

  const handleRescheduleTask = (taskId: string, targetDate: string, note?: string) => {
    soundManager.playClickSound();
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          jalaliDate: targetDate,
          isDeferred: true,
          deferredNote: note || t.deferredNote
        };
      }
      return t;
    });
    updateTasks(updated);
  };

  // Open Task Modals
  const handleOpenAddTask = (part: DayPart) => {
    soundManager.playClickSound();
    setTaskFormInitialPart(part);
    setTaskToEdit(null);
    setIsTaskFormOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    soundManager.playClickSound();
    setTaskToEdit(task);
    setTaskFormInitialPart(task.part);
    setIsTaskDetailOpen(false);
    setIsTaskFormOpen(true);
  };

  const handleOpenTaskDetail = (task: Task) => {
    soundManager.playClickSound();
    setSelectedTaskDetail(task);
    setIsTaskDetailOpen(true);
  };

  // Goal Actions
  const handleToggleGoal = (goalId: string) => {
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          isCompleted: !g.isCompleted,
          progress: !g.isCompleted ? 100 : 0
        };
      }
      return g;
    });
    updateGoals(updated);
  };

  const handleSaveGoal = (goalData: Omit<Goal, 'id'>, goalId?: string) => {
    if (goalId) {
      const updated = goals.map((g) => (g.id === goalId ? { ...g, ...goalData } : g));
      updateGoals(updated);
    } else {
      const newGoal: Goal = {
        ...goalData,
        id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      };
      updateGoals([...goals, newGoal]);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    updateGoals(goals.filter((g) => g.id !== goalId));
  };

  // Habit Actions
  const handleToggleHabit = (habitId: string, date: string) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        const isDone = h.completedDates.includes(date);
        const newDates = isDone 
          ? h.completedDates.filter(d => d !== date)
          : [...h.completedDates, date];
        return {
          ...h,
          completedDates: newDates,
          streak: isDone ? Math.max(0, h.streak - 1) : h.streak + 1
        };
      }
      return h;
    });
    updateHabits(updated);
  };

  const handleAddHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      streak: 1,
      completedDates: [currentDate],
      createdAt: new Date().toISOString()
    };
    updateHabits([...habits, newHabit]);
  };

  const handleDeleteHabit = (habitId: string) => {
    soundManager.playClickSound();
    updateHabits(habits.filter(h => h.id !== habitId));
  };

  // Focus Timer trigger
  const handleOpenFocusTimerForPart = (part: DayPart) => {
    soundManager.playClickSound();
    setFocusInitialPart(part);
    setIsFocusTimerOpen(true);
  };

  // Deferred Actions
  const handleRescheduleDeferredToToday = (taskId: string) => {
    const today = getTodayJalali();
    handleRescheduleTask(taskId, today, 'منتقل‌شده به امروز');
  };

  const handleRescheduleDeferredToFriday = (taskId: string) => {
    const { year, month, day } = parseJalaliDate(currentDate);
    const dayOfWeek = getJalaliDayOfWeek(year, month, day);
    const daysUntilFriday = (6 - dayOfWeek + 7) % 7;
    const fridayDate = addDaysToJalali(currentDate, daysUntilFriday === 0 ? 7 : daysUntilFriday);
    handleRescheduleTask(taskId, fridayDate, 'منتقل‌شده به جمعه ریکاوری');
  };

  const handleBatchRescheduleToToday = () => {
    const today = getTodayJalali();
    const updated = tasks.map((t) => {
      if (!t.isCompleted && (t.isDeferred || t.jalaliDate < today)) {
        return {
          ...t,
          jalaliDate: today,
          isDeferred: true,
          deferredNote: 'انتقال گروهی به امروز'
        };
      }
      return t;
    });
    updateTasks(updated);
  };

  // Add Task directly for a specific startup
  const handleAddTaskForStartup = (startupCategory: TaskCategory) => {
    soundManager.playClickSound();
    setIsStartupsOpen(false);
    setTaskFormInitialPart('MORNING');
    setTaskToEdit({
      id: '',
      title: '',
      description: '',
      jalaliDate: currentDate,
      part: 'MORNING',
      startTime: '08:00',
      endTime: '10:00',
      category: startupCategory,
      priority: 'HIGH',
      isCompleted: false,
      isDeferred: false,
      hasAlarm: false,
      createdAt: ''
    });
    setIsTaskFormOpen(true);
  };

  // University Classes for Today
  const todayUniversityCourses = useMemo(() => {
    const { year, month, day } = parseJalaliDate(currentDate);
    const dayOfWeek = getJalaliDayOfWeek(year, month, day);
    return courses.filter((c) => c.dayOfWeek === dayOfWeek);
  }, [courses, currentDate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white pb-24">
      {/* Live Alarm Notification Toast */}
      {alarmToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-600 to-rose-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl shadow-rose-950/80 border border-white/20 flex items-center gap-3 animate-bounce">
          <Bell className="w-6 h-6 animate-spin" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-200">
              یادآور ساعت کار در کاسپ پلنر
            </div>
            <div className="text-sm font-black">{alarmToast.title}</div>
          </div>
          <button
            onClick={() => setAlarmToast(null)}
            className="mr-3 bg-white/20 hover:bg-white/30 rounded-xl px-2.5 py-1 text-xs font-bold cursor-pointer"
          >
            بستن
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenPanorama={() => setIsPanoramaOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenUniversity={() => setIsUniversityOpen(true)}
        onOpenStartups={() => setIsStartupsOpen(true)}
        onOpenGoals={() => setIsGoalsOpen(true)}
        onOpenDeferred={() => setIsDeferredOpen(true)}
        onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
        onOpenHabits={() => setIsHabitModalOpen(true)}
        onOpenEisenhower={() => setIsEisenhowerOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        deferredCount={deferredTasksList.length}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        totalTasksToday={tasksForCurrentDate.length}
        completedTasksToday={tasksForCurrentDate.filter((t) => t.isCompleted).length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full space-y-6">
        {activeTab === 'insights' ? (
          /* Productivity Insights Dashboard View */
          <ProductivityInsights
            tasks={tasks}
            onSelectTask={handleOpenTaskDetail}
          />
        ) : (
          /* Daily 4-Parts Planner View */
          <>
            {/* Daily Briefing & Motivation Bar */}
            <DailyBriefingCard
              currentDate={currentDate}
              dayNote={currentDayNote}
              onUpdateDayNote={handleUpdateDayNotePartial}
              habits={habits}
              onToggleHabit={handleToggleHabit}
              tasks={tasks}
              onOpenHabits={() => setIsHabitModalOpen(true)}
              onOpenEisenhower={() => setIsEisenhowerOpen(true)}
            />

            {/* University Class Banner for Today (if any) */}
            {todayUniversityCourses.length > 0 && (
              <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-purple-950/60 border border-purple-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-purple-200">
                      کلاس‌های امروز شما در دانشگاه ({toPersianDigits(todayUniversityCourses.length)} درس)
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {todayUniversityCourses.map((c) => (
                        <span
                          key={c.id}
                          className="text-[11px] bg-purple-900/60 border border-purple-500/30 px-2 py-0.5 rounded-md text-purple-300 font-semibold"
                        >
                          {c.courseName} ({c.timeSlot}) - {c.classroom}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsUniversityOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-bold border border-purple-500/40 transition-colors shrink-0"
                >
                  برنامه کامل
                </button>
              </div>
            )}

            {/* Mood & Energy Tracker */}
            <MoodTracker
              currentDate={currentDate}
              dayNote={currentDayNote}
              onSaveDayNote={handleSaveDayNote}
            />

            {/* Filter & Search Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              taskCounts={taskCountsMap}
              startups={startups}
            />

            {/* 4 Day Part Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {(['MORNING', 'MIDDAY', 'EVENING', 'NIGHT'] as DayPart[]).map((part) => (
                <DayPartCard
                  key={part}
                  partKey={part}
                  tasks={filteredTasks.filter((t) => t.part === part)}
                  partGoal={goals.find((g) => g.part === part && g.targetScope === currentDate)}
                  startups={startups}
                  isActiveCurrentPart={part === currentRealtimePart}
                  onAddTask={handleOpenAddTask}
                  onToggleTaskComplete={handleToggleTaskComplete}
                  onOpenTaskDetail={handleOpenTaskDetail}
                  onEditTask={handleOpenEditTask}
                  onDeleteTask={handleDeleteTask}
                  onRescheduleTask={(task) => handleRescheduleTask(task.id, addDaysToJalali(currentDate, 1))}
                  onToggleGoalComplete={handleToggleGoal}
                  onOpenGoalForm={(p, existingGoal) => {
                    setGoalFormInitialPart(p);
                    setGoalToEdit(existingGoal || null);
                    setIsGoalsOpen(true);
                  }}
                  onStartFocusInPart={handleOpenFocusTimerForPart}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Floating Action Button (FAB) for Quick Add */}
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="p-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-indigo-300 border border-slate-700 shadow-xl backdrop-blur-md cursor-pointer hover:scale-105 transition-all"
          title="جستجو و دستورات سریع (Ctrl + K)"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleOpenAddTask(currentRealtimePart)}
          className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-2xl shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all duration-200 ring-2 ring-white/20 cursor-pointer"
          title="افزودن کار جدید به پارت جاری"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>ثبت کار جدید</span>
        </button>
      </div>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTaskDetail}
        startups={startups}
        isOpen={isTaskDetailOpen}
        onClose={() => {
          setIsTaskDetailOpen(false);
          setSelectedTaskDetail(null);
        }}
        onToggleComplete={handleToggleTaskComplete}
        onEditTask={handleOpenEditTask}
        onDeleteTask={handleDeleteTask}
        onReschedule={(task, newDate, note) => handleRescheduleTask(task.id, newDate, note)}
      />

      <TaskFormModal
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setTaskToEdit(null);
        }}
        onSaveTask={handleSaveTaskPartial}
        initialDate={currentDate}
        initialPart={taskFormInitialPart}
        taskToEdit={taskToEdit}
      />

      <DayPanoramaModal
        isOpen={isPanoramaOpen}
        onClose={() => setIsPanoramaOpen(false)}
        currentDate={currentDate}
        tasks={tasksForCurrentDate}
        courses={courses}
        dayNote={currentDayNote}
        onOpenTaskDetail={handleOpenTaskDetail}
      />

      <DeferredTasksModal
        isOpen={isDeferredOpen}
        onClose={() => setIsDeferredOpen(false)}
        deferredTasks={deferredTasksList}
        onRescheduleToToday={handleRescheduleDeferredToToday}
        onRescheduleToFriday={handleRescheduleDeferredToFriday}
        onBatchRescheduleToToday={handleBatchRescheduleToToday}
        onDeleteTask={handleDeleteTask}
        onCompleteTask={handleToggleTaskComplete}
      />

      <MonthlyCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={currentDate}
        onSelectDate={setCurrentDate}
        tasks={tasks}
        courses={courses}
      />

      <UniversityScheduleModal
        isOpen={isUniversityOpen}
        onClose={() => setIsUniversityOpen(false)}
        courses={courses}
        onSaveCourse={(course) => {
          const exists = courses.some((c) => c.id === course.id);
          if (exists) {
            updateCourses(courses.map((c) => (c.id === course.id ? course : c)));
          } else {
            updateCourses([...courses, course]);
          }
        }}
        onDeleteCourse={(courseId) => {
          updateCourses(courses.filter((c) => c.id !== courseId));
        }}
      />

      <StartupHubModal
        isOpen={isStartupsOpen}
        onClose={() => setIsStartupsOpen(false)}
        startups={startups}
        tasks={tasks}
        onSaveStartup={(key, profile) => {
          updateStartups({
            ...startups,
            [key]: profile
          });
        }}
        onAddTaskForStartup={(key) => handleAddTaskForStartup(key as TaskCategory)}
        onOpenTaskDetail={handleOpenTaskDetail}
      />

      <FocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
        tasks={tasksForCurrentDate}
        initialPart={focusInitialPart}
        onCompleteTask={handleToggleTaskComplete}
      />

      <HabitTrackerModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        habits={habits}
        onToggleHabit={handleToggleHabit}
        onAddHabit={handleAddHabit}
        onDeleteHabit={handleDeleteHabit}
        currentDate={currentDate}
      />

      <EisenhowerMatrixModal
        isOpen={isEisenhowerOpen}
        onClose={() => setIsEisenhowerOpen(false)}
        tasks={tasks}
        onToggleTask={handleToggleTaskComplete}
        onUpdateTask={handleUpdateTask}
        onQuickAdd={handleOpenAddTask}
        currentDate={currentDate}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        courses={courses}
        habits={habits}
        onSelectTask={handleOpenTaskDetail}
        onQuickCreateTask={handleQuickCreateTask}
        onOpenPanorama={() => setIsPanoramaOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
        onOpenHabits={() => setIsHabitModalOpen(true)}
        onOpenEisenhower={() => setIsEisenhowerOpen(true)}
        currentDate={currentDate}
      />

      <GoalsModal
        isOpen={isGoalsOpen}
        onClose={() => {
          setIsGoalsOpen(false);
          setGoalToEdit(null);
        }}
        goals={goals}
        currentDate={currentDate}
        onSaveGoal={handleSaveGoal}
        onToggleGoal={handleToggleGoal}
        onDeleteGoal={handleDeleteGoal}
        initialPart={goalFormInitialPart}
        initialGoalToEdit={goalToEdit}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onDataReload={handleReloadAllData}
      />
    </div>
  );
}
