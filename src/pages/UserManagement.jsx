import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config/api.js';

const UserManagement = ({ onLogout }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSubmissions, setUserSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/users`);
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.mobile_number?.includes(searchTerm) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchUserDetails = async (user) => {
        setSelectedUser(user);
        setLoadingSubmissions(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/campaigns/user/${user.id}/submissions`);
            if (response.data.success) {
                setUserSubmissions(response.data.submissions);
            }
        } catch (err) {
            console.error('Error fetching user submissions:', err);
            setUserSubmissions([]);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const closeUserModal = () => {
        setSelectedUser(null);
        setUserSubmissions([]);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar currentPage="users" onLogout={onLogout} />

            <div className="flex-1 p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                        <p className="text-gray-600">View and manage all registered users</p>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-lg shadow p-4 mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by mobile number or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600 mb-1">Total Users</div>
                            <div className="text-2xl font-bold text-purple-600">{users.length}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600 mb-1">Verified Users</div>
                            <div className="text-2xl font-bold text-green-600">
                                {users.filter(u => u.status === 'verified').length}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600 mb-1">With Usernames</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {users.filter(u => u.username).length}
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Mobile</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Registered</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                                            {user.username ? user.username[0].toUpperCase() : user.mobile_number[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">
                                                                {user.username ? `@${user.username}` : 'No username'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">ID: {user.id.slice(-8)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium">+91 {user.mobile_number}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'verified'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600">
                                                        {new Date(user.createdAt).toLocaleDateString('en-IN')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => fetchUserDetails(user)}
                                                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-sm font-medium"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredUsers.length === 0 && searchTerm && (
                                <div className="text-center py-8 text-gray-500">
                                    No users found matching "{searchTerm}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {selectedUser.username || 'User'} Details
                                </h2>
                                <p className="text-sm text-gray-600">{selectedUser.mobile_number}</p>
                            </div>
                            <button
                                onClick={closeUserModal}
                                className="text-gray-500 hover:text-gray-700 transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* User Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Points</p>
                                    <p className="text-2xl font-bold text-purple-600">💎 {selectedUser.points || 0}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Wallet Balance</p>
                                    <p className="text-2xl font-bold text-green-600">₹{selectedUser.wallet?.balance || 0}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Referral Code</p>
                                    <p className="text-lg font-bold text-blue-600">{selectedUser.referral_code || 'N/A'}</p>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Status</p>
                                    <p className="text-lg font-bold text-yellow-600">{selectedUser.status || 'active'}</p>
                                </div>
                            </div>

                            {/* User Submissions */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Contest Submissions ({userSubmissions.length})
                                </h3>

                                {loadingSubmissions ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                                        <p className="text-gray-600 mt-4">Loading submissions...</p>
                                    </div>
                                ) : userSubmissions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {userSubmissions.map((submission) => (
                                            <div key={submission._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                {/* Submission Image */}
                                                <div className="mb-3">
                                                    <img
                                                        src={submission.submission_image}
                                                        alt="Artwork"
                                                        className="w-full h-48 object-cover rounded-lg"
                                                    />
                                                </div>

                                                {/* Campaign Info */}
                                                <h4 className="font-semibold text-gray-900 mb-2">
                                                    {submission.campaign_id?.name || 'Contest'}
                                                </h4>

                                                {/* Stats */}
                                                <div className="grid grid-cols-3 gap-2 mb-3">
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-600">Votes</p>
                                                        <p className="text-lg font-bold text-blue-600">{submission.votes || 0}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-600">Likes</p>
                                                        <p className="text-lg font-bold text-pink-600">{submission.likes || 0}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-gray-600">Rating</p>
                                                        <p className="text-lg font-bold text-yellow-600">{submission.admin_rating || 0}/10</p>
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${submission.status === 'winner' ? 'bg-yellow-100 text-yellow-800' :
                                                            submission.status === 'runner_up' ? 'bg-orange-100 text-orange-800' :
                                                                submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {submission.status}
                                                    </span>
                                                    {submission.prize_won?.amount > 0 && (
                                                        <span className="text-green-600 font-bold">
                                                            ₹{submission.prize_won.amount}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Submitted Date */}
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Submitted: {new Date(submission.submitted_at).toLocaleDateString('en-IN')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p>No submissions yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                            <button
                                onClick={closeUserModal}
                                className="w-full md:w-auto px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;

