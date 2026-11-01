'use client';

import React, { useState } from 'react';
import { useCampus } from '@/context/CampusContext';
import { X, Plus, Calendar, Tag, AlertCircle } from 'lucide-react';
import { Priority } from '@/types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose }) => {
  const { attendance, addTask } = useCampus();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(attendance[0]?.subjectCode || 'CS301');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<Priority>('medium');
  const [tagInput, setTagInput] = useState('Assignment, Lab');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedSub = attendance.find((a) => a.subjectCode === subject);
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addTask({
      title: title.trim(),
      description: description.trim(),
      subjectCode: subject,
      subjectName: matchedSub ? matchedSub.subjectName : subject,
      dueDate,
      priority,
      status: 'todo',
      tags: tags.length > 0 ? tags : ['Assignment'],
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f1422] border border-[#1e293b] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2333] bg-[#0c101a]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Create New Task / Deadline</h2>
              <p className="text-xs text-slate-400">Keep track of college projects and homework</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Task Title</label>
            <input
              type="text"
              placeholder="e.g. Implement Dijkstra's Algorithm in C++"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Course / Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white bg-[#0f1420]"
              >
                {attendance.map((sub) => (
                  <option key={sub.id} value={sub.subjectCode} className="bg-[#0f1420] text-white">
                    {sub.subjectCode} - {sub.subjectName}
                  </option>
                ))}
                <option value="GENERAL" className="bg-[#0f1420] text-white">General / Extracurricular</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white bg-[#0f1420]"
              >
                <option value="low" className="bg-[#0f1420] text-slate-300">Low Priority</option>
                <option value="medium" className="bg-[#0f1420] text-blue-300">Medium Priority</option>
                <option value="high" className="bg-[#0f1420] text-amber-300">High Priority</option>
                <option value="urgent" className="bg-[#0f1420] text-rose-300">Urgent (Due Soon)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="Lab, Midterm, Coding"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Description & Guidelines</label>
            <textarea
              rows={3}
              placeholder="Include submission portal links, formatting guidelines, or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#1a2333]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-[#1a2333] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
