import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';
import { format } from 'date-fns';

export default function PTSessions() {
  const [showBookForm, setShowBookForm] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    trainerId: '',
    roomId: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
  });

  const queryClient = useQueryClient();

  const formatRoomType = (roomType: string) => {
    return roomType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) {
      return 'N/A';
    }
    
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
      return 'Invalid Date';
    }
  };

  const formatTime = (timeValue: string | Date | null | undefined) => {
    if (!timeValue) {
      return 'N/A';
    }
    
    try {
      let hours: number;
      let minutes: number;
      
      if (timeValue instanceof Date) {
        if (isNaN(timeValue.getTime())) {
          return 'Invalid Time';
        }
        hours = timeValue.getUTCHours();
        minutes = timeValue.getUTCMinutes();
      } else if (typeof timeValue === 'string') {
        if (timeValue.includes('T')) {
          const dateObj = new Date(timeValue);
          if (isNaN(dateObj.getTime())) {
            console.error('Failed to parse ISO time string:', timeValue);
            return 'Invalid Time';
          }
          // Extract time from ISO string - use UTC to avoid timezone shifts
          hours = dateObj.getUTCHours();
          minutes = dateObj.getUTCMinutes();
        } else {
          // Handle PostgreSQL TIME format directly (HH:MM:SS or HH:MM:SS.microseconds)
          let timeStr = timeValue.trim();
          
          // Remove microseconds if present
          if (timeStr.includes('.')) {
            timeStr = timeStr.split('.')[0];
          }
          
          // Parse HH:MM:SS or HH:MM format
          const timeParts = timeStr.split(':');
          if (timeParts.length >= 2) {
            hours = parseInt(timeParts[0], 10);
            minutes = parseInt(timeParts[1], 10);
            
            if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
              console.error('Invalid time values:', { hours, minutes, original: timeValue });
              return 'Invalid Time';
            }
          } else {
            console.error('Invalid time format - not enough parts:', timeValue);
            return 'Invalid Time';
          }
        }
      } else {
        console.error('Unexpected time value type:', typeof timeValue, timeValue);
        return 'Invalid Time';
      }
      
      // Create a date for formatting (date-fns format function needs a Date object)
      const date = new Date(2000, 0, 1, hours, minutes, 0);
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error, 'Value:', timeValue, 'Type:', typeof timeValue);
      return 'Invalid Time';
    }
  };

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['pt-sessions'],
    queryFn: async () => {
      const res = await api.get('/members/pt-sessions/upcoming');
      return res.data;
    },
  });

  const { data: trainers } = useQuery({
    queryKey: ['trainers-list'],
    queryFn: async () => {
      // Get trainers from search endpoint (trainers can search members, so we can use a workaround)
      // Or we could add a /trainers endpoint, but for now let's use a placeholder
      try {
        const res = await api.get('/trainers/members/search?q=');
        return [];
      } catch {
        return [];
      }
    },
    enabled: false, // Disabled for now - would need a trainers list endpoint
  });

  const { data: rooms, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['rooms-list'],
    queryFn: async () => {
      const res = await api.get('/members/rooms');
      return res.data || [];
    },
    enabled: showBookForm,
  });

  const bookSession = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/members/pt-sessions', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-sessions'] });
      setShowBookForm(false);
      setErrorMessages([]);
      setFormData({
        trainerId: '',
        roomId: '',
        scheduledDate: '',
        startTime: '',
        endTime: '',
      });
    },
    onError: (error: any) => {
      const errors: string[] = [];
      const errorData = error.response?.data;
      
      // Field name mapping for user-friendly display
      const fieldNameMap: Record<string, string> = {
        trainerId: 'Trainer',
        roomId: 'Room',
        scheduledDate: 'Date',
        startTime: 'Start Time',
        endTime: 'End Time',
      };
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Handle Zod validation errors - deduplicate by message
        const seenMessages = new Set<string>();
        errorData.errors.forEach((err: any) => {
          const fieldName = fieldNameMap[err.field] || err.field || 'Field';
          const errorMessage = `${fieldName}: ${err.message}`;
          // Only add unique error messages
          if (!seenMessages.has(errorMessage)) {
            seenMessages.add(errorMessage);
            errors.push(errorMessage);
          }
        });
      } else if (errorData?.message) {
        // Handle single error message
        errors.push(errorData.message);
      } else if (errorData?.error) {
        // Handle error object
        errors.push(errorData.error);
      } else {
        // Fallback error
        errors.push('Failed to book session. Please check your input and try again.');
      }
      
      setErrorMessages(errors);
    },
  });

  const cancelSession = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await api.post(`/members/pt-sessions/${sessionId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-sessions'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to cancel session';
      alert(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookSession.mutate({
      ...formData,
      trainerId: parseInt(formData.trainerId),
      roomId: formData.roomId ? parseInt(formData.roomId) : undefined,
    });
  };

  return (
    <ProtectedRoute allowedRoles={['member']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Personal Training Sessions</h1>
            <button
              onClick={() => {
                setShowBookForm(!showBookForm);
                setErrorMessages([]);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showBookForm ? 'Cancel' : 'Book Session'}
            </button>
          </div>

          {showBookForm && (
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
                  <label className="block text-sm font-medium text-gray-700">Trainer</label>
                  <select
                    required
                    value={formData.trainerId}
                    onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Trainer</option>
                    {/* Note: Would need a trainers list endpoint - for now manual entry */}
                    <option value="1">Alex Martinez - Strength, HIIT</option>
                    <option value="2">Maria Rodriguez - Yoga, Pilates</option>
                    <option value="3">James Wilson - Cardio, Endurance</option>
                    <option value="4">Sophia Chen - HIIT, Strength</option>
                    <option value="5">Michael Thompson - Strength, Bodybuilding</option>
                    <option value="6">Emily Johnson - Dance, Cardio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room (Optional)</label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={isLoadingRooms}
                  >
                    <option value="">Select Room (Optional)</option>
                    {isLoadingRooms ? (
                      <option disabled>Loading rooms...</option>
                    ) : rooms && rooms.length > 0 ? (
                      rooms.map((room: any) => (
                        <option key={room.roomId} value={room.roomId}>
                          {room.roomName} ({formatRoomType(room.roomType)})
                        </option>
                      ))
                    ) : (
                      <option disabled>No rooms available</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
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
              <button
                type="submit"
                disabled={bookSession.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {bookSession.isPending ? 'Booking...' : 'Book Session'}
              </button>
            </form>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trainer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                  </tr>
                ) : sessions?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No upcoming sessions</td>
                  </tr>
                ) : (
                  sessions?.map((session: any) => (
                    <tr key={session.sessionId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(session.scheduledDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.trainer?.firstName} {session.trainer?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.room?.roomName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          session.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {session.status === 'scheduled' && (
                          <button
                            onClick={() => cancelSession.mutate(session.sessionId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Cancel
                          </button>
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

