'use client';

import React, { useState } from 'react';
import { Sidebar, NavTab } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { DashboardOverview } from '@/components/DashboardOverview';
import { AttendanceCalculator } from '@/components/AttendanceCalculator';
import { CgpaCalculator } from '@/components/CgpaCalculator';
import { TaskManager } from '@/components/TaskManager';
import { WeeklyTimetable } from '@/components/WeeklyTimetable';
import { StudyTimer } from '@/components/StudyTimer';
import { SettingsModal } from '@/components/SettingsModal';
import { NewTaskModal } from '@/components/NewTaskModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div className="min-h-screen bg-[#090b10] text-[#f1f5f9] flex bg-grid-pattern">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={() => setIsSettingsOpen(true)}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full">
        {/* Top Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openNewTaskModal={() => setIsNewTaskOpen(true)}
          openSettings={() => setIsSettingsOpen(true)}
          toggleMobileSidebar={() => setIsOpenMobile(!isOpenMobile)}
        />

        {/* Dynamic Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              setActiveTab={setActiveTab}
              openNewTaskModal={() => setIsNewTaskOpen(true)}
            />
          )}

          {activeTab === 'attendance' && <AttendanceCalculator />}

          {activeTab === 'cgpa' && <CgpaCalculator />}

          {activeTab === 'tasks' && (
            <TaskManager openNewTaskModal={() => setIsNewTaskOpen(true)} />
          )}

          {activeTab === 'timetable' && <WeeklyTimetable />}

          {activeTab === 'timer' && <StudyTimer />}
        </main>
      </div>

      {/* System Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
      />
    </div>
  );
}
