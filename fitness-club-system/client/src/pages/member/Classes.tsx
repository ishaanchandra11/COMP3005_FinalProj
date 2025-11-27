import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';
import { format } from 'date-fns';

export default function Classes() {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Helper function to format time (same as PT Sessions)
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
            return 'Invalid Time';
          }
          hours = dateObj.getUTCHours();
          minutes = dateObj.getUTCMinutes();
        } else {
          let timeStr = timeValue.trim();
          if (timeStr.includes('.')) {
            timeStr = timeStr.split('.')[0];
          }
          const timeParts = timeStr.split(':');
          if (timeParts.length >= 2) {
            hours = parseInt(timeParts[0], 10);
            minutes = parseInt(timeParts[1], 10);
            if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
              return 'Invalid Time';
            }
          } else {
            return 'Invalid Time';
          }
        }
      } else {
        return 'Invalid Time';
      }
      
      const date = new Date(2000, 0, 1, hours, minutes, 0);
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error, timeValue);
      return 'Invalid Time';
    }
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

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['class-registrations'],
    queryFn: async () => {
      const res = await api.get('/members/classes/registrations');
      return res.data;
    },
  });

  const { data: availableClasses, isLoading: isLoadingClasses, error: classesError } = useQuery({
    queryKey: ['available-classes'],
    queryFn: async () => {
      const res = await api.get('/members/classes');
      return res.data || [];
    },
  });

  const registerForClass = useMutation({
    mutationFn: async (scheduleId: number) => {
      const res = await api.post(`/members/classes/${scheduleId}/register`);
      return res.data;
    },
    onSuccess: () => {
      setErrorMessages([]);
      queryClient.invalidateQueries({ queryKey: ['class-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['available-classes'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to register for class';
      setErrorMessages([errorMessage]);
    },
  });

  const cancelRegistration = useMutation({
    mutationFn: async (registrationId: number) => {
      const res = await api.post(`/members/classes/registrations/${registrationId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      setErrorMessages([]);
      queryClient.invalidateQueries({ queryKey: ['class-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['available-classes'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to cancel registration';
      alert(errorMessage);
    },
  });

  return (
    <ProtectedRoute allowedRoles={['member']}>
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Group Classes</h1>

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

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">My Registrations</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trainer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                    </tr>
                  ) : registrations?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No registrations</td>
                    </tr>
                  ) : (
                    registrations?.map((reg: any) => (
                      <tr key={reg.registrationId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {reg.schedule?.groupClass?.className}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(reg.schedule?.scheduledDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(reg.schedule?.startTime)} - {formatTime(reg.schedule?.endTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {reg.schedule?.trainer?.firstName} {reg.schedule?.trainer?.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            reg.waitlistPosition ? 'bg-yellow-100 text-yellow-800' :
                            reg.attendance_status === 'registered' ? 'bg-green-100 text-green-800' :
                            reg.attendance_status === 'attended' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reg.waitlistPosition ? `Waitlisted (#${reg.waitlistPosition})` : reg.attendance_status || 'registered'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {reg.attendance_status === 'registered' && (
                            <button
                              onClick={() => cancelRegistration.mutate(reg.registrationId)}
                              disabled={cancelRegistration.isPending}
                              className="text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              {cancelRegistration.isPending ? 'Cancelling...' : 'Cancel'}
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

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Available Classes</h2>
            {isLoadingClasses ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                Loading available classes...
              </div>
            ) : classesError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                Error loading classes: {classesError instanceof Error ? classesError.message : 'Unknown error'}
              </div>
            ) : !availableClasses || availableClasses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                No available classes at this time. Please check back later.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableClasses.map((groupClass: any) => (
                  <div key={groupClass.classId} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">{groupClass.className}</h3>
                    {groupClass.description && (
                      <p className="text-sm text-gray-600 mb-4">{groupClass.description}</p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium text-gray-900">{groupClass.classType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">{groupClass.durationMinutes} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <span className="font-medium text-gray-900 capitalize">{groupClass.difficultyLevel}</span>
                      </div>
                    </div>
                    {groupClass.classSchedules?.length > 0 ? (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2 text-gray-900">Upcoming Sessions:</h4>
                        {groupClass.classSchedules.slice(0, 3).map((schedule: any) => (
                          <div key={schedule.scheduleId} className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded">
                            <div className="text-xs">
                              <div className="font-medium text-gray-900">{formatDate(schedule.scheduledDate)}</div>
                              <div className="text-gray-600">
                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                              </div>
                              {schedule.trainer && (
                                <div className="text-gray-600">
                                  Trainer: {schedule.trainer.firstName} {schedule.trainer.lastName}
                                </div>
                              )}
                              {schedule.room && (
                                <div className="text-gray-600">
                                  Room: {schedule.room.roomName}
                                </div>
                              )}
                              {schedule.availableSpots !== undefined && (
                                <div className="text-gray-600">
                                  {schedule.availableSpots > 0 ? `${schedule.availableSpots} spots available` : 'Full'}
                                </div>
                              )}
                            </div>
                            {schedule.isRegistered ? (
                              <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded font-medium">
                                Registered
                              </span>
                            ) : (
                              <button
                                onClick={() => registerForClass.mutate(schedule.scheduleId)}
                                disabled={registerForClass.isPending || schedule.availableSpots === 0}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {registerForClass.isPending ? 'Registering...' : 'Register'}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                        No upcoming sessions scheduled
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

