import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';
import { format } from 'date-fns';

export default function TrainerSchedule() {
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['trainer-schedule'],
    queryFn: async () => {
      const res = await api.get('/trainers/schedule');
      return res.data;
    },
  });

  return (
    <ProtectedRoute allowedRoles={['trainer']}>
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Personal Training Sessions</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">Loading...</td>
                      </tr>
                    ) : schedule?.ptSessions?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No PT sessions</td>
                      </tr>
                    ) : (
                      schedule?.ptSessions?.map((session: any) => {
                        const formatDate = (dateValue: string | Date) => {
                          if (!dateValue) return 'N/A';
                          try {
                            const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
                            if (isNaN(date.getTime())) return 'Invalid Date';
                            return format(date, 'MMM dd, yyyy');
                          } catch {
                            return 'Invalid Date';
                          }
                        };

                        const formatTime = (timeStr: string) => {
                          if (!timeStr) return 'N/A';
                          try {
                            // Backend returns "HH:MM" format, convert to 12-hour format
                            const [hours, minutes] = timeStr.split(':');
                            const hour = parseInt(hours, 10);
                            const min = minutes || '00';
                            const period = hour >= 12 ? 'PM' : 'AM';
                            const hour12 = hour % 12 || 12;
                            return `${hour12}:${min} ${period}`;
                          } catch {
                            return timeStr; // Fallback to original string
                          }
                        };

                        return (
                          <tr key={session.id || session.sessionId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(session.date || session.scheduledDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {session.member || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                session.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {session.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Group Classes</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">Loading...</td>
                      </tr>
                    ) : schedule?.classes?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No classes</td>
                      </tr>
                    ) : (
                      schedule?.classes?.map((scheduleItem: any) => {
                        const formatDate = (dateValue: string | Date) => {
                          if (!dateValue) return 'N/A';
                          try {
                            const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
                            if (isNaN(date.getTime())) return 'Invalid Date';
                            return format(date, 'MMM dd, yyyy');
                          } catch {
                            return 'Invalid Date';
                          }
                        };

                        const formatTime = (timeStr: string) => {
                          if (!timeStr) return 'N/A';
                          try {
                            // Backend returns "HH:MM" format, convert to 12-hour format
                            const [hours, minutes] = timeStr.split(':');
                            const hour = parseInt(hours, 10);
                            const min = minutes || '00';
                            const period = hour >= 12 ? 'PM' : 'AM';
                            const hour12 = hour % 12 || 12;
                            return `${hour12}:${min} ${period}`;
                          } catch {
                            return timeStr; // Fallback to original string
                          }
                        };

                        return (
                          <tr key={scheduleItem.id || scheduleItem.scheduleId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(scheduleItem.date || scheduleItem.scheduledDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatTime(scheduleItem.startTime)} - {formatTime(scheduleItem.endTime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {scheduleItem.className || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {scheduleItem.capacity || 'N/A'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

