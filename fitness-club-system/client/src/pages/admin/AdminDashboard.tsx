import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Members</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {dashboard?.totalMembers || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Trainers</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {dashboard?.totalTrainers || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Active Classes</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {dashboard?.activeClasses || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Pending Bills</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {dashboard?.pendingBills || 0}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

