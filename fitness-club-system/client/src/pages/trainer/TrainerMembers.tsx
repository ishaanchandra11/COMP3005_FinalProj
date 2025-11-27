import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';

export default function TrainerMembers() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: members, isLoading } = useQuery({
    queryKey: ['trainer-members', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const res = await api.get(`/trainers/members/search?q=${encodeURIComponent(searchQuery)}`);
      return res.data;
    },
    enabled: searchQuery.length >= 2,
  });

  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  const { data: memberDetails } = useQuery({
    queryKey: ['member-details', selectedMember],
    queryFn: async () => {
      if (!selectedMember) return null;
      const res = await api.get(`/trainers/members/${selectedMember}`);
      return res.data;
    },
    enabled: !!selectedMember,
  });

  return (
    <ProtectedRoute allowedRoles={['trainer']}>
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Member Search</h1>

          <div>
            <input
              type="text"
              placeholder="Search members by name or email (min 2 characters)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Search Results</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {searchQuery.length < 2 ? (
                  <div className="p-6 text-center text-gray-500">
                    Enter at least 2 characters to search
                  </div>
                ) : isLoading ? (
                  <div className="p-6 text-center">Loading...</div>
                ) : members?.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No members found</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {members?.map((member: any) => (
                        <tr key={member.memberId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {member.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => setSelectedMember(member.memberId)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {selectedMember && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Member Details</h2>
                {memberDetails ? (
                  <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {memberDetails.firstName} {memberDetails.lastName}
                      </h3>
                      {memberDetails.email && (
                        <p className="text-sm text-gray-600">{memberDetails.email}</p>
                      )}
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="capitalize">Status: </span>
                        <span className={`font-medium ${
                          memberDetails.membershipStatus === 'active' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {memberDetails.membershipStatus || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    {memberDetails.latestMetric ? (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Latest Health Metric</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Weight:</span>
                            <span className="ml-2 font-medium">
                              {memberDetails.latestMetric.weight ? `${memberDetails.latestMetric.weight} kg` : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">BMI:</span>
                            <span className="ml-2 font-medium">
                              {memberDetails.latestMetric.bmi ? Number(memberDetails.latestMetric.bmi).toFixed(1) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500">No health metrics recorded yet</p>
                      </div>
                    )}
                    
                    {memberDetails.activeGoals && memberDetails.activeGoals.length > 0 ? (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Active Goals</h4>
                        <ul className="space-y-1 text-sm">
                          {memberDetails.activeGoals.map((goal: any) => (
                            <li key={goal.goalId} className="text-gray-600">
                              <span className="capitalize">{goal.goalType.replace('_', ' ')}</span>: {goal.currentValue || 'N/A'} / {goal.targetValue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500">No active goals</p>
                      </div>
                    )}
                    
                    {memberDetails.recentClasses && memberDetails.recentClasses.length > 0 ? (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Recent Class Attendance</h4>
                        <ul className="space-y-1 text-sm">
                          {memberDetails.recentClasses.map((classItem: any, index: number) => (
                            <li key={index} className="text-gray-600">
                              {classItem.className} - {new Date(classItem.date).toLocaleDateString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500">No recent class attendance</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                    Loading details...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

