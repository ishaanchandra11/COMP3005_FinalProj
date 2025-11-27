import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../lib/api';
import { format } from 'date-fns';

export default function MemberBilling() {
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'debit' | 'cash' | 'e_transfer'>('credit_card');
  const queryClient = useQueryClient();

  const { data: bills, isLoading } = useQuery({
    queryKey: ['member-bills'],
    queryFn: async () => {
      const res = await api.get('/members/bills');
      return res.data;
    },
  });

  const processPayment = useMutation({
    mutationFn: async ({ billId, paymentMethod }: { billId: number; paymentMethod: string }) => {
      const res = await api.post(`/members/bills/${billId}/pay`, { paymentMethod });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-bills'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      setShowPaymentModal(false);
      setSelectedBill(null);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to process payment');
    },
  });

  const handlePayBill = (bill: any) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBill) {
      processPayment.mutate({ billId: selectedBill.billId, paymentMethod });
    }
  };

  const pendingBills = bills?.filter((bill: any) => bill.status === 'pending' || bill.status === 'overdue') || [];
  const paidBills = bills?.filter((bill: any) => bill.status === 'paid') || [];
  const totalOutstanding = pendingBills.reduce((sum: number, bill: any) => sum + Number(bill.totalAmount || 0), 0);

  return (
    <ProtectedRoute allowedRoles={['member']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
            {totalOutstanding > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">
                  Outstanding Balance: <span className="font-bold">${totalOutstanding.toFixed(2)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Outstanding Bills */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Outstanding Bills</h2>
            {isLoading ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                Loading bills...
              </div>
            ) : pendingBills.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center text-green-700">
                <p className="font-medium">All bills are paid! 🎉</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingBills.map((bill: any) => (
                      <tr key={bill.billId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{bill.billId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bill.generatedDate ? format(new Date(bill.generatedDate), 'MMM dd, yyyy') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${Number(bill.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handlePayBill(bill)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Pay Now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Payment History</h2>
            {isLoading ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                Loading payment history...
              </div>
            ) : paidBills.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No payment history yet
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paidBills.map((bill: any) => (
                      <tr key={bill.billId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{bill.billId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${Number(bill.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {bill.paymentMethod?.replace('_', ' ') || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bill.paidAt ? format(new Date(bill.paidAt), 'MMM dd, yyyy') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedBill(bill)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Modal */}
          {showPaymentModal && selectedBill && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Pay Bill #{selectedBill.billId}</h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Amount Due:</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${Number(selectedBill.totalAmount || 0).toFixed(2)}
                  </p>
                </div>
                <form onSubmit={handleSubmitPayment}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="debit">Debit Card</option>
                      <option value="e_transfer">E-Transfer</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  {selectedBill.items && selectedBill.items.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Bill Items:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {selectedBill.items.map((item: any) => (
                          <li key={item.itemId}>
                            {item.description} - ${Number(item.unitPrice || 0).toFixed(2)} x {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaymentModal(false);
                        setSelectedBill(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processPayment.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {processPayment.isPending ? 'Processing...' : 'Confirm Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Bill Details Modal */}
          {selectedBill && !showPaymentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Bill #{selectedBill.billId} Details</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      selectedBill.status === 'paid' ? 'text-green-600' :
                      selectedBill.status === 'overdue' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {selectedBill.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Generated:</span>
                    <span className="text-gray-900">
                      {selectedBill.generatedDate ? format(new Date(selectedBill.generatedDate), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="text-gray-900">
                      {format(new Date(selectedBill.dueDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {selectedBill.items && selectedBill.items.length > 0 && (
                    <div>
                      <p className="text-gray-600 mb-2">Items:</p>
                      <div className="border-t border-gray-200 pt-2">
                        {selectedBill.items.map((item: any) => (
                          <div key={item.itemId} className="flex justify-between mb-2">
                            <span className="text-gray-900">{item.description}</span>
                            <span className="text-gray-900">
                              ${Number(item.unitPrice || 0).toFixed(2)} x {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-gray-900">
                      ${Number(selectedBill.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  {selectedBill.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid On:</span>
                      <span className="text-gray-900">
                        {format(new Date(selectedBill.paidAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {selectedBill.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="text-gray-900 capitalize">
                        {selectedBill.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedBill(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  {selectedBill.status !== 'paid' && (
                    <button
                      onClick={() => {
                        setShowPaymentModal(true);
                      }}
                      className="ml-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

