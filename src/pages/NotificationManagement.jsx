import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3033';

const NotificationManagement = () => {
    const [notificationType, setNotificationType] = useState('broadcast'); // broadcast, specific_user, campaign_participants
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [icon, setIcon] = useState('/logo_purple.png');
    const [url, setUrl] = useState('/');
    const [targetUserId, setTargetUserId] = useState('');
    const [targetCampaignId, setTargetCampaignId] = useState('');
    const [campaigns, setCampaigns] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState(null);
    const [activeSubscriptions, setActiveSubscriptions] = useState(0);

    // Quick templates
    const templates = [
        {
            name: '🎨 New Contest Announcement',
            title: '🎨 New Contest Live!',
            body: 'A new exciting contest just launched! Join now and win amazing prizes!',
            url: '/#campaigns'
        },
        {
            name: '⏰ Deadline Reminder',
            title: '⏰ Contest Ending Soon!',
            body: 'Only 24 hours left to submit your artwork! Don\'t miss out!',
            url: '/#campaigns'
        },
        {
            name: '🎉 Winner Announcement',
            title: '🎉 Contest Winners Announced!',
            body: 'Winners have been announced! Check if you won!',
            url: '/#my-contests'
        },
        {
            name: '💰 Prize Alert',
            title: '💰 Prizes Credited!',
            body: 'Contest prizes have been credited to winners\' wallets!',
            url: '/#wallet'
        },
        {
            name: '📢 General Announcement',
            title: '📢 Important Update',
            body: 'We have an important announcement for all users!',
            url: '/'
        }
    ];

    useEffect(() => {
        fetchCampaigns();
        fetchActiveSubscriptions();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/campaigns/admin/all`);
            if (response.data.success) {
                setCampaigns(response.data.campaigns);
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        }
    };

    const fetchActiveSubscriptions = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/push/stats`);
            if (response.data.success) {
                setActiveSubscriptions(response.data.total_subscriptions);
            }
        } catch (error) {
            console.error('Error fetching subscription stats:', error);
        }
    };

    const searchUsers = async (query) => {
        if (query.length < 2) {
            setUsers([]);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/users/search?q=${query}`);
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyTemplate = (template) => {
        setTitle(template.title);
        setBody(template.body);
        setUrl(template.url);
    };

    const handleSendNotification = async () => {
        if (!title || !body) {
            alert('Title and body are required!');
            return;
        }

        if (notificationType === 'specific_user' && !targetUserId) {
            alert('Please select a user!');
            return;
        }

        if (notificationType === 'campaign_participants' && !targetCampaignId) {
            alert('Please select a campaign!');
            return;
        }

        setSending(true);
        setResult(null);

        try {
            let response;
            const payload = { title, body, icon, url };

            switch (notificationType) {
                case 'broadcast':
                    response = await axios.post(`${API_BASE_URL}/api/push/broadcast`, payload);
                    break;

                case 'specific_user':
                    response = await axios.post(`${API_BASE_URL}/api/push/send-to-user`, {
                        ...payload,
                        user_id: targetUserId
                    });
                    break;

                case 'campaign_participants':
                    response = await axios.post(`${API_BASE_URL}/api/push/send-to-campaign-participants`, {
                        ...payload,
                        campaign_id: targetCampaignId
                    });
                    break;

                default:
                    break;
            }

            if (response.data.success) {
                setResult({
                    success: true,
                    message: response.data.message,
                    sent: response.data.sent,
                    failed: response.data.failed
                });

                // Clear form after successful send
                setTimeout(() => {
                    setTitle('');
                    setBody('');
                    setUrl('/');
                    setTargetUserId('');
                    setTargetCampaignId('');
                }, 2000);
            } else {
                setResult({
                    success: false,
                    message: response.data.message
                });
            }
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Error sending notification'
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🔔 Push Notification Management
                    </h1>
                    <p className="text-gray-600">
                        Send push notifications to users about contests, updates, and announcements
                    </p>
                    <div className="mt-4 flex items-center space-x-4">
                        <div className="bg-purple-100 px-4 py-2 rounded-lg">
                            <span className="text-purple-800 font-semibold">
                                📱 {activeSubscriptions} Active Subscribers
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Send Notification
                            </h2>

                            {/* Notification Type */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Target Audience
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setNotificationType('broadcast')}
                                        className={`p-4 border-2 rounded-lg text-left transition ${notificationType === 'broadcast'
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="font-semibold text-gray-800">📢 Broadcast</div>
                                        <div className="text-sm text-gray-600">All users</div>
                                    </button>

                                    <button
                                        onClick={() => setNotificationType('specific_user')}
                                        className={`p-4 border-2 rounded-lg text-left transition ${notificationType === 'specific_user'
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="font-semibold text-gray-800">👤 Specific User</div>
                                        <div className="text-sm text-gray-600">One user</div>
                                    </button>

                                    <button
                                        onClick={() => setNotificationType('campaign_participants')}
                                        className={`p-4 border-2 rounded-lg text-left transition ${notificationType === 'campaign_participants'
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="font-semibold text-gray-800">🎨 Contest Participants</div>
                                        <div className="text-sm text-gray-600">Campaign users</div>
                                    </button>
                                </div>
                            </div>

                            {/* Target Selection */}
                            {notificationType === 'specific_user' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Search User (by mobile or name)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search by mobile number or username..."
                                        onChange={(e) => searchUsers(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                    {users.length > 0 && (
                                        <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                                            {users.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => {
                                                        setTargetUserId(user.id);
                                                        setUsers([]);
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-purple-50 transition"
                                                >
                                                    <div className="font-semibold">{user.username || 'Anonymous'}</div>
                                                    <div className="text-sm text-gray-600">{user.mobile_number}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {targetUserId && (
                                        <div className="mt-2 bg-purple-50 px-4 py-2 rounded-lg">
                                            <span className="text-purple-800 font-semibold">
                                                ✓ User selected: {targetUserId}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {notificationType === 'campaign_participants' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Select Campaign
                                    </label>
                                    <select
                                        value={targetCampaignId}
                                        onChange={(e) => setTargetCampaignId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">-- Select Campaign --</option>
                                        {campaigns.map((campaign) => (
                                            <option key={campaign._id} value={campaign._id}>
                                                {campaign.name} ({campaign.current_participants} participants)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Notification Content */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., 🎨 New Contest Live!"
                                        maxLength="50"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                    <div className="text-sm text-gray-500 mt-1">
                                        {title.length}/50 characters
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Message Body *
                                    </label>
                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder="Enter notification message..."
                                        maxLength="150"
                                        rows="4"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                    <div className="text-sm text-gray-500 mt-1">
                                        {body.length}/150 characters
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Click Action URL
                                    </label>
                                    <select
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="/">Home</option>
                                        <option value="/#campaigns">Contests</option>
                                        <option value="/#timeline">Timeline</option>
                                        <option value="/#my-contests">My Contests</option>
                                        <option value="/#wallet">Wallet</option>
                                        <option value="/#profile">Profile</option>
                                    </select>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="text-sm font-semibold text-gray-600 mb-2">Preview:</div>
                                <div className="bg-white p-4 rounded-lg shadow-md max-w-sm">
                                    <div className="flex items-start space-x-3">
                                        <img src="/logo_purple.png" alt="Icon" className="w-10 h-10 rounded" />
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-800">
                                                {title || 'Notification Title'}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {body || 'Notification message will appear here...'}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-2">
                                                ArtAdventureHub • Just now
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={handleSendNotification}
                                disabled={sending || !title || !body}
                                className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${sending || !title || !body
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                            >
                                {sending ? '📤 Sending...' : '🔔 Send Notification'}
                            </button>

                            {/* Result */}
                            {result && (
                                <div
                                    className={`mt-4 p-4 rounded-lg ${result.success
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-red-50 border border-red-200'
                                        }`}
                                >
                                    <div className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                        {result.success ? '✅ Success!' : '❌ Failed'}
                                    </div>
                                    <div className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                        {result.message}
                                    </div>
                                    {result.sent !== undefined && (
                                        <div className="text-sm text-green-700 mt-2">
                                            📤 Sent: {result.sent} | ❌ Failed: {result.failed || 0}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Templates */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                📝 Quick Templates
                            </h3>
                            <div className="space-y-3">
                                {templates.map((template, index) => (
                                    <button
                                        key={index}
                                        onClick={() => applyTemplate(template)}
                                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
                                    >
                                        <div className="font-semibold text-sm text-gray-800">
                                            {template.name}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {template.title}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50 rounded-lg p-4 mt-4 border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2">💡 Tips</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Use emojis to make notifications engaging</li>
                                <li>• Keep titles under 40 characters</li>
                                <li>• Be clear and actionable</li>
                                <li>• Test with specific user first</li>
                                <li>• Check subscription count before broadcast</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationManagement;

