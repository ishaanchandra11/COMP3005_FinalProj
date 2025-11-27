import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';
import { format } from 'date-fns';

export default function AdminBilling() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    dueDate: '',
    items: [{ itemType: 'membership', description: '', quantity: '1', unitPrice: '' }],
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: bills, isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const res = await api.get('/admin/bills');
      return res.data;
    },
  });

  const { data: members } = useQuery({
    queryKey: ['admin-members'],
    queryFn: async () => {
      const res = await api.get('/admin/members');
      return res.data;
    },
  });

  const createBill = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/admin/bills', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setShowCreateForm(false);
    },
  });

  const processPayment = useMutation({
    mutationFn: async ({ billId, paymentMethod }: { billId: number; paymentMethod: string }) => {
      const res = await api.post(`/admin/bills/${billId}/pay`, { paymentMethod });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBill.mutate({
      ...formData,
      memberId: parseInt(formData.memberId),
      items: formData.items.map(item => ({
        ...item,
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
      })),
    });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showCreateForm ? 'Cancel' : 'Create Bill'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Member {formData.memberId && (
                      <span className="text-blue-600 font-normal ml-2">
                        ({members?.find((m: any) => m.memberId.toString() === formData.memberId)?.firstName} {members?.find((m: any) => m.memberId.toString() === formData.memberId)?.lastName})
                      </span>
                    )}
                  </label>
                  <select
                    required
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Member</option>
                    {members?.map((member: any) => (
                      <option key={member.memberId} value={member.memberId}>
                        {member.firstName} {member.lastName} ({member.users?.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                    <select
                      value={item.itemType}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].itemType = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="membership">Membership</option>
                      <option value="personal_training">Personal Training</option>
                      <option value="class">Class</option>
                      <option value="product">Product</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].description = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].quantity = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index].unitPrice = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                ))}
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
                disabled={createBill.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createBill.isPending ? 'Creating...' : 'Create Bill'}
              </button>
            </form>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                  </tr>
                ) : bills?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No bills</td>
                  </tr>
                ) : (
                  bills?.map((bill: any) => (
                    <tr key={bill.billId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{bill.billId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.member?.firstName} {bill.member?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${typeof bill.totalAmount === 'number' 
                          ? bill.totalAmount.toFixed(2) 
                          : typeof bill.totalAmount === 'string' 
                            ? parseFloat(bill.totalAmount).toFixed(2) 
                            : '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                          bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {bill.status !== 'paid' && (
                          <button
                            onClick={() => processPayment.mutate({ billId: bill.billId, paymentMethod: 'credit_card' })}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Process Payment
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

