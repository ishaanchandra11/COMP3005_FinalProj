import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';

export default function AdminRooms() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    roomName: '',
    roomType: 'studio',
    capacity: '',
    hasEquipment: false,
    description: '',
  });

  const queryClient = useQueryClient();

  const { data: rooms, isLoading, refetch } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: async () => {
      const res = await api.get('/admin/rooms');
      return res.data;
    },
  });

  const createRoom = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/admin/rooms', data);
      return res.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      await refetch(); // Force refetch to get latest data
      setShowAddForm(false);
      setFormData({
        roomName: '',
        roomType: 'studio',
        capacity: '',
        hasEquipment: false,
        description: '',
      });
      alert('Room created successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create room');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRoom.mutate({
      ...formData,
      capacity: parseInt(formData.capacity),
    });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showAddForm ? 'Cancel' : 'Add Room'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Name</label>
                <input
                  type="text"
                  required
                  value={formData.roomName}
                  onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Type</label>
                  <select
                    required
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="studio">Studio</option>
                    <option value="cardio">Cardio</option>
                    <option value="weight">Weight Room</option>
                    <option value="yoga">Yoga</option>
                    <option value="pool">Pool</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.hasEquipment}
                    onChange={(e) => setFormData({ ...formData, hasEquipment: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Has Equipment</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={createRoom.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createRoom.isPending ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12">Loading...</div>
            ) : rooms?.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">No rooms</div>
            ) : (
              rooms?.map((room: any) => (
                <div key={room.roomId} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{room.roomName}</h3>
                  <p className="text-sm text-gray-600 mb-4 capitalize">{room.roomType}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium text-gray-900">{room.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Equipment:</span>
                      <span className="font-medium text-gray-900">{room.hasEquipment ? 'Yes' : 'No'}</span>
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

