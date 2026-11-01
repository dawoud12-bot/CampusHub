'use client';

import React, { useState } from 'react';
import { useCampus } from '@/context/CampusContext';
import {
  Percent,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit2,
  Calculator,
  Sliders,
  Check,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { getAttendanceStats } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { soundFx } from '@/lib/soundEffects';

export const AttendanceCalculator: React.FC = () => {
  const {
    attendance,
    addAttendanceSubject,
    updateAttendance,
    markAttendance,
    deleteAttendanceSubject,
    updateTargetAttendance,
  } = useCampus();

  // Add subject modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newAttended, setNewAttended] = useState(20);
  const [newTotal, setNewTotal] = useState(24);
  const [newTarget, setNewTarget] = useState(75);

  // Edit subject modal state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAttended, setEditAttended] = useState(0);
  const [editTotal, setEditTotal] = useState(0);

  // What-If Simulator state
  const [simSubjectId, setSimSubjectId] = useState<string>(attendance[0]?.id || '');
  const [upcomingClasses, setUpcomingClasses] = useState<number>(10);
  const [classesToAttendInSim, setClassesToAttendInSim] = useState<number>(8);

  const selectedSimSubject = attendance.find((a) => a.id === simSubjectId) || attendance[0];

  // Aggregates
  const totalAttended = attendance.reduce((s, a) => s + a.attended, 0);
  const totalConducted = attendance.reduce((s, a) => s + a.total, 0);
  const aggregatePercentage = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 1000) / 10 : 100;
  const aggregateStats = getAttendanceStats(totalAttended, totalConducted, 75);

  const handleAddNewSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode.trim() || !newSubName.trim()) return;

    addAttendanceSubject({
      subjectCode: newSubCode.trim().toUpperCase(),
      subjectName: newSubName.trim(),
      attended: Math.max(0, newAttended),
      total: Math.max(newAttended, newTotal),
      targetPercentage: newTarget,
      color: '#3b82f6',
    });

    setNewSubCode('');
    setNewSubName('');
    setNewAttended(20);
    setNewTotal(24);
    setIsAddModalOpen(false);
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleQuickAdd = (id: string, attendedDelta: number, totalDelta: number) => {
    const item = attendance.find((a) => a.id === id);
    if (!item) return;

    const newAtt = Math.max(0, item.attended + attendedDelta);
    const newTot = Math.max(newAtt, item.total + totalDelta);
    updateAttendance(id, newAtt, newTot);
    soundFx.playTick();

    if (attendedDelta > 0) {
      // Check if this newly moved above target
      const oldStats = getAttendanceStats(item.attended, item.total, item.targetPercentage);
      const newStats = getAttendanceStats(newAtt, newTot, item.targetPercentage);
      if (oldStats.isShortage && !newStats.isShortage) {
        confetti({ particleCount: 60, spread: 50 });
        soundFx.playChime();
      }
    }
  };

  const startEdit = (id: string, att: number, tot: number) => {
    setEditingId(id);
    setEditAttended(att);
    setEditTotal(tot);
  };

  const saveEdit = (id: string) => {
    updateAttendance(id, Math.max(0, editAttended), Math.max(editAttended, editTotal));
    setEditingId(null);
  };

  // What-If projected calculation
  const simCurrentAttended = selectedSimSubject ? selectedSimSubject.attended : 0;
  const simCurrentTotal = selectedSimSubject ? selectedSimSubject.total : 0;
  const projectedTotal = simCurrentTotal + upcomingClasses;
  const projectedAttended = simCurrentAttended + Math.min(upcomingClasses, classesToAttendInSim);
  const projectedPercentage = projectedTotal > 0 ? Math.round((projectedAttended / projectedTotal) * 1000) / 10 : 100;
  const projectedStats = selectedSimSubject
    ? getAttendanceStats(projectedAttended, projectedTotal, selectedSimSubject.targetPercentage)
    : { isShortage: false };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner & Overall Aggregate Status */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f1424] to-[#12192e] border border-[#1e293b] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Attendance Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Smart Attendance Tracker & Calculator</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Calculates exact classes needed to reach eligibility criteria (e.g. 75%) or how many classes you can afford to bunk safely.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#0a0d15] p-4 rounded-xl border border-[#1a2333] shrink-0">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Aggregate Rate</span>
            <div className="text-2xl font-bold text-white">{aggregatePercentage}%</div>
            <span className="text-xs text-slate-400">
              {totalAttended} / {totalConducted} classes
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-[#1e293b] flex items-center justify-center relative">
            <div
              className={`text-xs font-bold ${
                aggregateStats.isShortage ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {aggregatePercentage >= 75 ? 'SAFE' : 'LOW'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar: Add Subject + Stats Summary */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Tracking <strong className="text-white">{attendance.length}</strong> college courses</span>
          <span>•</span>
          <span className="text-emerald-400">Target baseline: 75% min</span>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects Attendance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendance.map((sub) => {
          const stats = getAttendanceStats(sub.attended, sub.total, sub.targetPercentage);
          const isEditing = editingId === sub.id;

          return (
            <div
              key={sub.id}
              className={`p-5 rounded-2xl bg-[#0f1422] border transition-all duration-300 flex flex-col justify-between ${
                stats.isShortage
                  ? 'border-rose-500/40 hover:shadow-lg hover:shadow-rose-500/5'
                  : 'border-[#1e293b] hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5'
              }`}
            >
              <div>
                {/* Subject Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#161f30] text-indigo-400 border border-[#23324d]">
                      {sub.subjectCode}
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-1.5 truncate" title={sub.subjectName}>
                      {sub.subjectName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => (isEditing ? saveEdit(sub.id) : startEdit(sub.id, sub.attended, sub.total))}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2333] transition-colors"
                      title={isEditing ? 'Save Changes' : 'Direct Edit'}
                    >
                      {isEditing ? <Check className="w-4 h-4 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteAttendanceSubject(sub.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-[#1a2333] transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Progress Bar & Numbers */}
                <div className="space-y-2 my-4">
                  <div className="flex items-baseline justify-between">
                    {isEditing ? (
                      <div className="flex items-center gap-2 text-xs">
                        <input
                          type="number"
                          min="0"
                          value={editAttended}
                          onChange={(e) => setEditAttended(parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 rounded bg-[#0a0d15] border border-indigo-500/50 text-white font-mono text-center"
                        />
                        <span className="text-slate-400">/</span>
                        <input
                          type="number"
                          min="1"
                          value={editTotal}
                          onChange={(e) => setEditTotal(parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 rounded bg-[#0a0d15] border border-indigo-500/50 text-white font-mono text-center"
                        />
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white tracking-tight">{stats.percentage}%</span>
                        <span className="text-xs text-slate-400 font-mono">
                          ({sub.attended}/{sub.total} classes)
                        </span>
                      </div>
                    )}

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        stats.isShortage
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {stats.isShortage ? 'Shortage Alert' : 'On Track'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#1b2333] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stats.isShortage ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, stats.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Smart Mathematical Advice Box */}
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    stats.isShortage
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                  }`}
                >
                  {stats.isShortage ? (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                      <div>
                        Need to attend{' '}
                        <strong className="text-white underline font-bold">
                          {stats.classesToAttend} consecutive class(es)
                        </strong>{' '}
                        to reach your {sub.targetPercentage}% target.
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        Safe zone! You can bunk{' '}
                        <strong className="text-white underline font-bold">
                          {stats.classesCanBunk} class(es)
                        </strong>{' '}
                        without dropping below {sub.targetPercentage}%.
                      </div>
                    </div>
                  )}
                </div>

                {/* Target slider */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Target criteria:</span>
                  <div className="flex items-center gap-1.5">
                    {[75, 80, 85].map((target) => (
                      <button
                        key={target}
                        onClick={() => updateTargetAttendance(sub.id, target)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                          sub.targetPercentage === target
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[#161f30] text-slate-400 hover:text-white'
                        }`}
                      >
                        {target}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: 1-click +Present and +Absent */}
              <div className="pt-4 mt-4 border-t border-[#1a2333] flex items-center gap-2">
                <button
                  onClick={() => handleQuickAdd(sub.id, 1, 1)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Present
                </button>
                <button
                  onClick={() => handleQuickAdd(sub.id, 0, 1)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <X className="w-3.5 h-3.5" /> Absent
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive What-If Scenario Simulator Section */}
      <div className="p-6 rounded-2xl bg-[#0f1422] border border-[#1e293b]">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Interactive "What-If" Scenario Simulator</h3>
            <p className="text-xs text-slate-400">Simulate future semester attendance before taking planned leaves</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Subject to Simulate</label>
              <select
                value={simSubjectId}
                onChange={(e) => setSimSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white bg-[#0a0d15]"
              >
                {attendance.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0a0d15] text-white">
                    {s.subjectCode} - {s.subjectName} (Current: {s.attended}/{s.total})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Upcoming Classes Remaining:</span>
                  <span className="font-mono text-indigo-400 font-bold">{upcomingClasses} classes</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={upcomingClasses}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setUpcomingClasses(val);
                    if (classesToAttendInSim > val) setClassesToAttendInSim(val);
                  }}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Classes You Plan to Attend:</span>
                  <span className="font-mono text-emerald-400 font-bold">{classesToAttendInSim} classes</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={upcomingClasses}
                  value={classesToAttendInSim}
                  onChange={(e) => setClassesToAttendInSim(parseInt(e.target.value) || 0)}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Bunking: <strong className="text-rose-400">{upcomingClasses - classesToAttendInSim} classes</strong></span>
              <span>•</span>
              <span>Attending: <strong className="text-emerald-400">{classesToAttendInSim} classes</strong></span>
            </div>
          </div>

          {/* Projected Result Gauge */}
          <div className="p-5 rounded-xl bg-[#0a0d15] border border-[#1a2333] flex flex-col items-center justify-center text-center">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Projected Final Rate</span>
            <div
              className={`text-3xl font-extrabold mt-1 tracking-tight ${
                projectedPercentage >= (selectedSimSubject?.targetPercentage || 75)
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {projectedPercentage}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {projectedAttended} attended of {projectedTotal} total
            </p>

            <div
              className={`mt-4 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                projectedPercentage >= (selectedSimSubject?.targetPercentage || 75)
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
              }`}
            >
              {projectedPercentage >= (selectedSimSubject?.targetPercentage || 75)
                ? '✓ Eligible for Exams'
                : '⚠ Will Cause Shortage'}
            </div>
          </div>
        </div>
      </div>

      {/* Add New Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f1422] border border-[#1e293b] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a2333] bg-[#0c101a]">
              <h3 className="text-base font-semibold text-white">Add Subject to Attendance Tracker</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2333]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS309"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Networks"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Classes Attended</label>
                  <input
                    type="number"
                    min="0"
                    value={newAttended}
                    onChange={(e) => setNewAttended(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total Classes Held</label>
                  <input
                    type="number"
                    min="1"
                    value={newTotal}
                    onChange={(e) => setNewTotal(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Criteria (%)</label>
                <select
                  value={newTarget}
                  onChange={(e) => setNewTarget(parseInt(e.target.value) || 75)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white bg-[#0a0d15]"
                >
                  <option value={75} className="bg-[#0a0d15] text-white">75% (Standard University Requirement)</option>
                  <option value={80} className="bg-[#0a0d15] text-white">80% (Safe Target)</option>
                  <option value={85} className="bg-[#0a0d15] text-white">85% (High Honor Roll)</option>
                </select>
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
                  <Plus className="w-4 h-4" /> Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
