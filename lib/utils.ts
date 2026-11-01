import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Attendance calculation helpers
 */
export function getAttendanceStats(attended: number, total: number, targetPercent: number = 75) {
  if (total <= 0) {
    return {
      percentage: 100,
      status: 'safe' as const,
      classesToAttend: 0,
      classesCanBunk: 0,
      isShortage: false,
    };
  }

  const percentage = (attended / total) * 100;
  const target = targetPercent / 100;

  let classesToAttend = 0;
  let classesCanBunk = 0;

  if (percentage < targetPercent) {
    // Need to attend consecutive classes:
    // (attended + x) / (total + x) >= target
    // attended + x >= target * total + target * x
    // x * (1 - target) >= target * total - attended
    // x >= (target * total - attended) / (1 - target)
    if (target < 1) {
      classesToAttend = Math.ceil((target * total - attended) / (1 - target));
    }
  } else {
    // Can safely miss x classes without dropping below target:
    // attended / (total + x) >= target
    // attended >= target * total + target * x
    // x <= (attended - target * total) / target
    if (target > 0) {
      classesCanBunk = Math.floor((attended - target * total) / target);
    }
  }

  return {
    percentage: Math.round(percentage * 10) / 10,
    status: percentage >= targetPercent ? ('safe' as const) : ('shortage' as const),
    classesToAttend: Math.max(0, classesToAttend),
    classesCanBunk: Math.max(0, classesCanBunk),
    isShortage: percentage < targetPercent,
  };
}

/**
 * SGPA & CGPA Calculation helpers
 */
export function calculateSgpa(courses: { credits: number; gradePoint: number }[]): number {
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
  if (totalCredits === 0) return 0;
  const totalPoints = courses.reduce((sum, c) => sum + (c.credits || 0) * (c.gradePoint || 0), 0);
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

export function calculateCgpa(semesters: { courses: { credits: number; gradePoint: number }[]; sgpa?: number }[]): {
  cgpa: number;
  totalCredits: number;
} {
  let totalCredits = 0;
  let totalGradePoints = 0;

  for (const sem of semesters) {
    for (const course of sem.courses) {
      const cred = course.credits || 0;
      const gp = course.gradePoint || 0;
      totalCredits += cred;
      totalGradePoints += cred * gp;
    }
  }

  if (totalCredits === 0) return { cgpa: 0, totalCredits: 0 };
  const cgpa = Math.round((totalGradePoints / totalCredits) * 100) / 100;
  return { cgpa, totalCredits };
}

/**
 * Calculate required GPA for remaining semesters to reach target CGPA
 */
export function predictRequiredGpa(
  currentCgpa: number,
  completedCredits: number,
  targetCgpa: number,
  remainingCredits: number
): { requiredGpa: number; isAchievable: boolean } {
  if (remainingCredits <= 0) return { requiredGpa: currentCgpa, isAchievable: true };
  const totalCredits = completedCredits + remainingCredits;
  const totalPointsNeeded = targetCgpa * totalCredits;
  const currentPoints = currentCgpa * completedCredits;
  const remainingPointsNeeded = totalPointsNeeded - currentPoints;
  const requiredGpa = Math.round((remainingPointsNeeded / remainingCredits) * 100) / 100;

  return {
    requiredGpa,
    isAchievable: requiredGpa <= 10.0 && requiredGpa >= 0,
  };
}

/**
 * Format minutes into HH:MM or mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getTodayDayName(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
}
