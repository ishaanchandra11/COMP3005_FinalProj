import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';
import { format } from 'date-fns';

export default function HealthMetrics() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    bodyFatPercentage: '',
    muscleMass: '',
    restingHeartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    notes: '',
  });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['health-metrics'],
    queryFn: async () => {
      const res = await api.get('/members/health-metrics?limit=20');
      return res.data;
    },
  });

  const addMetric = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/members/health-metrics', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-metrics'] });
      setShowAddForm(false);
      setErrorMessages([]);
      setFormData({
        weight: '',
        height: '',
        bodyFatPercentage: '',
        muscleMass: '',
        restingHeartRate: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        notes: '',
      });
    },
    onError: (error: any) => {
      const errors: string[] = [];
      const errorData = error.response?.data;
      
      // Field name mapping for user-friendly display
      const fieldNameMap: Record<string, string> = {
        weight: 'Weight',
        height: 'Height',
        bodyFatPercentage: 'Body Fat Percentage',
        muscleMass: 'Muscle Mass',
        restingHeartRate: 'Resting Heart Rate',
        bloodPressureSystolic: 'Blood Pressure (Systolic)',
        bloodPressureDiastolic: 'Blood Pressure (Diastolic)',
      };
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Handle Zod validation errors
        errorData.errors.forEach((err: any) => {
          const fieldName = fieldNameMap[err.field] || err.field || 'Field';
          // Make error messages more user-friendly
          let message = err.message;
          if (message.includes('greater than or equal to')) {
            message = message.replace(/Number must be greater than or equal to (\d+)/, 'Must be at least $1');
          } else if (message.includes('less than or equal to')) {
            message = message.replace(/Number must be less than or equal to (\d+)/, 'Must be at most $1');
          }
          errors.push(`${fieldName}: ${message}`);
        });
      } else if (errorData?.message) {
        // Handle single error message
        errors.push(errorData.message);
      } else if (errorData?.error) {
        // Handle error object
        errors.push(errorData.error);
      } else {
        // Fallback error
        errors.push('Failed to add health metric. Please check your input and try again.');
      }
      
      setErrorMessages(errors);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        payload[key] = key.includes('Percentage') || key.includes('Rate') || key.includes('Pressure')
          ? parseFloat(value)
          : value;
      }
    });
    addMetric.mutate(payload);
  };

  return (
    <ProtectedRoute allowedRoles={['member']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Health Metrics</h1>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setErrorMessages([]);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showAddForm ? 'Cancel' : 'Add Metric'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
              {errorMessages.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  <p className="font-semibold mb-2">Please fix the following errors:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {errorMessages.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bodyFatPercentage}
                    onChange={(e) => setFormData({ ...formData, bodyFatPercentage: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Muscle Mass (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.muscleMass}
                    onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resting Heart Rate</label>
                  <input
                    type="number"
                    value={formData.restingHeartRate}
                    onChange={(e) => setFormData({ ...formData, restingHeartRate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Pressure (Systolic/Diastolic)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Systolic"
                      value={formData.bloodPressureSystolic}
                      onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Diastolic"
                      value={formData.bloodPressureDiastolic}
                      onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
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
                disabled={addMetric.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {addMetric.isPending ? 'Adding...' : 'Add Metric'}
              </button>
            </form>
          )}

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Height</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BMI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Body Fat %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Muscle Mass</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heart Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Pressure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center">Loading...</td>
                  </tr>
                ) : metrics?.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">No metrics recorded</td>
                  </tr>
                ) : (
                  metrics?.map((metric: any) => (
                    <tr key={metric.metricId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(metric.recordedAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.weight ? `${metric.weight} kg` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.height ? `${metric.height} cm` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.bmi != null ? Number(metric.bmi).toFixed(1) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.bodyFatPercentage != null ? `${Number(metric.bodyFatPercentage).toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.muscleMass ? `${metric.muscleMass} kg` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.restingHeartRate ? `${metric.restingHeartRate} bpm` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.bloodPressureSystolic && metric.bloodPressureDiastolic
                          ? `${metric.bloodPressureSystolic}/${metric.bloodPressureDiastolic} mmHg`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        {metric.notes ? (
                          <span className="truncate block" title={metric.notes}>
                            {metric.notes}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

