'use client';

import React, { useState, useEffect } from 'react';
import { useCampus } from '@/context/CampusContext';
import {
  GraduationCap,
  Percent,
  CheckSquare,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Flame,
  Play,
  Pause,
  CheckCircle2,
  Sparkles,
  BookOpen,
  MapPin,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { getAttendanceStats, formatTime, getTodayDayName } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { soundFx } from '@/lib/soundEffects';

interface DashboardOverviewProps {
  setActiveTab: (tab: NavTab) => void;
  openNewTaskModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  setActiveTab,
  openNewTaskModal,
}) => {
  const {
    userProfile,
    attendance,
    cumulativeCgpa,
    tasks,
    timetable,
    markAttendance,
    toggleTaskStatus,
    todayStudyMinutes,
    studyStreakDays,
  } = useCampus();

  // Mini Pomodoro State for quick focus directly on dashboard
  const [miniTimerSeconds, setMiniTimerSeconds] = useState(25 * 60);
  const [miniTimerActive, setMiniTimerActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (miniTimerActive && miniTimerSeconds > 0) {
      interval = setInterval(() => {
        setMiniTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (miniTimerSeconds === 0 && miniTimerActive) {
      setMiniTimerActive(false);
      soundFx.playChime();
      confetti({ particleCount: 70, spread: 60 });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [miniTimerActive, miniTimerSeconds]);

  // Overall attendance calculations
  const totalAttended = attendance.reduce((s, a) => s + a.attended, 0);
  const totalClasses = attendance.reduce((s, a) => s + a.total, 0);
  const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 100;
  const overallStats = getAttendanceStats(totalAttended, totalClasses, 75);

  // Critical subjects with attendance below 75%
  const lowAttendanceSubjects = attendance.filter((a) => {
    const p = a.total > 0 ? (a.attended / a.total) * 100 : 100;
    return p < a.targetPercentage;
  });

  // Pending tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const urgentTasks = pendingTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');

  // Today's schedule
  const todayDay = getTodayDayName();
  const todayClasses = timetable.filter((slot) => slot.day === todayDay || slot.day === 'Monday');
  const nextClass = todayClasses[0] || timetable[0];

  const handleCompleteTask = (id: string) => {
    toggleTaskStatus(id);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 },
    });
    soundFx.playTick();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* SaaS Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-[#0f1424] to-[#12182b] border border-indigo-500/20 p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Academic Dashboard
              </span>
              <span className="text-xs text-slate-400">• {userProfile.university}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">{userProfile.name}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              You are currently maintaining an aggregate <strong className="text-white">{overallPercentage}%</strong> attendance rate and a <strong className="text-white">{cumulativeCgpa.toFixed(2)}</strong> CGPA. Keep up the high momentum!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('attendance')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151c2e] hover:bg-[#1a233a] text-slate-200 text-xs font-medium border border-[#24304c] transition-all hover:border-indigo-500/40"
            >
              <Percent className="w-4 h-4 text-emerald-400" />
              <span>Simulate Attendance</span>
            </button>
            <button
              onClick={() => setActiveTab('timer')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Enter Focus Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 SaaS Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Attendance */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="group relative p-5 rounded-2xl bg-[#0f1422] border border-[#1e293b] hover:border-indigo-500/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500/5 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Overall Attendance</span>
            <div className={`p-2 rounded-xl ${overallStats.isShortage ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'} border border-current/20`}>
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{overallPercentage}%</span>
            <span className="text-xs text-slate-400">({totalAttended}/{totalClasses})</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            {overallStats.isShortage ? (
              <span className="text-rose-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Shortage in {lowAttendanceSubjects.length} subject(s)
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                ✓ Above 75% Target safe
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="w-full bg-[#1b2333] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallStats.isShortage ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: CGPA */}
        <div
          onClick={() => setActiveTab('cgpa')}
          className="group relative p-5 rounded-2xl bg-[#0f1422] border border-[#1e293b] hover:border-indigo-500/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500/5 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Cumulative CGPA</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{cumulativeCgpa.toFixed(2)}</span>
            <span className="text-xs text-slate-400">/ 10.00 scale</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-indigo-300 font-medium">Goal: {userProfile.targetCgpa.toFixed(2)} CGPA</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="w-full bg-[#1b2333] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (cumulativeCgpa / 10) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Assignments */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="group relative p-5 rounded-2xl bg-[#0f1422] border border-[#1e293b] hover:border-amber-500/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-amber-500/5 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Active Assignments</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{pendingTasks.length}</span>
            <span className="text-xs text-amber-400 font-medium">({urgentTasks.length} urgent)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {urgentTasks.length > 0 ? `Next due in 48 hours` : `All deadlines on schedule`}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="w-full bg-[#1b2333] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  tasks.length > 0
                    ? Math.round(((tasks.length - pendingTasks.length) / tasks.length) * 100)
                    : 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Metric 4: Focus Room */}
        <div
          onClick={() => setActiveTab('timer')}
          className="group relative p-5 rounded-2xl bg-[#0f1422] border border-[#1e293b] hover:border-purple-500/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-purple-500/5 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Today's Study Focus</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{todayStudyMinutes}m</span>
            <span className="text-xs text-purple-400 flex items-center gap-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> {studyStreakDays}d streak
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Goal: 120m daily focus</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="w-full bg-[#1b2333] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (todayStudyMinutes / 120) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Tasks & Timetable) + Right 1 Col (Quick Attendance & Mini Timer) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Urgent Deadlines + Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Urgent Deadlines */}
          <div className="p-6 rounded-2xl bg-[#0f1422] border border-[#1e293b]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">Priority Deadlines</h3>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#1e293b] text-slate-300">
                  {pendingTasks.length} pending
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openNewTaskModal}
                  className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#0a0d15] border border-[#1a2333] hover:border-[#2d3a54] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="w-5 h-5 rounded-md border border-slate-600 hover:border-emerald-400 flex items-center justify-center transition-colors group-hover:scale-105"
                      title="Mark as done"
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="text-indigo-400 font-medium">{task.subjectCode}</span>
                        <span>•</span>
                        <span>Due {task.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border ${
                        task.priority === 'urgent'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : task.priority === 'high'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Today's Class Schedule */}
          <div className="p-6 rounded-2xl bg-[#0f1422] border border-[#1e293b]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">Schedule for {todayDay}</h3>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#1e293b] text-slate-300">
                  {todayClasses.length} sessions
                </span>
              </div>
              <button
                onClick={() => setActiveTab('timetable')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium"
              >
                Full Week <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {todayClasses.map((slot, idx) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-xl bg-[#0a0d15] border border-[#1a2333] hover:border-indigo-500/30 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-medium text-indigo-400">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-1 line-clamp-1">
                        {slot.subjectName}
                      </h4>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#161f30] text-slate-300 border border-[#23324d]">
                      {slot.type}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#161f30] flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" /> {slot.room}
                    </span>
                    <span className="text-slate-500 truncate max-w-[120px]">{slot.instructor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Quick Attendance Check-in + Mini Focus Timer */}
        <div className="space-y-6">
          {/* Quick Attendance Check-in */}
          <div className="p-6 rounded-2xl bg-[#0f1422] border border-[#1e293b]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Daily Check-In</h3>
              </div>
              <button
                onClick={() => setActiveTab('attendance')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Details
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Tap +Present or +Absent as your classes conclude today:
            </p>

            <div className="space-y-3">
              {attendance.slice(0, 4).map((sub) => {
                const stats = getAttendanceStats(sub.attended, sub.total, sub.targetPercentage);
                return (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl bg-[#0a0d15] border border-[#1a2333] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{sub.subjectName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {sub.attended}/{sub.total} ({stats.percentage}%)
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          stats.isShortage
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {stats.isShortage ? 'Low' : 'Safe'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => markAttendance(sub.id, 'present')}
                        className="flex-1 py-1 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-all"
                      >
                        + Present
                      </button>
                      <button
                        onClick={() => markAttendance(sub.id, 'absent')}
                        className="flex-1 py-1 px-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all"
                      >
                        + Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mini Quick Focus Widget */}
          <div className="p-6 rounded-2xl bg-[#0f1422] border border-[#1e293b]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-semibold text-white">Quick Sprint</h3>
              </div>
              <button
                onClick={() => setActiveTab('timer')}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium"
              >
                Open Room
              </button>
            </div>

            <div className="text-center py-4 bg-[#0a0d15] rounded-xl border border-[#1a2333]">
              <div className="text-3xl font-mono font-bold text-white tracking-wider">
                {formatTime(miniTimerSeconds)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Pomodoro 25-minute sprint</p>

              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => setMiniTimerActive(!miniTimerActive)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all active:scale-95"
                >
                  {miniTimerActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" /> Start
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setMiniTimerActive(false);
                    setMiniTimerSeconds(25 * 60);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#1a2333] hover:bg-[#253248] text-slate-300 text-xs font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
