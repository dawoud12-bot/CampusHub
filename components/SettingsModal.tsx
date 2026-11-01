'use client';

import React, { useState, useRef } from 'react';
import { useCampus } from '@/context/CampusContext';
import {
  X,
  User,
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  Save,
  AlertTriangle,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile, exportDataJson, importDataJson, resetAllData } = useCampus();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'data' | 'shortcuts'>('profile');

  // Local form state
  const [formData, setFormData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    studentId: userProfile.studentId,
    university: userProfile.university,
    department: userProfile.department,
    semester: userProfile.semester,
    targetCgpa: userProfile.targetCgpa,
  });

  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataJson(content);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f1422] border border-[#1e293b] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2333] bg-[#0c101a]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">System Settings & Data</h2>
              <p className="text-xs text-slate-400">Configure profile, data persistence, and shortcuts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex border-b border-[#1a2333] px-6 bg-[#0c101a]/50 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors ${
              activeSubTab === 'profile'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Student Profile
          </button>
          <button
            onClick={() => setActiveSubTab('data')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors ${
              activeSubTab === 'data'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Data & LocalStorage
          </button>
          <button
            onClick={() => setActiveSubTab('shortcuts')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors ${
              activeSubTab === 'shortcuts'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            About & Guides
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Student ID / Roll No</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target CGPA Goal (out of 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="10"
                    value={formData.targetCgpa}
                    onChange={(e) => setFormData({ ...formData, targetCgpa: parseFloat(e.target.value) || 9.0 })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">University / Institute</label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department / Major</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Semester</label>
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    placeholder="e.g. Semester 5"
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                    required
                  />
                </div>
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
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'data' && (
            <div className="space-y-6 text-sm">
              <div className="p-4 rounded-xl bg-[#141b2a] border border-[#1e293b] flex items-start gap-3">
                <Database className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Local Storage Architecture</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    All your academic data (Attendance, CGPA courses, Tasks, Timetables, and Study minutes) is securely stored in your browser's persistent local storage. No external telemetry or cloud credentials are required.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="p-4 rounded-xl bg-[#0c101a] border border-[#1e293b] flex flex-col justify-between">
                  <div>
                    <h5 className="font-semibold text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-400" /> Export JSON
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Download a complete backup snapshot of your timetable, courses, grades, and tasks.
                    </p>
                  </div>
                  <button
                    onClick={exportDataJson}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all font-medium text-xs"
                  >
                    <Download className="w-4 h-4" /> Download Backup (.json)
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-4 rounded-xl bg-[#0c101a] border border-[#1e293b] flex flex-col justify-between">
                  <div>
                    <h5 className="font-semibold text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-cyan-400" /> Import JSON
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Restore your data from a previously downloaded CampusHub backup file.
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition-all font-medium text-xs"
                  >
                    <Upload className="w-4 h-4" /> Select File to Restore
                  </button>
                </div>
              </div>

              {/* Danger Zone: Reset */}
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 mt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-semibold text-rose-300 flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-rose-400" /> Reset to Realistic Demo Data
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Clears custom modifications and reloads authentic engineering courses, attendance records, tasks, and timetables.
                    </p>
                  </div>
                </div>

                {!confirmReset ? (
                  <button
                    onClick={() => setConfirmReset(true)}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 text-xs font-medium transition-all"
                  >
                    Reset All Data
                  </button>
                ) : (
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => {
                        resetAllData();
                        setConfirmReset(false);
                        onClose();
                      }}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-500 transition-all shadow-md shadow-rose-600/30"
                    >
                      Confirm Factory Reset
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'shortcuts' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#141b2a] border border-[#1e293b]">
                <h4 className="font-semibold text-white text-sm mb-2">CampusHub SaaS Features</h4>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <strong>Attendance Calculator:</strong> Solves formula to advise exact bunkable or required consecutive classes to reach minimum target.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <strong>CGPA Simulator:</strong> Multi-semester grading with 10-point scale and future required SGPA predictor.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <strong>Timetable:</strong> Dynamic schedule with live indicators and real-time class tracking.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <strong>Study Room:</strong> Pomodoro timer with offline acoustic synthesized rain, white noise, and alpha binaural waves.
                  </li>
                </ul>
              </div>

              <div className="text-center pt-2 text-slate-500 text-[11px]">
                CampusHub v1.0 • Built with Next.js, Tailwind CSS & LocalStorage
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
