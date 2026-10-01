export type DayPart = 'MORNING' | 'MIDDAY' | 'EVENING' | 'NIGHT';

export type TaskCategory = 
  | 'university' 
  | 'startup_1' 
  | 'startup_2' 
  | 'startup_3' 
  | 'startup_4' 
  | 'job' 
  | 'home' 
  | 'personal';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type GoalLevel = 'PART' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type MoodType = 'energetic' | 'focused' | 'productive' | 'calm' | 'tired';

export type EisenhowerQuadrant = 'DO_FIRST' | 'SCHEDULE' | 'DELEGATE' | 'ELIMINATE';

export interface Task {
  id: string;
  title: string;
  description: string;
  jalaliDate: string; // "1405-07-08"
  part: DayPart;
  startTime: string; // "08:00"
  endTime: string; // "10:00"
  category: TaskCategory;
  priority: Priority;
  isCompleted: boolean;
  isDeferred: boolean;
  deferredNote?: string;
  hasAlarm: boolean;
  reminderTime?: string;
  eisenhower?: EisenhowerQuadrant;
  createdAt: string;
  completedAt?: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  targetPart?: DayPart;
  icon: string;
  color: string;
  streak: number;
  completedDates: string[]; // List of Jalali dates e.g. ["1405-07-07", "1405-07-08"]
  targetDaysPerWeek: number;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  level: GoalLevel;
  targetScope: string; // "1405-07-08" or "1405-07" or "1405"
  part?: DayPart;
  category: TaskCategory;
  isCompleted: boolean;
  progress?: number;
}

export interface UniversityCourse {
  id: string;
  courseName: string;
  instructor: string;
  classroom: string;
  dayOfWeek: number; // 0: شنبه, 1: یکشنبه, ..., 6: جمعه
  timeSlot: string; // "10:00 - 12:00"
  color: string;
  notes?: string;
}

export interface StartupProfile {
  id: TaskCategory;
  name: string;
  englishName: string;
  tagline: string;
  stage: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  keyMetrics?: string;
}

export interface DayNote {
  jalaliDate: string;
  mood?: MoodType;
  reflection?: string;
  focusScore?: number; // 1-5
  waterGlasses?: number; // 0-8 daily water tracker
}

export interface PartInfo {
  id: DayPart;
  title: string;
  subtitle: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  iconName: string;
  focusArea: string;
  accentColor: string;
  badgeBg: string;
  cardBg: string;
}
