import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';

export default function AdminEquipment() {
  const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [formData, setFormData] = useState({
    issueDescription: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });
  const [updateFormData, setUpdateFormData] = useState({
    status: 'in_progress' as 'in_progress' | 'resolved' | 'cancelled',
    resolutionNotes: '',
    cost: '',
  });

  const queryClient = useQueryClient();

  const { data: equipment, isLoading, refetch: refetchEquipment } = useQuery({
    queryKey: ['admin-equipment'],
    queryFn: async () => {
      const res = await api.get('/admin/equipment');
      return res.data;
    },
  });

  const { data: maintenanceLogs, refetch: refetchLogs } = useQuery({
    queryKey: ['admin-maintenance-logs'],
    queryFn: async () => {
      const res = await api.get('/admin/maintenance');
      return res.data;
    },
  });

  const reportMaintenance = useMutation({
    mutationFn: async ({ equipmentId, data }: { equipmentId: number; data: any }) => {
      const res = await api.post(`/admin/equipment/${equipmentId}/maintenance`, data);
      return res.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maintenance-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-equipment'] });
      await refetchLogs();
      await refetchEquipment();
      setSelectedEquipment(null);
      setFormData({ issueDescription: '', priority: 'medium' });
      alert('Maintenance issue reported successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to report maintenance issue');
    },
  });

  const updateMaintenanceStatus = useMutation({
    mutationFn: async ({ logId, data }: { logId: number; data: any }) => {
      const res = await api.put(`/admin/maintenance/${logId}`, data);
      return res.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maintenance-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-equipment'] });
      await refetchLogs();
      await refetchEquipment();
      setSelectedLog(null);
      setUpdateFormData({ status: 'in_progress', resolutionNotes: '', cost: '' });
      alert('Maintenance status updated successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to update maintenance status');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEquipment) {
      reportMaintenance.mutate({ equipmentId: selectedEquipment, data: formData });
    }
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLog) {
      const payload: any = {
        status: updateFormData.status,
      };
      if (updateFormData.resolutionNotes) {
        payload.resolutionNotes = updateFormData.resolutionNotes;
      }
      if (updateFormData.cost) {
        payload.cost = parseFloat(updateFormData.cost);
      }
      updateMaintenanceStatus.mutate({ logId: selectedLog.logId, data: payload });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Equipment</h2>
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">Loading...</td>
                      </tr>
                    ) : equipment?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No equipment</td>
                      </tr>
                    ) : (
                      equipment?.map((item: any) => (
                        <tr key={item.equipmentId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.equipmentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {item.equipmentType?.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.status === 'operational' ? 'bg-green-100 text-green-800' :
                              item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => setSelectedEquipment(item.equipmentId)}
                              className="text-blue-600 hover:text-blue-700 whitespace-nowrap"
                            >
                              Report Issue
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {selectedEquipment ? 'Report Maintenance Issue' : selectedLog ? 'Update Maintenance Status' : 'Maintenance Logs'}
              </h2>
              {selectedLog ? (
                <form onSubmit={handleUpdateSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
                    <p className="text-gray-900">{selectedLog.equipment?.equipmentName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue</label>
                    <p className="text-gray-900">{selectedLog.issueDescription}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                    <p className="text-gray-900 capitalize">{selectedLog.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                    <select
                      value={updateFormData.status}
                      onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value as any })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  {updateFormData.status === 'resolved' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Notes</label>
                        <textarea
                          value={updateFormData.resolutionNotes}
                          onChange={(e) => setUpdateFormData({ ...updateFormData, resolutionNotes: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows={3}
                          placeholder="Describe how the issue was resolved..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cost (optional)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={updateFormData.cost}
                          onChange={(e) => setUpdateFormData({ ...updateFormData, cost: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="0.00"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={updateMaintenanceStatus.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updateMaintenanceStatus.isPending ? 'Updating...' : 'Update Status'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLog(null);
                        setUpdateFormData({ status: 'in_progress', resolutionNotes: '', cost: '' });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : selectedEquipment ? (
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Issue Description</label>
                    <textarea
                      required
                      value={formData.issueDescription}
                      onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={reportMaintenance.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {reportMaintenance.isPending ? 'Reporting...' : 'Report Issue'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEquipment(null);
                        setFormData({ issueDescription: '', priority: 'medium' });
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {maintenanceLogs?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No maintenance logs</td>
                        </tr>
                      ) : (
                        maintenanceLogs?.map((log: any) => (
                          <tr key={log.logId}>
                            <td className="px-6 py-4 text-sm text-gray-900">{log.equipment?.equipmentName}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{log.issueDescription}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                log.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                log.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                log.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {log.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                log.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                log.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => {
                                  setSelectedLog(log);
                                  setUpdateFormData({
                                    status: log.status === 'reported' ? 'in_progress' : log.status,
                                    resolutionNotes: log.resolutionNotes || '',
                                    cost: log.cost ? log.cost.toString() : '',
                                  });
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Update
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

