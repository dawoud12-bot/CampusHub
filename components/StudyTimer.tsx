'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCampus } from '@/context/CampusContext';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CloudRain,
  Radio,
  Sparkles,
  Flame,
  CheckCircle2,
  Coffee,
  Brain,
  Sliders,
  History,
  BookOpen,
} from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { soundFx } from '@/lib/soundEffects';
import confetti from 'canvas-confetti';

type TimerMode = 'pomodoro' | 'short_break' | 'long_break' | 'custom';

const MODE_TIMES: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
  custom: 45 * 60,
};

const MOTIVATIONAL_QUOTES = [
  { text: "Consistency is what transforms average into excellence.", author: "Computer Science Dept" },
  { text: "Code never lies, comments sometimes do. Keep focusing.", author: "Engineering Maxim" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Focus is a muscle. The more you practice deep work, the easier it gets.", author: "Cal Newport" },
];

export const StudyTimer: React.FC = () => {
  const { studySessions, logStudySession, todayStudyMinutes, studyStreakDays, attendance } = useCampus();

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [totalSeconds, setTotalSeconds] = useState<number>(MODE_TIMES.pomodoro);
  const [secondsLeft, setSecondsLeft] = useState<number>(MODE_TIMES.pomodoro);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<string>(attendance[0]?.subjectCode || 'CS301');

  // Ambient sound state
  const [ambientType, setAmbientType] = useState<'none' | 'rain' | 'whitenoise' | 'binaural'>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.2);

  // Motivational quote index
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Handle mode switch
  const handleModeChange = (newMode: TimerMode, customDurationMinutes?: number) => {
    setIsRunning(false);
    setMode(newMode);
    const secs = customDurationMinutes ? customDurationMinutes * 60 : MODE_TIMES[newMode];
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    soundFx.playTick();
  };

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsLeft === 0) {
      // Completed!
      setIsRunning(false);
      soundFx.playChime();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

      // Log session
      const durationMins = Math.round(totalSeconds / 60);
      if (mode === 'pomodoro' || mode === 'custom') {
        logStudySession({
          durationMinutes: durationMins,
          subjectOrTask: `${selectedSubject} Focus Session`,
          mode,
        });
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, totalSeconds, mode, selectedSubject, logStudySession]);

  // Ambient sound handler
  const handleToggleAmbient = (type: 'rain' | 'whitenoise' | 'binaural') => {
    if (ambientType === type) {
      soundFx.stopAmbient();
      setAmbientType('none');
    } else {
      soundFx.startAmbient(type, ambientVolume);
      setAmbientType(type);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    soundFx.setAmbientVolume(vol);
  };

  // Rotate motivational quote
  useEffect(() => {
    const qInterval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 12000);
    return () => clearInterval(qInterval);
  }, []);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      soundFx.stopAmbient();
    };
  }, []);

  // Calculate circular progress percentage
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  const strokeDashoffset = 2 * Math.PI * 110 * (1 - progressPercent / 100);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f1424] to-[#12192e] border border-[#1e293b] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Deep Work & Focus Room
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Pomodoro Study Sanctuary</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Block distractions, pace yourself with interval sprints, and generate relaxing ambient audio offline with zero latency.
          </p>
        </div>

        {/* Streak & Today's Metric */}
        <div className="flex items-center gap-4 bg-[#0a0d15] p-4 rounded-xl border border-[#1a2333] shrink-0">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Today's Focus</span>
            <div className="text-2xl font-bold text-purple-300">{todayStudyMinutes} mins</div>
            <span className="text-xs text-amber-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> {studyStreakDays}-day streak
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Main Study Room Layout: Left Big Clock + Right Ambient Acoustic & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Digital Clock & Radial Progress Ring */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-[#0f1422] border border-[#1e293b] flex flex-col items-center justify-between text-center relative overflow-hidden shadow-xl">
          {/* Background Ambient Glow */}
          <div
            className={`absolute w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20 -top-20 ${
              mode === 'pomodoro'
                ? 'bg-purple-600'
                : mode === 'short_break'
                ? 'bg-emerald-600'
                : 'bg-indigo-600'
            }`}
          />

          {/* Mode Tabs */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#0a0d15] border border-[#1a2333]">
            <button
              onClick={() => handleModeChange('pomodoro')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === 'pomodoro'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Focus Sprint (25m)
            </button>
            <button
              onClick={() => handleModeChange('short_break')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === 'short_break'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => handleModeChange('long_break')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === 'long_break'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Long Break (15m)
            </button>
            <button
              onClick={() => handleModeChange('custom', 45)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                mode === 'custom'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Deep Flow (45m)
            </button>
          </div>

          {/* Subject tag selector for logging */}
          <div className="relative z-10 my-4 flex items-center gap-2 text-xs">
            <span className="text-slate-400">Target Course:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0a0d15] border border-[#23324d] text-xs font-semibold text-indigo-300 outline-none cursor-pointer"
            >
              {attendance.map((s) => (
                <option key={s.id} value={s.subjectCode} className="bg-[#0a0d15] text-white">
                  {s.subjectCode} - {s.subjectName}
                </option>
              ))}
              <option value="GENERAL" className="bg-[#0a0d15] text-white">General Exam Prep</option>
            </select>
          </div>

          {/* Big Radial Progress Clock Ring */}
          <div className="relative z-10 my-6 flex items-center justify-center">
            <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="50%"
                cy="50%"
                r="110"
                className="stroke-[#161f30]"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Animated Progress circle */}
              <circle
                cx="50%"
                cy="50%"
                r="110"
                className={`transition-all duration-500 ${
                  mode === 'pomodoro'
                    ? 'stroke-purple-500'
                    : mode === 'short_break'
                    ? 'stroke-emerald-400'
                    : 'stroke-indigo-400'
                }`}
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 110}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Central Clock Digits */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl font-extrabold font-mono text-white tracking-wider">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-2">
                {isRunning ? 'Session Active' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Action Buttons: Start, Pause, Reset */}
          <div className="relative z-10 flex items-center gap-4">
            <button
              onClick={() => {
                setIsRunning(!isRunning);
                soundFx.playTick();
              }}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl transition-all active:scale-95 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" /> Start Focus
                </>
              )}
            </button>

            <button
              onClick={() => handleModeChange(mode)}
              className="p-3.5 rounded-2xl bg-[#0a0d15] hover:bg-[#161f30] text-slate-300 border border-[#1e293b] transition-all hover:text-white"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Motivational college quote */}
          <div className="relative z-10 mt-8 pt-4 border-t border-[#1a2333] w-full max-w-md">
            <p className="text-xs italic text-slate-300 transition-all duration-300">
              "{MOTIVATIONAL_QUOTES[quoteIdx].text}"
            </p>
            <span className="text-[10px] text-indigo-400 font-semibold mt-1 block">
              — {MOTIVATIONAL_QUOTES[quoteIdx].author}
            </span>
          </div>
        </div>

        {/* Right 1 Col: Ambient Acoustic Synthesizer & Session History */}
        <div className="space-y-6">
          {/* Ambient Acoustic Generator Card */}
          <div className="p-6 rounded-2xl bg-[#0f1422] border border-[#1e293b] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">Synthesized Focus Sounds</h3>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Offline Web Audio
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes real-time calming acoustic frequencies in your browser without loading external audio files:
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Rain */}
              <button
                onClick={() => handleToggleAmbient('rain')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  ambientType === 'rain'
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 shadow-md shadow-blue-500/10'
                    : 'bg-[#0a0d15] border-[#1a2333] text-slate-400 hover:text-white'
                }`}
              >
                <CloudRain className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-medium">Soft Rain</span>
              </button>

              {/* White Noise */}
              <button
                onClick={() => handleToggleAmbient('whitenoise')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  ambientType === 'whitenoise'
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 shadow-md shadow-purple-500/10'
                    : 'bg-[#0a0d15] border-[#1a2333] text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-medium">White Noise</span>
              </button>

              {/* Alpha Waves */}
              <button
                onClick={() => handleToggleAmbient('binaural')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  ambientType === 'binaural'
                    ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-[#0a0d15] border-[#1a2333] text-slate-400 hover:text-white'
                }`}
              >
                <Brain className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-medium">Alpha 432Hz</span>
              </button>
            </div>

            {/* Volume control */}
            {ambientType !== 'none' && (
              <div className="pt-2 flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value) || 0.2)}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <button
                  onClick={() => handleToggleAmbient(ambientType as any)}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Mute"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Recent Focus Session Logs */}
          <div className="p-6 rounded-2xl bg-[#0f1422] border border-[#1e293b] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">Focus Log</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{studySessions.length} sessions</span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {studySessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-xl bg-[#0a0d15] border border-[#1a2333] flex items-center justify-between text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{session.subjectOrTask}</p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(session.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 shrink-0">
                    +{session.durationMinutes}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
