'use client';

import React, { useState } from 'react';
import { useCampus } from '@/context/CampusContext';
import {
  GraduationCap,
  Plus,
  Trash2,
  TrendingUp,
  Target,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import { calculateSgpa, predictRequiredGpa } from '@/lib/utils';
import { GRADE_SCALE } from '@/lib/initialData';
import confetti from 'canvas-confetti';

export const CgpaCalculator: React.FC = () => {
  const {
    semesters,
    addSemester,
    deleteSemester,
    addCourse,
    updateCourse,
    deleteCourse,
    cumulativeCgpa,
    totalCredits,
    userProfile,
  } = useCampus();

  const [activeSemIndex, setActiveSemIndex] = useState(semesters.length > 0 ? semesters.length - 1 : 0);
  const [newSemName, setNewSemName] = useState('');
  const [isAddSemOpen, setIsAddSemOpen] = useState(false);

  // New course form state
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCredits, setCourseCredits] = useState(4);
  const [courseGrade, setCourseGrade] = useState('A+');

  // Target CGPA Predictor state
  const [targetGoal, setTargetGoal] = useState<number>(userProfile.targetCgpa || 9.0);
  const [remainingCredits, setRemainingCredits] = useState<number>(36);

  const currentSemester = semesters[activeSemIndex] || semesters[0];
  const currentSgpa = currentSemester ? calculateSgpa(currentSemester.courses) : 0;

  // Predictor calculation
  const prediction = predictRequiredGpa(cumulativeCgpa, totalCredits, targetGoal, remainingCredits);

  // Grade breakdown distribution
  const gradeCounts: Record<string, number> = { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0 };
  let allCoursesCount = 0;
  for (const s of semesters) {
    for (const c of s.courses) {
      allCoursesCount++;
      if (gradeCounts[c.grade] !== undefined) {
        gradeCounts[c.grade]++;
      }
    }
  }

  const handleCreateSemester = (e: React.FormEvent) => {
    e.preventDefault();
    addSemester(newSemName.trim());
    setNewSemName('');
    setIsAddSemOpen(false);
    setActiveSemIndex(semesters.length);
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSemester || !courseCode.trim() || !courseName.trim()) return;

    addCourse(currentSemester.id, {
      code: courseCode.trim().toUpperCase(),
      name: courseName.trim(),
      credits: courseCredits,
      grade: courseGrade,
      gradePoint: GRADE_SCALE[courseGrade] ?? 9,
    });

    setCourseCode('');
    setCourseName('');
    setCourseCredits(4);
    setIsAddCourseOpen(false);
    confetti({ particleCount: 40, spread: 50 });
  };

  const handleGradeChange = (semesterId: string, courseId: string, newGrade: string) => {
    const gp = GRADE_SCALE[newGrade] ?? 0;
    updateCourse(semesterId, courseId, { grade: newGrade, gradePoint: gp });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner & Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f1424] to-[#12192e] border border-[#1e293b] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              UGC / AICTE 10-Point Grading System
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">CGPA & SGPA Academic Calculator</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Track semester-wise credit weights, calculate your exact cumulative CGPA, and project target graduation requirements.
          </p>
        </div>

        {/* Big CGPA Metric Badge */}
        <div className="flex items-center gap-4 bg-[#0a0d15] p-4 rounded-xl border border-[#1a2333] shrink-0">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Cumulative CGPA</span>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
              {cumulativeCgpa.toFixed(2)}
            </div>
            <span className="text-xs text-slate-400">
              {totalCredits} Total Credits Earned
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center">
            <Award className="w-7 h-7 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Semesters Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a2333] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {semesters.map((sem, idx) => {
            const semSgpa = calculateSgpa(sem.courses);
            const isActive = activeSemIndex === idx;
            return (
              <button
                key={sem.id}
                onClick={() => setActiveSemIndex(idx)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-[#0f1422] text-slate-400 hover:text-white border border-[#1e293b]'
                }`}
              >
                <span>{sem.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isActive ? 'bg-indigo-800 text-white' : 'bg-[#1a2333] text-indigo-400'
                  }`}
                >
                  {semSgpa.toFixed(2)}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsAddSemOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-[#141b28] border border-dashed border-[#243048] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Semester</span>
          </button>
        </div>

        {currentSemester && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Current Semester SGPA:</span>
            <span className="font-bold text-white text-sm px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              {currentSgpa.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Active Semester Course Table Card */}
      {currentSemester && (
        <div className="p-6 rounded-2xl bg-[#0f1422] border border-[#1e293b] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1a2333]">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                {currentSemester.name} Courses & Grades
              </h3>
              <p className="text-xs text-slate-400">
                {currentSemester.courses.length} courses enrolled • {currentSemester.courses.reduce((s, c) => s + c.credits, 0)} total credits
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsAddCourseOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Course</span>
              </button>

              {semesters.length > 1 && (
                <button
                  onClick={() => {
                    deleteSemester(currentSemester.id);
                    setActiveSemIndex(0);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-[#1a2333] transition-colors"
                  title="Delete this entire semester"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Courses Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-[#1a2333] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Course Title</th>
                  <th className="py-3 px-3 text-center">Credits</th>
                  <th className="py-3 px-3 text-center">Grade Letter</th>
                  <th className="py-3 px-3 text-center">Grade Point</th>
                  <th className="py-3 px-3 text-right">Credit Pts</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161f30]">
                {currentSemester.courses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#121824] transition-colors group">
                    <td className="py-3 px-3 font-mono font-semibold text-indigo-400">{course.code}</td>
                    <td className="py-3 px-3 font-medium text-white">{course.name}</td>
                    <td className="py-3 px-3 text-center font-mono">{course.credits}</td>
                    <td className="py-3 px-3 text-center">
                      <select
                        value={course.grade}
                        onChange={(e) => handleGradeChange(currentSemester.id, course.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-[#0a0d15] border border-[#23324d] text-white font-bold text-xs focus:border-indigo-500 outline-none cursor-pointer"
                      >
                        {Object.keys(GRADE_SCALE).map((g) => (
                          <option key={g} value={g} className="bg-[#0a0d15] text-white">
                            {g} ({GRADE_SCALE[g]} pts)
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                      {course.gradePoint}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                      {(course.credits * course.gradePoint).toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => deleteCourse(currentSemester.id, course.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Target CGPA Predictor & Grade Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictor */}
        <div className="p-6 rounded-2xl bg-[#0f1422] border border-[#1e293b] space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Target CGPA Graduation Predictor</h3>
              <p className="text-xs text-slate-400">Calculate the exact SGPA needed in remaining semesters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Desired CGPA</label>
              <input
                type="number"
                step="0.05"
                min="5"
                max="10"
                value={targetGoal}
                onChange={(e) => setTargetGoal(parseFloat(e.target.value) || 9.0)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Remaining Credits</label>
              <input
                type="number"
                min="4"
                max="100"
                value={remainingCredits}
                onChange={(e) => setRemainingCredits(parseInt(e.target.value) || 36)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-mono"
              />
            </div>
          </div>

          {/* Result card */}
          <div
            className={`p-4 rounded-xl border mt-2 flex items-center justify-between ${
              prediction.isAchievable
                ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-200'
                : 'bg-rose-600/10 border-rose-500/20 text-rose-200'
            }`}
          >
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Required SGPA in Remaining Semesters
              </span>
              <div
                className={`text-2xl font-bold mt-0.5 ${
                  prediction.isAchievable ? 'text-indigo-300' : 'text-rose-400'
                }`}
              >
                {prediction.requiredGpa.toFixed(2)} SGPA
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {prediction.isAchievable
                  ? `Achievable! Maintain ~${prediction.requiredGpa.toFixed(2)} across your next courses.`
                  : `Mathematically requires >10.00 SGPA. Consider adjusting target.`}
              </p>
            </div>

            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                prediction.isAchievable
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {prediction.isAchievable ? '✓ Feasible' : '⚠ Over Limit'}
            </div>
          </div>
        </div>

        {/* Grade Scale Reference & Distribution */}
        <div className="p-6 rounded-2xl bg-[#0f1422] border border-[#1e293b] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Grade Distribution Across Semesters
            </h3>
            <span className="text-xs text-slate-400">{allCoursesCount} graded courses</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
            {['O', 'A+', 'A', 'B+', 'B', 'C'].map((g) => {
              const count = gradeCounts[g] || 0;
              const pct = allCoursesCount > 0 ? Math.round((count / allCoursesCount) * 100) : 0;
              return (
                <div key={g} className="p-2.5 rounded-xl bg-[#0a0d15] border border-[#1a2333] text-center">
                  <span className="text-xs font-bold text-indigo-400">{g}</span>
                  <div className="text-lg font-extrabold text-white mt-0.5">{count}</div>
                  <span className="text-[10px] text-slate-500">{pct}%</span>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a0d15] border border-[#1a2333] text-xs space-y-1.5 text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Info className="w-3.5 h-3.5 text-indigo-400" /> Equivalent Percentage Formula:
            </div>
            <p>
              Standard AICTE Conversion: <strong className="text-white">Percentage = (CGPA - 0.75) × 10</strong>
            </p>
            <p className="text-indigo-300 font-medium">
              Your Estimated Equivalent: ~{Math.max(0, Math.round((cumulativeCgpa - 0.75) * 10 * 10) / 10)}%
            </p>
          </div>
        </div>
      </div>

      {/* Add Semester Modal */}
      {isAddSemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f1422] border border-[#1e293b] rounded-2xl w-full max-w-sm overflow-hidden p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-3">Add New Semester</h3>
            <form onSubmit={handleCreateSemester} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Semester Name</label>
                <input
                  type="text"
                  placeholder={`Semester ${semesters.length + 1}`}
                  value={newSemName}
                  onChange={(e) => setNewSemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSemOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Create Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {isAddCourseOpen && currentSemester && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f1422] border border-[#1e293b] rounded-2xl w-full max-w-md overflow-hidden p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Add Course to {currentSemester.name}</h3>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS305"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Architecture"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Credits</label>
                  <select
                    value={courseCredits}
                    onChange={(e) => setCourseCredits(parseInt(e.target.value) || 4)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white bg-[#0a0d15]"
                  >
                    {[1, 2, 3, 4, 5].map((cr) => (
                      <option key={cr} value={cr} className="bg-[#0a0d15] text-white">
                        {cr} {cr === 1 ? 'Credit' : 'Credits'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Grade Earned</label>
                  <select
                    value={courseGrade}
                    onChange={(e) => setCourseGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white bg-[#0a0d15]"
                  >
                    {Object.keys(GRADE_SCALE).map((g) => (
                      <option key={g} value={g} className="bg-[#0a0d15] text-white">
                        {g} ({GRADE_SCALE[g]} points)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#1a2333]">
                <button
                  type="button"
                  onClick={() => setIsAddCourseOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
