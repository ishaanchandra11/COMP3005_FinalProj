import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';

export default function TrainerAvailability() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 'MON',
    startTime: '',
    endTime: '',
    isRecurring: true,
  });

  const queryClient = useQueryClient();

  const { data: availability, isLoading } = useQuery({
    queryKey: ['trainer-availability'],
    queryFn: async () => {
      const res = await api.get('/trainers/availability');
      return res.data;
    },
  });

  const addAvailability = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/trainers/availability', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability'] });
      setShowAddForm(false);
      setFormData({
        dayOfWeek: 'MON',
        startTime: '',
        endTime: '',
        isRecurring: true,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to add availability. Please check your input.';
      alert(errorMessage);
    },
  });

  const deleteAvailability = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/trainers/availability/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-availability'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that end time is after start time
    if (formData.startTime && formData.endTime) {
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;
      
      if (endTotal <= startTotal) {
        alert('End time must be after start time. Please select a valid time range.');
        return;
      }
    }
    
    addAvailability.mutate(formData);
  };

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dayNames = {
    MON: 'Monday',
    TUE: 'Tuesday',
    WED: 'Wednesday',
    THU: 'Thursday',
    FRI: 'Friday',
    SAT: 'Saturday',
    SUN: 'Sunday',
  };

  return (
    <ProtectedRoute allowedRoles={['trainer']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Availability</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showAddForm ? 'Cancel' : 'Add Availability'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Day of Week</label>
                  <select
                    required
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {dayNames[day as keyof typeof dayNames]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Recurring weekly</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={addAvailability.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {addAvailability.isPending ? 'Adding...' : 'Add Availability'}
              </button>
            </form>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recurring</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">Loading...</td>
                  </tr>
                ) : availability?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No availability set</td>
                  </tr>
                ) : (
                  availability?.map((slot: any) => {
                    // Format time from Date object or string to 12-hour format with AM/PM
                    const formatTimeDisplay = (timeValue: string | Date) => {
                      if (!timeValue) return 'N/A';
                      try {
                        let hours: number;
                        let minutes: number;
                        
                        // If it's already a string in HH:MM format
                        if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}$/)) {
                          const [h, m] = timeValue.split(':').map(Number);
                          hours = h;
                          minutes = m;
                        } else {
                          // If it's a Date object or ISO string, extract the time
                          // Backend now stores times using Date.UTC(), so we need to use UTC methods
                          const date = timeValue instanceof Date ? timeValue : new Date(timeValue);
                          if (isNaN(date.getTime())) return 'Invalid';
                          hours = date.getUTCHours(); // Use UTC methods since backend stores with Date.UTC()
                          minutes = date.getUTCMinutes();
                        }
                        
                        // Convert to 12-hour format
                        const period = hours >= 12 ? 'PM' : 'AM';
                        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                        const displayMinutes = minutes.toString().padStart(2, '0');
                        
                        return `${displayHours}:${displayMinutes} ${period}`;
                      } catch {
                        return 'Invalid';
                      }
                    };

                    return (
                      <tr key={slot.availabilityId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dayNames[slot.dayOfWeek as keyof typeof dayNames]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {slot.isRecurring ? 'Yes' : 'No'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => deleteAvailability.mutate(slot.availabilityId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

