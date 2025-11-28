import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';
import { format } from 'date-fns';

export default function FitnessGoals() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    goalType: 'weight_loss',
    targetValue: '',
    targetDate: '',
    currentValue: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['fitness-goals'],
    queryFn: async () => {
      const res = await api.get('/members/goals');
      return res.data;
    },
  });

  const createGoal = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/members/goals', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fitness-goals'] });
      setShowAddForm(false);
      setFormData({
        goalType: 'weight_loss',
        targetValue: '',
        targetDate: '',
        currentValue: '',
        notes: '',
      });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ goalId, data }: { goalId: number; data: any }) => {
      const res = await api.put(`/members/goals/${goalId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fitness-goals'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGoal.mutate({
      ...formData,
      targetValue: parseFloat(formData.targetValue),
      currentValue: parseFloat(formData.currentValue),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'achieved':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['member']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Fitness Goals</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showAddForm ? 'Cancel' : 'New Goal'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Goal Type</label>
                <select
                  value={formData.goalType}
                  onChange={(e) => setFormData({ ...formData, goalType: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Value</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Value</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Date</label>
                <input
                  type="date"
                  required
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={createGoal.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createGoal.isPending ? 'Creating...' : 'Create Goal'}
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12">Loading...</div>
            ) : goals?.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">No goals set</div>
            ) : (
              goals?.map((goal: any) => (
                <div key={goal.goalId} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold capitalize">{goal.goalType.replace('_', ' ')}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-semibold text-gray-900">{goal.currentValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-semibold text-gray-900">{goal.targetValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Date:</span>
                      <span className="font-semibold text-gray-900">
                        {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {goal.notes && (
                      <p className="text-sm text-gray-600 mt-2">{goal.notes}</p>
                    )}
                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={() => {
                          const newStatus = goal.status === 'active' ? 'paused' : 'active';
                          updateGoal.mutate({ goalId: goal.goalId, data: { status: newStatus } });
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {goal.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

