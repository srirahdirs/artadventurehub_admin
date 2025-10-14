import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config/api.js';

const WithdrawalManagement = ({ onLogout }) => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [action, setAction] = useState(''); // 'approve' or 'reject'
    const [adminMessage, setAdminMessage] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchWithdrawals();
    }, [filter]);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/withdrawals/admin/all?status=${filter}`);
            if (response.data.success) {
                setWithdrawals(response.data.withdrawals);
            }
        } catch (err) {
            console.error('Error fetching withdrawals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (withdrawal, actionType) => {
        setSelectedWithdrawal(withdrawal);
        setAction(actionType);
        setAdminMessage('');
        setShowModal(true);
    };

    const handleProcess = async () => {
        if (!selectedWithdrawal) return;

        setProcessing(true);
        try {
            const requestData = {
                status: action === 'approve' ? 'completed' : 'rejected',
                admin_notes: adminMessage || (action === 'approve'
                    ? 'Approved. Amount will be transferred within 24 hours.'
                    : 'Withdrawal request rejected.'),
                rejection_reason: action === 'reject' ? (adminMessage || 'Request rejected by admin') : undefined
            };

            const response = await axios.put(
                `${API_BASE_URL}/api/withdrawals/admin/${selectedWithdrawal.id}/process`,
                requestData
            );

            if (response.data.success) {
                alert(`Withdrawal ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
                setShowModal(false);
                setSelectedWithdrawal(null);
                setAdminMessage('');
                fetchWithdrawals();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing withdrawal');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar onLogout={onLogout} />

            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Withdrawal Management</h1>
                        <p className="text-gray-600">Process user withdrawal requests</p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-white rounded-lg shadow mb-6 p-4">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-6 py-2 rounded-lg font-medium transition ${filter === 'pending'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-6 py-2 rounded-lg font-medium transition ${filter === 'completed'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setFilter('rejected')}
                                className={`px-6 py-2 rounded-lg font-medium transition ${filter === 'rejected'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Rejected
                            </button>
                            <button
                                onClick={() => setFilter('cancelled')}
                                className={`px-6 py-2 rounded-lg font-medium transition ${filter === 'cancelled'
                                    ? 'bg-gray-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Cancelled
                            </button>
                            <button
                                onClick={() => setFilter('')}
                                className={`px-6 py-2 rounded-lg font-medium transition ${filter === ''
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                All
                            </button>
                        </div>
                    </div>

                    {/* Withdrawals Table */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                    ) : withdrawals.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <div className="text-6xl mb-4">💰</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Withdrawals Found</h3>
                            <p className="text-gray-600">No {filter} withdrawal requests at the moment.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Method
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Requested
                                        </th>
                                        {filter === 'pending' && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {withdrawals.map((withdrawal) => (
                                        <tr key={withdrawal.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {withdrawal.user.username}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {withdrawal.user.mobile}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-green-600">
                                                    ₹{withdrawal.amount}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 uppercase">
                                                    {withdrawal.method}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {withdrawal.method === 'upi' ? (
                                                        <div>
                                                            <span className="font-medium">UPI ID:</span> {withdrawal.details.upi_id}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs">
                                                            <div><span className="font-medium">Name:</span> {withdrawal.details.bank_details?.account_holder_name}</div>
                                                            <div><span className="font-medium">A/C:</span> {withdrawal.details.bank_details?.account_number}</div>
                                                            <div><span className="font-medium">IFSC:</span> {withdrawal.details.bank_details?.ifsc_code}</div>
                                                            <div><span className="font-medium">Bank:</span> {withdrawal.details.bank_details?.bank_name}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(withdrawal.status)}`}>
                                                    {withdrawal.status}
                                                </span>
                                                {withdrawal.admin_notes && (
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        Note: {withdrawal.admin_notes}
                                                    </div>
                                                )}
                                                {withdrawal.rejection_reason && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        Reason: {withdrawal.rejection_reason}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(withdrawal.requested_at).toLocaleString('en-IN')}
                                                {withdrawal.processed_at && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Processed: {new Date(withdrawal.processed_at).toLocaleString('en-IN')}
                                                    </div>
                                                )}
                                            </td>
                                            {filter === 'pending' && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleActionClick(withdrawal, 'approve')}
                                                        className="text-green-600 hover:text-green-900 mr-3 px-3 py-1 bg-green-100 rounded"
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleActionClick(withdrawal, 'reject')}
                                                        className="text-red-600 hover:text-red-900 px-3 py-1 bg-red-100 rounded"
                                                    >
                                                        ✗ Reject
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            {action === 'approve' ? '✓ Approve Withdrawal' : '✗ Reject Withdrawal'}
                        </h3>

                        <div className="mb-6">
                            <div className="bg-gray-50 rounded p-4 mb-4">
                                <div className="text-sm text-gray-600">User: <span className="font-medium text-gray-900">{selectedWithdrawal?.user.username}</span></div>
                                <div className="text-sm text-gray-600">Amount: <span className="font-bold text-green-600">₹{selectedWithdrawal?.amount}</span></div>
                                <div className="text-sm text-gray-600">Method: <span className="font-medium text-gray-900 uppercase">{selectedWithdrawal?.method}</span></div>
                            </div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {action === 'approve' ? 'Admin Note (Optional)' : 'Rejection Reason *'}
                            </label>
                            <textarea
                                value={adminMessage}
                                onChange={(e) => setAdminMessage(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                rows="4"
                                placeholder={action === 'approve'
                                    ? 'e.g., Approved. Transfer will be completed within 24 hours.'
                                    : 'Please provide a reason for rejection...'}
                            />

                            {action === 'approve' && (
                                <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-3 rounded">
                                    <strong>Note:</strong> The amount has already been deducted from the user's wallet. Please transfer ₹{selectedWithdrawal?.amount} to their account within 24 hours.
                                </div>
                            )}
                            {action === 'reject' && (
                                <div className="mt-3 text-sm text-orange-600 bg-orange-50 p-3 rounded">
                                    <strong>Note:</strong> The amount will be automatically refunded to the user's wallet upon rejection.
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedWithdrawal(null);
                                    setAdminMessage('');
                                }}
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleProcess}
                                disabled={processing || (action === 'reject' && !adminMessage.trim())}
                                className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${action === 'approve'
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {processing ? 'Processing...' : (action === 'approve' ? 'Approve' : 'Reject')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WithdrawalManagement;

