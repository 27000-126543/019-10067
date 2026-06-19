import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import EventSelectPage from '@/pages/EventSelectPage';
import TimelinePage from '@/pages/TimelinePage';
import NetworkPage from '@/pages/NetworkPage';
import TurningPointPage from '@/pages/TurningPointPage';
import ResultPage from '@/pages/ResultPage';
import TeacherHomePage from '@/pages/TeacherHomePage';
import TeacherDashboard from '@/pages/TeacherDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/student" element={<EventSelectPage />} />
        <Route path="/student/timeline/:eventId" element={<TimelinePage />} />
        <Route path="/student/network/:eventId" element={<NetworkPage />} />
        <Route path="/student/turning/:eventId" element={<TurningPointPage />} />
        <Route path="/student/result/:eventId" element={<ResultPage />} />
        <Route path="/teacher" element={<TeacherHomePage />} />
        <Route path="/teacher/dashboard/:eventId" element={<TeacherDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
