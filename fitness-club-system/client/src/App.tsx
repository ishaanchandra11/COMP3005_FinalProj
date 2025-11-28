import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from './lib/auth';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';

// Member Pages
import MemberDashboard from './pages/member/MemberDashboard';
import MemberProfile from './pages/member/MemberProfile';
import HealthMetrics from './pages/member/HealthMetrics';
import FitnessGoals from './pages/member/FitnessGoals';
import PTSessions from './pages/member/PTSessions';
import Classes from './pages/member/Classes';
import MemberBilling from './pages/member/MemberBilling';

// Trainer Pages
import TrainerSchedule from './pages/trainer/TrainerSchedule';
import TrainerAvailability from './pages/trainer/TrainerAvailability';
import TrainerMembers from './pages/trainer/TrainerMembers';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRooms from './pages/admin/AdminRooms';
import AdminEquipment from './pages/admin/AdminEquipment';
import AdminClasses from './pages/admin/AdminClasses';
import AdminBilling from './pages/admin/AdminBilling';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Member Routes */}
          <Route path="/member/dashboard" element={<MemberDashboard />} />
          <Route path="/member/profile" element={<MemberProfile />} />
          <Route path="/member/health" element={<HealthMetrics />} />
          <Route path="/member/goals" element={<FitnessGoals />} />
          <Route path="/member/sessions" element={<PTSessions />} />
          <Route path="/member/classes" element={<Classes />} />
          <Route path="/member/billing" element={<MemberBilling />} />
          
          {/* Trainer Routes */}
          <Route path="/trainer/schedule" element={<TrainerSchedule />} />
          <Route path="/trainer/availability" element={<TrainerAvailability />} />
          <Route path="/trainer/members" element={<TrainerMembers />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/rooms" element={<AdminRooms />} />
          <Route path="/admin/equipment" element={<AdminEquipment />} />
          <Route path="/admin/classes" element={<AdminClasses />} />
          <Route path="/admin/billing" element={<AdminBilling />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
