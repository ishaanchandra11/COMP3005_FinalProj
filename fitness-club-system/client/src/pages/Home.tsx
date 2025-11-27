import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Layout from '../components/Layout';

export default function Home() {
  const { user, loadUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'member':
          navigate('/member/dashboard');
          break;
        case 'trainer':
          navigate('/trainer/schedule');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
      }
    }
  }, [user, navigate]);

  return (
    <Layout>
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Fitness Club Management System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage your fitness journey with ease
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Login
          </a>
          <a
            href="/register"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Register
          </a>
        </div>
      </div>
    </Layout>
  );
}

