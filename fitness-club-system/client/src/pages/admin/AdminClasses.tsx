import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';
import { format } from 'date-fns';

export default function AdminClasses() {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [formData, setFormData] = useState({
    classId: '',
    trainerId: '',
    roomId: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
    description: '',
  });

  const queryClient = useQueryClient();

  const { data: classes, isLoading, refetch } = useQuery({
    queryKey: ['admin-classes'],
    queryFn: async () => {
      const res = await api.get('/admin/classes');
      return res.data;
    },
  });

  const { data: rooms } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: async () => {
      const res = await api.get('/admin/rooms');
      return res.data;
    },
  });

  const { data: trainers } = useQuery({
    queryKey: ['admin-trainers'],
    queryFn: async () => {
      const res = await api.get('/admin/trainers');
      return res.data;
    },
  });

  const createSchedule = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/admin/classes/schedule', data);
      return res.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classes'] });
      await refetch(); // Force refetch to get latest data
      setShowScheduleForm(false);
      setFormData({
        classId: '',
        trainerId: '',
        roomId: '',
        scheduledDate: '',
        startTime: '',
        endTime: '',
        description: '',
      });
      alert('Class scheduled successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to schedule class');
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: async (scheduleId: number) => {
      await api.delete(`/admin/classes/schedule/${scheduleId}`);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classes'] });
      await refetch();
      alert('Class schedule deleted successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to delete class schedule');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSchedule.mutate({
      ...formData,
      classId: parseInt(formData.classId),
      trainerId: parseInt(formData.trainerId),
      roomId: parseInt(formData.roomId),
    });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
            <button
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showScheduleForm ? 'Cancel' : 'Schedule Class'}
            </button>
          </div>

          {showScheduleForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Class {formData.classId && (
                      <span className="text-blue-600 font-normal ml-2">
                        ({classes?.find((cls: any) => cls.classId.toString() === formData.classId)?.className})
                      </span>
                    )}
                  </label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Class</option>
                    {classes?.map((cls: any) => (
                      <option key={cls.classId} value={cls.classId}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Trainer {formData.trainerId && (
                      <span className="text-blue-600 font-normal ml-2">
                        ({trainers?.find((t: any) => t.trainerId.toString() === formData.trainerId)?.firstName} {trainers?.find((t: any) => t.trainerId.toString() === formData.trainerId)?.lastName})
                      </span>
                    )}
                  </label>
                  <select
                    required
                    value={formData.trainerId}
                    onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Trainer</option>
                    {trainers?.map((trainer: any) => (
                      <option key={trainer.trainerId} value={trainer.trainerId}>
                        {trainer.firstName} {trainer.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Room {formData.roomId && (
                      <span className="text-blue-600 font-normal ml-2">
                        ({rooms?.find((r: any) => r.roomId.toString() === formData.roomId)?.roomName} - {rooms?.find((r: any) => r.roomId.toString() === formData.roomId)?.roomType})
                      </span>
                    )}
                  </label>
                  <select
                    required
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Room</option>
                    {rooms?.map((room: any) => (
                      <option key={room.roomId} value={room.roomId}>
                        {room.roomName} ({room.roomType})
                      </option>
                    ))}
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Special Description/Notes (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Add any special notes or description for this scheduled class..."
                />
              </div>
              <button
                type="submit"
                disabled={createSchedule.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createSchedule.isPending ? 'Scheduling...' : 'Schedule Class'}
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12">Loading...</div>
            ) : classes?.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">No classes</div>
            ) : (
              classes?.map((groupClass: any) => (
                <div key={groupClass.classId} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{groupClass.className}</h3>
                  <p className="text-sm text-gray-600 mb-4">{groupClass.description}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-900">{groupClass.classType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-900">{groupClass.durationMinutes} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium text-gray-900">{groupClass.maxCapacity}</span>
                    </div>
                  </div>
                  {groupClass.classSchedules?.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-2 text-gray-900">Scheduled Sessions:</h4>
                      {groupClass.classSchedules.map((schedule: any) => {
                        // Format time from HH:MM string to 12-hour format
                        const formatTime = (timeValue: string | Date) => {
                          if (!timeValue) return 'N/A';
                          try {
                            let hours: number;
                            let minutes: number;
                            
                            if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}$/)) {
                              // Backend now returns HH:MM format
                              const [h, m] = timeValue.split(':').map(Number);
                              hours = h;
                              minutes = m;
                            } else if (timeValue instanceof Date) {
                              // Fallback for Date objects (shouldn't happen now, but just in case)
                              hours = timeValue.getUTCHours();
                              minutes = timeValue.getUTCMinutes();
                            } else if (typeof timeValue === 'string') {
                              // Try to parse as ISO string
                              const date = new Date(timeValue);
                              if (isNaN(date.getTime())) return 'Invalid';
                              hours = date.getUTCHours();
                              minutes = date.getUTCMinutes();
                            } else {
                              return 'Invalid';
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

                        // Format date safely
                        const formatDate = (dateValue: string | Date) => {
                          if (!dateValue) return 'N/A';
                          try {
                            const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
                            if (isNaN(date.getTime())) return 'Invalid';
                            return format(date, 'MMM dd, yyyy');
                          } catch {
                            return 'Invalid';
                          }
                        };

                        return (
                          <div key={schedule.scheduleId} className="text-xs text-gray-900 mb-2 flex justify-between items-center">
                            <div>
                              {formatDate(schedule.scheduledDate)} at {formatTime(schedule.startTime)}
                              {' '}({schedule.currentCapacity}/{groupClass.maxCapacity})
                              {schedule.notes && (
                                <span className="block text-gray-600 mt-1 italic">
                                  Note: {schedule.notes}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this class schedule?')) {
                                  deleteSchedule.mutate(schedule.scheduleId);
                                }
                              }}
                              className="ml-2 text-red-600 hover:text-red-700 text-xs"
                              disabled={deleteSchedule.isPending}
                            >
                              Delete
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

