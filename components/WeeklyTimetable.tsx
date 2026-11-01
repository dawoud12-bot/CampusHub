'use client';

import React, { useState } from 'react';
import { useCampus } from '@/context/CampusContext';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { DayOfWeek, TimetableSlot } from '@/types';
import { getTodayDayName } from '@/lib/utils';
import confetti from 'canvas-confetti';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const WeeklyTimetable: React.FC = () => {
  const { timetable, addTimetableSlot, deleteTimetableSlot, attendance } = useCampus();

  const currentToday = getTodayDayName() as DayOfWeek;
  const initialDay = DAYS.includes(currentToday) ? currentToday : 'Monday';
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(initialDay);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Add Slot Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDay, setNewDay] = useState<DayOfWeek>(selectedDay);
  const [newSubject, setNewSubject] = useState(attendance[0]?.subjectCode || 'CS301');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [newRoom, setNewRoom] = useState('Room 304');
  const [newInstructor, setNewInstructor] = useState('Dr. Sarah Jenkins');
  const [newType, setNewType] = useState<TimetableSlot['type']>('Lecture');

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = attendance.find((a) => a.subjectCode === newSubject);

    addTimetableSlot({
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      subjectCode: newSubject,
      subjectName: matched ? matched.subjectName : newSubject,
      room: newRoom.trim() || 'Hall A',
      instructor: newInstructor.trim() || 'Professor',
      type: newType,
      color: '#3b82f6',
    });

    setIsAddModalOpen(false);
    confetti({ particleCount: 40, spread: 50 });
  };

  // Filter slots for selected day, sorted chronologically
  const daySlots = timetable
    .filter((slot) => slot.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getTypeBadgeClass = (type: TimetableSlot['type']) => {
    switch (type) {
      case 'Lecture':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Lab':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Tutorial':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Seminar':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f1424] to-[#12192e] border border-[#1e293b] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Interactive Academic Schedule
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Weekly Lecture Timetable</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Keep track of lecture theaters, practical computing labs, tutorial sessions, and visiting faculty hours.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class Slot</span>
          </button>
        </div>
      </div>

      {/* Day Selector Buttons & View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1a2333] pb-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {DAYS.map((day) => {
            const count = timetable.filter((s) => s.day === day).length;
            const isToday = day === currentToday;
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-[#0f1422] text-slate-400 hover:text-white border border-[#1e293b]'
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Today" />
                )}
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    isSelected ? 'bg-indigo-800 text-white' : 'bg-[#1a2333] text-indigo-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Showing:</span>
          <span className="font-semibold text-white px-2.5 py-1 rounded-lg bg-[#141b28] border border-[#1e293b]">
            {selectedDay} ({daySlots.length} sessions)
          </span>
        </div>
      </div>

      {/* Class Schedule Timeline / Cards */}
      <div className="space-y-3.5">
        {daySlots.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0f1422] border border-[#1e293b] space-y-3">
            <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No classes scheduled for {selectedDay}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Enjoy your free time or schedule a study session in the Focus Room!
            </p>
            <button
              onClick={() => {
                setNewDay(selectedDay);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add Class for {selectedDay}
            </button>
          </div>
        ) : (
          daySlots.map((slot, idx) => (
            <div
              key={slot.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#0f1422] border border-[#1e293b] hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Left: Timing badge & Subject Info */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0a0d15] border border-[#1a2333] text-center min-w-[100px] shrink-0">
                  <Clock className="w-4 h-4 text-indigo-400 mb-1" />
                  <span className="text-xs font-bold font-mono text-white tracking-wide">
                    {slot.startTime}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">to {slot.endTime}</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#161f30] text-indigo-400 border border-[#23324d]">
                      {slot.subjectCode}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getTypeBadgeClass(slot.type)}`}>
                      {slot.type}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-white mt-1 group-hover:text-indigo-300 transition-colors">
                    {slot.subjectName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {slot.room}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" /> {slot.instructor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-[#1a2333]">
                <button
                  onClick={() => deleteTimetableSlot(slot.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-[#1a2333] transition-colors"
                  title="Remove this slot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Class Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f1422] border border-[#1e293b] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2333] bg-[#0c101a]">
              <h3 className="text-base font-semibold text-white">Add Class to Timetable</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2333]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Day of Week</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-[#0a0d15]"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d} className="bg-[#0a0d15] text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Session Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as TimetableSlot['type'])}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-[#0a0d15]"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab Practical</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-[#0a0d15]"
                >
                  {attendance.map((s) => (
                    <option key={s.id} value={s.subjectCode} className="bg-[#0a0d15] text-white">
                      {s.subjectCode} - {s.subjectName}
                    </option>
                  ))}
                  <option value="PROJECT" className="bg-[#0a0d15] text-white">Project Work / Capstone</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Room / Lab No.</label>
                  <input
                    type="text"
                    placeholder="e.g. Hall B (LH-201)"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Instructor / Prof</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sarah Jenkins"
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#1a2333]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-[#1a2333]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" /> Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
