import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';

export default function MemberDashboard() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['member-dashboard'],
    queryFn: async () => {
      const res = await api.get('/members/dashboard');
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
    <ProtectedRoute allowedRoles={['member']}>
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Active Goals</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {dashboard?.activeGoalsCount || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Upcoming PT Sessions</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {dashboard?.upcomingPTSessions || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Upcoming Classes</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {dashboard?.upcomingClasses || 0}
              </p>
            </div>
            <Link to="/member/billing" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-sm font-medium text-gray-500">Outstanding Balance</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">
                ${dashboard?.outstandingBalance?.toFixed(2) || '0.00'}
              </p>
              {dashboard?.outstandingBalance > 0 && (
                <p className="text-xs text-blue-600 mt-2">Click to view and pay →</p>
              )}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Health Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Latest Weight:</span>
                  <span className="font-semibold text-gray-900">
                    {dashboard?.latestWeight ? `${dashboard.latestWeight} kg` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">BMI:</span>
                  <span className="font-semibold text-gray-900">
                    {dashboard?.latestBmi != null ? Number(dashboard.latestBmi).toFixed(1) : 'N/A'}
                  </span>
                </div>
                {dashboard?.weightChange30Days !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">30-Day Change:</span>
                    <span className={`font-semibold ${Number(dashboard.weightChange30Days) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {Number(dashboard.weightChange30Days) > 0 ? '+' : ''}
                      {Number(dashboard.weightChange30Days).toFixed(1)} kg
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Metric Date:</span>
                  <span className="font-semibold text-gray-900">
                    {dashboard?.lastMetricDate
                      ? new Date(dashboard.lastMetricDate).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Activity Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Classes Attended:</span>
                  <span className="font-semibold text-gray-900">{dashboard?.totalClassesAttended || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total PT Sessions:</span>
                  <span className="font-semibold text-gray-900">{dashboard?.totalPTSessions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membership Status:</span>
                  <span className={`font-semibold capitalize ${
                    dashboard?.membershipStatus === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dashboard?.membershipStatus || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

