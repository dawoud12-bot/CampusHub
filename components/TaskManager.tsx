'use client';

import React, { useState } from 'react';
import { useCampus } from '@/context/CampusContext';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Check,
  LayoutGrid,
  ListFilter,
  Layers,
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '@/types';
import confetti from 'canvas-confetti';
import { soundFx } from '@/lib/soundEffects';

interface TaskManagerProps {
  openNewTaskModal: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ openNewTaskModal }) => {
  const { tasks, updateTask, deleteTask, toggleTaskStatus, attendance } = useCampus();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'urgent' | 'pending' | 'completed'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Days until due calculation helper
  const getDueStatus = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Overdue by ${Math.abs(diffDays)}d`, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', isOverdue: true };
    } else if (diffDays === 0) {
      return { label: 'Due Today', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', isUrgent: true };
    } else if (diffDays === 1) {
      return { label: 'Due Tomorrow', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', isUrgent: true };
    } else {
      return { label: `Due in ${diffDays} days`, color: 'text-slate-400 bg-slate-800/40 border-slate-700/50' };
    }
  };

  const handleToggle = (id: string, currentStatus: TaskStatus) => {
    toggleTaskStatus(id);
    if (currentStatus !== 'completed') {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.8 } });
      soundFx.playChime();
    } else {
      soundFx.playTick();
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    const matchesQuery =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = selectedSubject === 'all' || task.subjectCode === selectedSubject;

    if (!matchesQuery || !matchesSubject) return false;

    if (selectedFilter === 'urgent') return task.priority === 'urgent' && task.status !== 'completed';
    if (selectedFilter === 'pending') return task.status !== 'completed';
    if (selectedFilter === 'completed') return task.status === 'completed';
    return true;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f1424] to-[#12192e] border border-[#1e293b] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Assignments & Lab Reports
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Deadlines & Task Management</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Never miss an assignment submission or lab report deadline. Track statuses with Kanban boards and subject tags.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={openNewTaskModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Assignment / Task</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search + Filters + View Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search assignments by title, subject or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs text-white"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter Dropdown */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0f1422] border border-[#1e293b] text-xs text-slate-300 outline-none"
          >
            <option value="all">All Subjects</option>
            {attendance.map((s) => (
              <option key={s.id} value={s.subjectCode}>
                {s.subjectCode}
              </option>
            ))}
          </select>

          {/* Status filters */}
          <div className="flex items-center p-1 rounded-xl bg-[#0f1422] border border-[#1e293b] text-xs">
            {(['all', 'pending', 'urgent', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                  selectedFilter === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-[#0f1422] border border-[#1e293b]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'kanban' ? 'bg-[#1a2333] text-indigo-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#1a2333] text-indigo-400' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Render View: Kanban or List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: To Do */}
          <div className="p-4 rounded-2xl bg-[#0b0e17] border border-[#1a2333] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1a2333]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">To Do</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#161f30] text-slate-400 font-mono">
                  {todoTasks.length}
                </span>
              </div>
            </div>

            <div className="space-y-3 min-h-[150px]">
              {todoTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No tasks in To Do</div>
              ) : (
                todoTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    getDueStatus={getDueStatus}
                    onToggle={() => handleToggle(task.id, task.status)}
                    onStatusChange={(status) => updateTask(task.id, { status })}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="p-4 rounded-2xl bg-[#0b0e17] border border-[#1a2333] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1a2333]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">In Progress</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#161f30] text-amber-400 font-mono">
                  {inProgressTasks.length}
                </span>
              </div>
            </div>

            <div className="space-y-3 min-h-[150px]">
              {inProgressTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No active work in progress</div>
              ) : (
                inProgressTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    getDueStatus={getDueStatus}
                    onToggle={() => handleToggle(task.id, task.status)}
                    onStatusChange={(status) => updateTask(task.id, { status })}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="p-4 rounded-2xl bg-[#0b0e17] border border-[#1a2333] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1a2333]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">Completed</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#161f30] text-emerald-400 font-mono">
                  {completedTasks.length}
                </span>
              </div>
            </div>

            <div className="space-y-3 min-h-[150px]">
              {completedTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No completed tasks yet</div>
              ) : (
                completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    getDueStatus={getDueStatus}
                    onToggle={() => handleToggle(task.id, task.status)}
                    onStatusChange={(status) => updateTask(task.id, { status })}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-[#1e293b] space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No tasks found matching criteria</div>
          ) : (
            filteredTasks.map((task) => {
              const due = getDueStatus(task.dueDate);
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#0a0d15] border border-[#1a2333] hover:border-indigo-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggle(task.id, task.status)}
                      className="w-5 h-5 rounded-md border border-slate-600 hover:border-emerald-400 flex items-center justify-center transition-colors shrink-0"
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="font-mono text-indigo-400 font-semibold">{task.subjectCode}</span>
                        <span>•</span>
                        <span>{task.description}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${due.color}`}>
                      {due.label}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-[#1a2333] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// Task Card Sub-component
const TaskCard: React.FC<{
  task: Task;
  getDueStatus: (d: string) => { label: string; color: string };
  onToggle: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
}> = ({ task, getDueStatus, onToggle, onStatusChange, onDelete }) => {
  const due = getDueStatus(task.dueDate);

  return (
    <div className="p-3.5 rounded-xl bg-[#0f1422] border border-[#1e293b] hover:border-indigo-500/40 transition-all space-y-2.5 group shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#161f30] text-indigo-400 border border-[#23324d]">
          {task.subjectCode}
        </span>
        <div className="flex items-center gap-1">
          <span
            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
              task.priority === 'urgent'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : task.priority === 'high'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}
          >
            {task.priority}
          </span>
          <button
            onClick={onDelete}
            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <button
          onClick={onToggle}
          className="w-4 h-4 mt-0.5 rounded border border-slate-600 hover:border-emerald-400 flex items-center justify-center transition-colors shrink-0"
        >
          {task.status === 'completed' && <Check className="w-3 h-3 text-emerald-400" />}
        </button>
        <div className="min-w-0">
          <h4
            className={`text-xs font-semibold leading-snug ${
              task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100 group-hover:text-white'
            }`}
          >
            {task.title}
          </h4>
          {task.description && (
            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[#161f30] text-slate-400 border border-[#1e293b]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Footer: Due Date badge + Move status dropdown */}
      <div className="pt-2 border-t border-[#1a2333] flex items-center justify-between text-[11px]">
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${due.color}`}>
          {due.label}
        </span>

        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
          className="text-[10px] px-2 py-0.5 rounded bg-[#0a0d15] border border-[#1e293b] text-slate-300 outline-none cursor-pointer"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
};
