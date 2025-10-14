import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const CampaignManagement = ({ onLogout }) => {
    const navigate = useNavigate();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchCampaigns();
    }, [filter]);

    const fetchCampaigns = async () => {
        try {
            const url = filter === 'all'
                ? 'http://localhost:3033/api/campaigns/admin/all'
                : `http://localhost:3033/api/campaigns/admin/all?status=${filter}`;

            const response = await axios.get(url);
            if (response.data.success) {
                setCampaigns(response.data.campaigns);
            }
        } catch (err) {
            console.error('Error fetching campaigns:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.patch(`http://localhost:3033/api/campaigns/admin/${id}/status`, {
                status: newStatus
            });
            fetchCampaigns();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;

        try {
            await axios.delete(`http://localhost:3033/api/campaigns/admin/${id}`);
            fetchCampaigns();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting campaign');
        }
    };

    const handleCompleteCampaign = async (campaign) => {
        // Check if campaign has submissions
        if (campaign.total_submissions === 0) {
            alert('Cannot complete campaign with no submissions. Please wait for participants to submit their artwork.');
            return;
        }

        // Check if winners have been set
        try {
            const response = await axios.get(`http://localhost:3033/api/campaigns/admin/${campaign._id}`);
            const campaignData = response.data.campaign;

            // Check if any submissions have winner status
            const submissionsResponse = await axios.get(`http://localhost:3033/api/campaigns/${campaign._id}/participants`);
            const submissions = submissionsResponse.data.participants || [];

            const hasWinners = submissions.some(sub => sub.status === 'winner' || sub.status === 'runner_up');

            if (!hasWinners) {
                const proceed = window.confirm(
                    'This campaign has no winners set yet. To complete a campaign, you must first:\n\n' +
                    '1. Review submissions\n' +
                    '2. Rate and select winners\n' +
                    '3. Then complete the campaign\n\n' +
                    'Would you like to go to submissions review first?'
                );

                if (proceed) {
                    navigate(`/submissions/${campaign._id}`);
                }
                return;
            }

            // If winners are set, proceed with completion
            const confirmComplete = window.confirm(
                `Complete "${campaign.name}"?\n\n` +
                'This will:\n' +
                '• Close the campaign\n' +
                '• Distribute prizes to winners\n' +
                '• Award participation points\n\n' +
                'This action cannot be undone.'
            );

            if (confirmComplete) {
                await handleStatusChange(campaign._id, 'completed');
                alert('Campaign completed successfully! Prizes have been distributed.');
            }
        } catch (err) {
            console.error('Error checking campaign completion:', err);
            alert('Error checking campaign status. Please try again.');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-700',
            active: 'bg-green-100 text-green-700',
            completed: 'bg-blue-100 text-blue-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar currentPage="campaigns" onLogout={onLogout} />

            <div className="flex-1 p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Management</h1>
                            <p className="text-gray-600">Manage all art competitions</p>
                        </div>
                        <Link
                            to="/campaigns/create"
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
                        >
                            + Create New Campaign
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-6 overflow-x-auto">
                        {['all', 'draft', 'active', 'completed', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${filter === status
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Campaigns Table */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        </div>
                    ) : campaigns.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <div className="text-6xl mb-4">🎨</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Campaigns Found</h3>
                            <p className="text-gray-600 mb-4">Create your first campaign to get started</p>
                            <Link
                                to="/campaigns/create"
                                className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                Create Campaign
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Campaign</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Participants</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Entry Fee</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Prizes</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {campaigns.map((campaign) => (
                                            <tr key={campaign._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={campaign.reference_image.startsWith('http')
                                                                ? campaign.reference_image
                                                                : `http://localhost:3033${campaign.reference_image}`
                                                            }
                                                            alt={campaign.name}
                                                            className="w-12 h-12 rounded object-cover mr-3"
                                                            onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                                                        />
                                                        <div>
                                                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                                {campaign.name}
                                                                {campaign.status === 'active' && campaign.total_submissions > 0 && (
                                                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                                                        Needs Review
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{campaign.category}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <span className="font-semibold">{campaign.current_participants}</span>
                                                        <span className="text-gray-500">/{campaign.max_participants}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500">{campaign.total_submissions} submissions</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold">₹{campaign.entry_fee.amount}</div>
                                                    <div className="text-xs text-gray-500">{campaign.entry_fee.type}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <div className="text-green-600 font-semibold">₹{campaign.prizes.first_prize}</div>
                                                        <div className="text-xs text-gray-500">+ ₹{campaign.prizes.second_prize}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(campaign.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2 flex-wrap">
                                                        <button
                                                            onClick={() => navigate(`/campaigns/edit/${campaign._id}`)}
                                                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-sm font-medium"
                                                            title="Edit Campaign"
                                                        >
                                                            ✏️ Edit
                                                        </button>

                                                        <button
                                                            onClick={() => navigate(`/submissions/${campaign._id}`)}
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium"
                                                            title="View Submissions"
                                                        >
                                                            👁️ View
                                                        </button>

                                                        {campaign.status === 'draft' && (
                                                            <button
                                                                onClick={() => handleStatusChange(campaign._id, 'active')}
                                                                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm font-medium"
                                                                title="Activate Campaign"
                                                            >
                                                                ▶️ Activate
                                                            </button>
                                                        )}

                                                        {campaign.status === 'active' && (
                                                            <button
                                                                onClick={() => handleCompleteCampaign(campaign)}
                                                                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition text-sm font-medium"
                                                                title={campaign.total_submissions > 0 ? "Complete Campaign (requires winners)" : "Complete Campaign (no submissions yet)"}
                                                            >
                                                                ✅ Complete
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => handleDelete(campaign._id)}
                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium"
                                                            title="Delete Campaign"
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignManagement;

