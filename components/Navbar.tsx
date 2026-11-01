'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Plus,
  Play,
  RotateCcw,
  Download,
  Upload,
  CalendarDays,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useCampus } from '@/context/CampusContext';
import { NavTab } from './Sidebar';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openNewTaskModal: () => void;
  openSettings: () => void;
  toggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openNewTaskModal,
  openSettings,
  toggleMobileSidebar,
}) => {
  const { userProfile, exportDataJson, resetAllData } = useCampus();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Command Center',
      subtitle: `Welcome back, ${userProfile.name}. Here is your academic overview.`,
    },
    attendance: {
      title: 'Attendance Intelligence',
      subtitle: 'Track your subject presence and simulate bunk/attend scenarios.',
    },
    cgpa: {
      title: 'CGPA & SGPA Calculator',
      subtitle: 'Monitor semester grades and project the exact SGPA needed for your target.',
    },
    tasks: {
      title: 'Academic Deadlines & Tasks',
      subtitle: 'Manage assignments, lab reports, and upcoming midterm deadlines.',
    },
    timetable: {
      title: 'Weekly Lecture Timetable',
      subtitle: 'Stay on top of classroom schedules, lab hours, and venues.',
    },
    timer: {
      title: 'Deep Work Focus Room',
      subtitle: 'Pomodoro timer with ambient acoustic generation and distraction blocking.',
    },
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0a0d14]/80 backdrop-blur-xl border-b border-[#1a2333] px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: Hamburger + Current Page Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#141b28] transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-white tracking-tight">
              {tabTitles[activeTab]?.title}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3 h-3" /> {userProfile.semester}
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden md:block">
            {tabTitles[activeTab]?.subtitle}
          </p>
        </div>
      </div>

      {/* Right section: Quick Actions & Live Indicator */}
      <div className="flex items-center gap-2.5">
        {/* Time Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f1420] border border-[#1e293b] text-xs text-slate-300 font-mono">
          <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
          <span>{currentTime || 'Loading...'}</span>
        </div>

        {/* Quick Launch Focus Timer */}
        {activeTab !== 'timer' && (
          <button
            onClick={() => setActiveTab('timer')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141b28] hover:bg-[#1b2438] text-slate-200 text-xs font-medium border border-[#1e293b] transition-all hover:border-purple-500/40"
          >
            <Play className="w-3 h-3 text-purple-400 fill-purple-400" />
            <span>Focus Mode</span>
          </button>
        )}

        {/* Add Task Quick Button */}
        <button
          onClick={openNewTaskModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">New Task</span>
        </button>

        {/* Backup / Export quick trigger */}
        <button
          onClick={exportDataJson}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#121824] hover:bg-[#182133] text-slate-300 text-xs font-medium border border-[#1e293b] flex items-center gap-1.5 transition-colors"
          title="Export Backup JSON"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden lg:inline">Backup</span>
        </button>
      </div>
    </header>
  );
};
