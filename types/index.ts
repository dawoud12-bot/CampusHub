export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Subject {
  id: string;
  name: string;
  code: string;
  instructor: string;
  color: string;
  credits: number;
}

export interface AttendanceHistory {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'cancelled';
  note?: string;
}

export interface AttendanceItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  attended: number;
  total: number;
  targetPercentage: number;
  color: string;
  history: AttendanceHistory[];
}

export interface CourseGrade {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: string; // O, A+, A, B+, B, C, P, F
  gradePoint: number;
}

export interface SemesterRecord {
  id: string;
  semesterNumber: number;
  name: string;
  courses: CourseGrade[];
  sgpa?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subjectCode: string;
  subjectName: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  tags: string[];
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // '09:00'
  endTime: string;   // '10:00'
  subjectCode: string;
  subjectName: string;
  room: string;
  instructor: string;
  type: 'Lecture' | 'Lab' | 'Tutorial' | 'Seminar';
  color: string;
}

export interface StudySession {
  id: string;
  timestamp: string;
  durationMinutes: number;
  subjectOrTask: string;
  mode: 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch' | 'custom';
}

export interface UserProfile {
  name: string;
  email: string;
  studentId: string;
  university: string;
  department: string;
  semester: string;
  targetCgpa: number;
}
