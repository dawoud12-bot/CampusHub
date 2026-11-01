'use client';

import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  GraduationCap,
  Calendar,
  Clock,
  Settings,
  Sparkles,
  TrendingUp,
  Percent,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { useCampus } from '@/context/CampusContext';
import { getAttendanceStats } from '@/lib/utils';

export type NavTab = 'dashboard' | 'attendance' | 'cgpa' | 'tasks' | 'timetable' | 'timer';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openSettings: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openSettings,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { userProfile, attendance, cumulativeCgpa, tasks, todayStudyMinutes, studyStreakDays } = useCampus();

  // Calculate overall attendance aggregate
  const totalAttended = attendance.reduce((s, a) => s + a.attended, 0);
  const totalClasses = attendance.reduce((s, a) => s + a.total, 0);
  const overallAtt = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 1000) / 10 : 100;
  const attStats = getAttendanceStats(totalAttended, totalClasses, 75);

  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'attendance' as NavTab,
      label: 'Attendance Calc',
      icon: Percent,
      badge: attStats.isShortage ? 'Low' : `${overallAtt}%`,
      badgeColor: attStats.isShortage ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'cgpa' as NavTab,
      label: 'CGPA Predictor',
      icon: GraduationCap,
      badge: `${cumulativeCgpa.toFixed(2)}`,
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      id: 'tasks' as NavTab,
      label: 'Task Manager',
      icon: CheckSquare,
      badge: pendingTasks > 0 ? `${pendingTasks}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'timetable' as NavTab,
      label: 'Weekly Timetable',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'timer' as NavTab,
      label: 'Study Focus Timer',
      icon: Clock,
      badge: `${todayStudyMinutes}m`,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0a0d14] border-r border-[#1a2333] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Tag */}
        <div className="h-16 flex items-center px-5 border-b border-[#1a2333] justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-bold text-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">CampusHub</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
                Smart College Life
              </p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 to-indigo-500/10 text-white border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#121824]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Live Insights
          </div>

          {/* Quick Mini Stats Card */}
          <div className="p-3 rounded-xl bg-[#0f1420] border border-[#1e293b] space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Focus Streak
              </span>
              <span className="text-amber-300 font-semibold">{studyStreakDays} Days 🔥</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> CGPA Status
              </span>
              <span className="text-emerald-300 font-semibold">{cumulativeCgpa.toFixed(2)} / 10</span>
            </div>
            <div className="w-full bg-[#1b2333] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (cumulativeCgpa / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* User Card & Settings */}
        <div className="p-3 border-t border-[#1a2333] bg-[#0c1018]">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#141b28] transition-colors cursor-pointer group">
            <div
              className="flex items-center gap-2.5 flex-1 min-w-0"
              onClick={openSettings}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center font-bold text-white text-xs border border-indigo-400/30">
                {userProfile.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                  {userProfile.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{userProfile.semester}</p>
              </div>
            </div>
            <button
              onClick={openSettings}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e293b] transition-colors"
              title="Settings & Data"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
