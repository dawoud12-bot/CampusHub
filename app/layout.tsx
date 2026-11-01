import type { Metadata } from 'next';
import './globals.css';
import { CampusProvider } from '@/context/CampusContext';
import { ToastContainer } from '@/components/ToastContainer';

export const metadata: Metadata = {
  title: 'CampusHub – Smart College Life Assistant',
  description:
    'Modern, premium SaaS dashboard for college students: Attendance Intelligence & Calculator, CGPA Predictor, Task Manager, Weekly Timetable, and Focus Room.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090b10] text-[#f1f5f9] antialiased min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200">
        <CampusProvider>
          {children}
          <ToastContainer />
        </CampusProvider>
      </body>
    </html>
  );
}
