import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleRoutes = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'member':
        return [
          { path: '/member/dashboard', label: 'Dashboard' },
          { path: '/member/profile', label: 'Profile' },
          { path: '/member/health', label: 'Health Metrics' },
          { path: '/member/goals', label: 'Fitness Goals' },
          { path: '/member/sessions', label: 'PT Sessions' },
          { path: '/member/classes', label: 'Classes' },
          { path: '/member/billing', label: 'Billing' },
        ];
      case 'trainer':
        return [
          { path: '/trainer/schedule', label: 'Schedule' },
          { path: '/trainer/availability', label: 'Availability' },
          { path: '/trainer/members', label: 'Members' },
        ];
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard' },
          { path: '/admin/rooms', label: 'Rooms' },
          { path: '/admin/equipment', label: 'Equipment' },
          { path: '/admin/classes', label: 'Classes' },
          { path: '/admin/billing', label: 'Billing' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-2 py-2 text-xl font-bold text-blue-600">
                Fitness Club
              </Link>
              {user && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {getRoleRoutes().map((route) => (
                    <Link
                      key={route.path}
                      to={route.path}
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600"
                    >
                      {route.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {user.profile?.firstName || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

