import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config/api.js';

const EditCampaign = ({ onLogout }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        name: '',
        reference_image: '',
        max_participants: 20,
        campaign_type: 'premium',
        entry_fee_amount: 100,
        entry_fee_type: 'rupees',
        points_required: 500,
        first_prize: 1000,
        second_prize: 500,
        platform_share: 500,
        start_date: '',
        end_date: '',
        submission_deadline: '',
        result_date: '',
        rules: '',
        category: 'drawing',
        age_group: 'all',
        submission_type: 'offline'
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchCampaign();
    }, [id]);

    const fetchCampaign = async () => {
        try {
            setFetchLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/campaigns/admin/${id}`);
            if (response.data.success) {
                const campaign = response.data.campaign;
                setForm({
                    name: campaign.name || '',
                    reference_image: campaign.reference_image || '',
                    max_participants: campaign.max_participants || 20,
                    campaign_type: campaign.campaign_type || 'premium',
                    entry_fee_amount: campaign.entry_fee?.amount || 100,
                    entry_fee_type: campaign.entry_fee?.type || 'rupees',
                    points_required: campaign.points_required || 500,
                    first_prize: campaign.prizes?.first_prize || 1000,
                    second_prize: campaign.prizes?.second_prize || 500,
                    platform_share: campaign.prizes?.platform_share || 500,
                    start_date: campaign.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : '',
                    end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : '',
                    submission_deadline: campaign.submission_deadline ? new Date(campaign.submission_deadline).toISOString().split('T')[0] : '',
                    result_date: campaign.result_date ? new Date(campaign.result_date).toISOString().split('T')[0] : '',
                    rules: campaign.rules || '',
                    category: campaign.category || 'drawing',
                    age_group: campaign.age_group || 'all',
                    submission_type: campaign.submission_type || 'offline'
                });
                setImagePreview(campaign.reference_image);
            }
        } catch (err) {
            setError('Error fetching campaign data');
            console.error('Error fetching campaign:', err);
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let imageUrl = form.reference_image;

            // Upload new image if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('image', selectedFile);

                const uploadResponse = await axios.post(`${API_BASE_URL}/api/upload/image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (uploadResponse.data.success) {
                    imageUrl = uploadResponse.data.imageUrl;
                } else {
                    throw new Error('Failed to upload image');
                }
            }

            // Update campaign
            const campaignData = {
                ...form,
                reference_image: imageUrl
            };

            const response = await axios.put(`${API_BASE_URL}/api/campaigns/admin/${id}`, campaignData);

            if (response.data.success) {
                setSuccess('Campaign updated successfully!');
                setTimeout(() => {
                    navigate('/campaigns');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating campaign');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar currentPage="campaigns" onLogout={onLogout} />
                <div className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading campaign data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar currentPage="campaigns" onLogout={onLogout} />

            <div className="flex-1 p-4 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={() => navigate('/campaigns')}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                            >
                                ← Back to Campaigns
                            </button>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Campaign</h1>
                        <p className="text-gray-600">Update campaign details and settings</p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                                <p className="text-green-700">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Campaign Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Enter campaign name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="drawing">Drawing</option>
                                        <option value="painting">Painting</option>
                                        <option value="coloring">Coloring</option>
                                        <option value="digital">Digital Art</option>
                                        <option value="sculpture">Sculpture</option>
                                        <option value="photography">Photography</option>
                                        <option value="mixed">Mixed Media</option>
                                    </select>
                                </div>
                            </div>

                            {/* Reference Image */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reference Image *
                                </label>
                                <div className="space-y-4">
                                    {imagePreview && (
                                        <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                                            <img
                                                src={imagePreview.startsWith('http') ? imagePreview : `http://localhost:3033${imagePreview}`}
                                                alt="Reference"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <p className="text-sm text-gray-500">Upload a new image or keep the current one</p>
                                </div>
                            </div>

                            {/* Campaign Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Max Participants *
                                    </label>
                                    <input
                                        type="number"
                                        name="max_participants"
                                        value={form.max_participants}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Campaign Type *
                                    </label>
                                    <select
                                        name="campaign_type"
                                        value={form.campaign_type}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="premium">Premium</option>
                                        <option value="point-based">Point-based</option>
                                        <option value="free">Free</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Submission Type *
                                    </label>
                                    <select
                                        name="submission_type"
                                        value={form.submission_type}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="offline">Offline</option>
                                        <option value="digital">Digital Canvas</option>
                                    </select>
                                </div>
                            </div>

                            {/* Entry Fee */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Entry Fee Amount *
                                    </label>
                                    <input
                                        type="number"
                                        name="entry_fee_amount"
                                        value={form.entry_fee_amount}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Entry Fee Type *
                                    </label>
                                    <select
                                        name="entry_fee_type"
                                        value={form.entry_fee_type}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="rupees">Rupees</option>
                                        <option value="points">Points</option>
                                    </select>
                                </div>
                            </div>

                            {/* Prizes */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        First Prize (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        name="first_prize"
                                        value={form.first_prize}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Second Prize (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        name="second_prize"
                                        value={form.second_prize}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Platform Share (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        name="platform_share"
                                        value={form.platform_share}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={form.start_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        End Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={form.end_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Submission Deadline *
                                    </label>
                                    <input
                                        type="date"
                                        name="submission_deadline"
                                        value={form.submission_deadline}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Result Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="result_date"
                                        value={form.result_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Rules */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Rules & Guidelines *
                                </label>
                                <textarea
                                    name="rules"
                                    value={form.rules}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter detailed rules and guidelines for the campaign..."
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Updating...' : 'Update Campaign'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/campaigns')}
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCampaign;
