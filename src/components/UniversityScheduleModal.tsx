import React, { useState } from 'react';
import { UniversityCourse } from '../types';
import { PERSIAN_WEEKDAY_NAMES, toPersianDigits } from '../utils/jalali';
import { 
  X, 
  GraduationCap, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  Trash2, 
  Edit, 
  Check 
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface UniversityScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: UniversityCourse[];
  onSaveCourse: (course: UniversityCourse) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const UniversityScheduleModal: React.FC<UniversityScheduleModalProps> = ({
  isOpen,
  onClose,
  courses,
  onSaveCourse,
  onDeleteCourse
}) => {
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Form State
  const [courseName, setCourseName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [classroom, setClassroom] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [timeSlot, setTimeSlot] = useState('۰۸:۰۰ الی ۱۰:۰۰');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    soundManager.playClickSound();
    setCourseName('');
    setInstructor('');
    setClassroom('');
    setDayOfWeek(0);
    setTimeSlot('۰۸:۰۰ الی ۱۰:۰۰');
    setNotes('');
    setEditingCourseId(null);
    setIsAddingCourse(true);
  };

  const handleOpenEdit = (course: UniversityCourse) => {
    soundManager.playClickSound();
    setCourseName(course.courseName);
    setInstructor(course.instructor);
    setClassroom(course.classroom);
    setDayOfWeek(course.dayOfWeek);
    setTimeSlot(course.timeSlot);
    setNotes(course.notes || '');
    setEditingCourseId(course.id);
    setIsAddingCourse(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    soundManager.playClickSound();
    onSaveCourse({
      id: editingCourseId || `course-${Date.now()}`,
      courseName: courseName.trim(),
      instructor: instructor.trim(),
      classroom: classroom.trim(),
      dayOfWeek,
      timeSlot,
      color: '#8b5cf6',
      notes: notes.trim()
    });

    setIsAddingCourse(false);
    setEditingCourseId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <GraduationCap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100">
                  برنامه هفتگی کلاس‌های دانشگاه
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold font-mono">
                  {toPersianDigits(courses.length)} درس
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                جدول هفتگی، زمان‌بندی تالارها و اساتید در ترم جاری
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAddingCourse && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن درس</span>
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add / Edit Form */}
          {isAddingCourse && (
            <form onSubmit={handleSave} className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-4">
              <h3 className="text-sm font-bold text-purple-200">
                {editingCourseId ? 'ویرایش اطلاعات درس' : 'ثبت درس دانشگاهی جدید'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">نام درس:</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="مثال: هوش مصنوعی، طراحی الگوریتم..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">نام استاد:</label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="مثال: دکتر رضایی"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">روز برگزاری در هفته:</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {PERSIAN_WEEKDAY_NAMES.map((wName, idx) => (
                      <option key={idx} value={idx}>
                        {wName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">بازه زمانی کلاس:</label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="۱۰:۰۰ الی ۱۲:۰۰"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">محل برگزاری / لینک تالار مجازی:</label>
                  <input
                    type="text"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    placeholder="کلاس ۲۰۴ دانشکده کامپیوتر"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">یادداشت / پروژه درس:</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="تحویل پروژه میان‌ترم..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-500/20">
                <button
                  type="button"
                  onClick={() => setIsAddingCourse(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ذخیره درس</span>
                </button>
              </div>
            </form>
          )}

          {/* Weekly Days Grid */}
          <div className="space-y-4">
            {PERSIAN_WEEKDAY_NAMES.map((dayName, dayIdx) => {
              const dayCourses = courses.filter((c) => c.dayOfWeek === dayIdx);
              const isFriday = dayIdx === 6;

              return (
                <div
                  key={dayIdx}
                  className={`p-4 rounded-2xl border ${
                    isFriday
                      ? 'bg-emerald-950/10 border-emerald-900/30'
                      : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                        {dayName} {isFriday ? '(ریکاوری)' : ''}
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {toPersianDigits(dayCourses.length)} درس
                    </span>
                  </div>

                  {dayCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {dayCourses.map((course) => (
                        <div
                          key={course.id}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-start justify-between gap-2"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-white truncate">
                                {course.courseName}
                              </h5>
                              <span className="text-[10px] text-purple-300 font-mono bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-500/20">
                                {course.timeSlot}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                              {course.instructor && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-500" />
                                  {course.instructor}
                                </span>
                              )}
                              {course.classroom && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  {course.classroom}
                                </span>
                              )}
                            </div>

                            {course.notes && (
                              <p className="text-[10px] text-amber-300 italic pt-0.5">
                                • {course.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenEdit(course)}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                              title="ویرایش"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                soundManager.playClickSound();
                                onDeleteCourse(course.id);
                              }}
                              className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic py-1">
                      کلاسی در این روز ثبت نشده است.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
