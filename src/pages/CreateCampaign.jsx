import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config/api.js';

const CreateCampaign = ({ onLogout }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        name: '',
        reference_image: '',
        max_participants: 20,
        campaign_type: 'premium', // premium, point-based, or free
        entry_fee_amount: 100,
        entry_fee_type: 'rupees',
        points_required: 500, // For point-based campaigns
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            setSelectedFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.imageUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Check if image is selected
            if (!selectedFile) {
                setError('Please select a reference image');
                setLoading(false);
                return;
            }

            // Upload image first
            const imageUrl = await uploadImage(selectedFile);

            // Update form with uploaded image URL
            const formData = {
                ...form,
                reference_image: imageUrl
            };

            const response = await axios.post(`${API_BASE_URL}/api/campaigns/admin/create`, formData);

            if (response.data.success) {
                setSuccess('Campaign created successfully!');
                setTimeout(() => {
                    navigate('/campaigns');
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar currentPage="campaigns" onLogout={onLogout} />

            <div className="flex-1 p-4 sm:p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/campaigns')}
                            className="flex items-center text-purple-600 hover:text-purple-700 font-medium mb-4"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Campaigns
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Campaign</h1>
                        <p className="text-gray-600">Set up a new art competition for users</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                        {/* Basic Info */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Tajmahal Drawing Competition"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reference Image *</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="image-upload"
                                            required
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            {selectedFile ? (
                                                <div>
                                                    <div className="text-green-600 mb-2">
                                                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{selectedFile.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Click to change image</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-gray-400 mb-2">
                                                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm text-gray-600">Click to upload image</p>
                                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    {imagePreview && (
                                        <div className="mt-4">
                                            <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <select
                                            name="category"
                                            value={form.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        >
                                            <option value="drawing">Drawing</option>
                                            <option value="coloring">Coloring</option>
                                            <option value="painting">Painting</option>
                                            <option value="mixed">Mixed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
                                        <select
                                            name="age_group"
                                            value={form.age_group}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        >
                                            <option value="all">All Ages</option>
                                            <option value="kids">Kids (5-12)</option>
                                            <option value="teens">Teens (13-19)</option>
                                            <option value="adults">Adults (20+)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Submission Type *</label>
                                        <select
                                            name="submission_type"
                                            value={form.submission_type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            required
                                        >
                                            <option value="offline">🖨️ Paint by Hand (Print & Upload)</option>
                                            <option value="digital">🎨 Digital Canvas (Paint Online)</option>
                                            <option value="both">✨ Both Options Available</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Submission Type Info */}
                                <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div className="text-sm text-purple-800">
                                            <p className="font-semibold mb-1">Submission Types Explained:</p>
                                            <ul className="space-y-1 text-purple-700">
                                                <li>• <strong>Paint by Hand:</strong> Users download, print, color physically, and upload a photo</li>
                                                <li>• <strong>Digital Canvas:</strong> Users create artwork directly on the platform using digital tools</li>
                                                <li>• <strong>Both Options:</strong> Users can choose either method for their submission</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Participants & Entry Fee */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Participation Details</h2>

                            {/* Campaign Type Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Campaign Type *</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Premium Campaign */}
                                    <label className={`relative flex flex-col p-6 border-2 rounded-lg cursor-pointer transition ${form.campaign_type === 'premium'
                                        ? 'border-purple-600 bg-purple-50'
                                        : 'border-gray-300 hover:border-purple-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="campaign_type"
                                            value="premium"
                                            checked={form.campaign_type === 'premium'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-3xl">👑</span>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${form.campaign_type === 'premium'
                                                ? 'border-purple-600 bg-purple-600'
                                                : 'border-gray-300'
                                                }`}>
                                                {form.campaign_type === 'premium' && (
                                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-2 text-lg">Premium Campaign</h4>
                                        <p className="text-sm text-gray-600">Must pay money only. Points NOT allowed. Protects guaranteed revenue.</p>
                                    </label>

                                    {/* Point-Based Campaign */}
                                    <label className={`relative flex flex-col p-6 border-2 rounded-lg cursor-pointer transition ${form.campaign_type === 'point-based'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-300 hover:border-blue-300'
                                        }`}>
                                        <input
                                            type="radio"
                                            name="campaign_type"
                                            value="point-based"
                                            checked={form.campaign_type === 'point-based'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-3xl">💎</span>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${form.campaign_type === 'point-based'
                                                ? 'border-blue-600 bg-blue-600'
                                                : 'border-gray-300'
                                                }`}>
                                                {form.campaign_type === 'point-based' && (
                                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-2 text-lg">Point-Based Campaign</h4>
                                        <p className="text-sm text-gray-600">Pay money OR use 500 points. User's choice. Flexible & builds loyalty!</p>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                                    <input
                                        type="number"
                                        name="max_participants"
                                        value={form.max_participants}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Entry Fee Amount (₹)</label>
                                    <input
                                        type="number"
                                        name="entry_fee_amount"
                                        value={form.entry_fee_amount}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                </div>

                                {form.campaign_type === 'point-based' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Points Required</label>
                                        <input
                                            type="number"
                                            name="points_required"
                                            value={form.points_required}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Default: 500 points</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type</label>
                                    <select
                                        name="entry_fee_type"
                                        value={form.entry_fee_type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        disabled
                                    >
                                        <option value="rupees">Rupees (₹)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Campaign Type Info Box */}
                            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-semibold mb-1">💡 No Losers Reward System:</p>
                                        <ul className="space-y-1 text-yellow-700 text-xs">
                                            <li>• Every participant earns <strong>100 points</strong> per contest (automatic reward!)</li>
                                            <li>• After <strong>5 contests</strong>, users earn 500 points to join <strong>point-based campaigns FREE!</strong></li>
                                            <li>• <strong>👑 Premium campaigns</strong> = guaranteed revenue (points NOT allowed - money only)</li>
                                            <li>• <strong>💎 Point-based campaigns</strong> = flexible (users can pay money OR use 500 points)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prizes */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Prize Distribution</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">1st Prize (₹)</label>
                                    <input
                                        type="number"
                                        name="first_prize"
                                        value={form.first_prize}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">2nd Prize (₹)</label>
                                    <input
                                        type="number"
                                        name="second_prize"
                                        value={form.second_prize}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform Share (₹)</label>
                                    <input
                                        type="number"
                                        name="platform_share"
                                        value={form.platform_share}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Revenue Calculation */}
                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">
                                            {form.campaign_type === 'point-based' ? 'Max Collection (if all pay):' : 'Total Collection:'}
                                        </span>
                                        <span className="ml-2 font-bold text-blue-600">
                                            ₹{(form.max_participants * form.entry_fee_amount).toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Total Payout:</span>
                                        <span className="ml-2 font-bold text-green-600">
                                            ₹{(parseInt(form.first_prize) + parseInt(form.second_prize) + parseInt(form.platform_share)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {form.campaign_type === 'point-based' && (
                                    <p className="text-xs text-gray-600 mt-2">
                                        💡 Some users may use points instead of money, reducing actual revenue
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Dates */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Important Dates</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={form.start_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={form.end_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Submission Deadline</label>
                                    <input
                                        type="date"
                                        name="submission_deadline"
                                        value={form.submission_deadline}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Result Date</label>
                                    <input
                                        type="date"
                                        name="result_date"
                                        value={form.result_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rules */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Rules</h2>
                            <textarea
                                name="rules"
                                value={form.rules}
                                onChange={handleChange}
                                placeholder="Enter campaign rules (one per line)..."
                                rows="6"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                            ></textarea>
                        </div>

                        {/* Alerts */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                                <p className="text-green-700">{success}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/campaigns')}
                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Campaign'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCampaign;


