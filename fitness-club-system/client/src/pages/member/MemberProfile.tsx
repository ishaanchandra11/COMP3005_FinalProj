import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';

export default function MemberProfile() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const queryClient = useQueryClient();

  // Get current member profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['member-profile'],
    queryFn: async () => {
      const res = await api.get('/members/dashboard');
      return res.data;
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: '', // Not in dashboard response, will need to fetch separately
        emergencyContactName: '', // Not in dashboard response, will need to fetch separately
        emergencyContactPhone: '', // Not in dashboard response, will need to fetch separately
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put('/members/profile', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-profile'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      setIsEditing(false);
      setErrorMessages([]);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      const errors: string[] = [];
      const errorData = error.response?.data;
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach((err: any) => {
          errors.push(err.message || 'Validation error');
        });
      } else if (errorData?.error) {
        errors.push(errorData.error);
      } else if (errorData?.message) {
        errors.push(errorData.message);
      } else {
        errors.push('Failed to update profile. Please try again.');
      }
      
      setErrorMessages(errors);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages([]);
    setSuccessMessage('');
    
    // Only send fields that have values
    const payload: any = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        payload[key] = value;
      }
    });
    
    updateProfile.mutate(payload);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrorMessages([]);
    setSuccessMessage('');
    // Reset form to original values
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
      });
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['member']}>
        <Layout>
          <div className="text-center py-12">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['member']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Profile
              </button>
            )}
          </div>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {successMessage}
            </div>
          )}

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

          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.firstName || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.lastName || 'N/A'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 613-555-0101"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.phoneNumber || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership Status
                  </label>
                  <p className={`font-semibold capitalize ${
                    profile?.membershipStatus === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {profile?.membershipStatus || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Emergency contact's name"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.emergencyContactName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 613-555-0102"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.emergencyContactPhone || 'Not provided'}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Account Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">
                  {/* Email would come from user context, not profile */}
                  {profile?.email || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member ID:</span>
                <span className="font-medium text-gray-900">#{profile?.memberId || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

