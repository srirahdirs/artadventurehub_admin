import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config/api.js';

const CouponManagement = ({ onLogout }) => {
    const [coupons, setCoupons] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase_amount: 0,
        max_discount_amount: '',
        expiry_date: '',
        usage_limit: '',
        applicable_campaigns: []
    });

    useEffect(() => {
        fetchCoupons();
        fetchCampaigns();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/coupons`);
            if (response.data.success) {
                setCoupons(response.data.coupons);
            }
        } catch (err) {
            console.error('Error fetching coupons:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/campaigns/admin/all`);
            if (response.data.success) {
                setCampaigns(response.data.campaigns);
            }
        } catch (err) {
            console.error('Error fetching campaigns:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discount_type: 'percentage',
            discount_value: '',
            min_purchase_amount: 0,
            max_discount_amount: '',
            expiry_date: '',
            usage_limit: '',
            applicable_campaigns: []
        });
        setEditingCoupon(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const submitData = {
                ...formData,
                discount_value: parseFloat(formData.discount_value),
                min_purchase_amount: parseFloat(formData.min_purchase_amount) || 0,
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null
            };

            if (editingCoupon) {
                await axios.put(`${API_BASE_URL}/api/coupons/${editingCoupon._id}`, submitData);
                alert('Coupon updated successfully!');
            } else {
                await axios.post(`${API_BASE_URL}/api/coupons`, submitData);
                alert('Coupon created successfully!');
            }

            setShowCreateModal(false);
            resetForm();
            fetchCoupons();
        } catch (err) {
            console.error('Error saving coupon:', err);
            alert(err.response?.data?.message || 'Error saving coupon');
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_purchase_amount: coupon.min_purchase_amount || 0,
            max_discount_amount: coupon.max_discount_amount || '',
            expiry_date: new Date(coupon.expiry_date).toISOString().split('T')[0],
            usage_limit: coupon.usage_limit || '',
            applicable_campaigns: coupon.applicable_campaigns.map(c => c._id || c)
        });
        setShowCreateModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/coupons/${id}`);
            alert('Coupon deleted successfully!');
            fetchCoupons();
        } catch (err) {
            console.error('Error deleting coupon:', err);
            alert(err.response?.data?.message || 'Error deleting coupon');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axios.patch(`${API_BASE_URL}/api/coupons/${id}/toggle-status`);
            fetchCoupons();
        } catch (err) {
            console.error('Error toggling coupon status:', err);
            alert(err.response?.data?.message || 'Error updating coupon status');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isExpired = (date) => {
        return new Date(date) < new Date();
    };

    const getStatusBadge = (coupon) => {
        if (!coupon.is_active) {
            return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">INACTIVE</span>;
        }
        if (isExpired(coupon.expiry_date)) {
            return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">EXPIRED</span>;
        }
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">LIMIT REACHED</span>;
        }
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">ACTIVE</span>;
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar currentPage="coupons" onLogout={onLogout} />

            <div className="flex-1 p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Coupon Management</h1>
                            <p className="text-gray-600">Create and manage discount coupons</p>
                        </div>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowCreateModal(true);
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
                        >
                            + Create New Coupon
                        </button>
                    </div>

                    {/* Coupons Table */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <div className="text-6xl mb-4">🎟️</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Coupons Found</h3>
                            <p className="text-gray-600 mb-4">Create your first coupon to get started</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                Create Coupon
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Discount</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Usage</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Expiry</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {coupons.map((coupon) => (
                                            <tr key={coupon._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-purple-600">{coupon.code}</div>
                                                    {coupon.applicable_campaigns.length > 0 && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {coupon.applicable_campaigns.length} campaign(s)
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{coupon.description}</div>
                                                    {coupon.min_purchase_amount > 0 && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Min: ₹{coupon.min_purchase_amount}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-green-600">
                                                        {coupon.discount_type === 'percentage'
                                                            ? `${coupon.discount_value}%`
                                                            : `₹${coupon.discount_value}`}
                                                    </div>
                                                    {coupon.discount_type === 'percentage' && coupon.max_discount_amount && (
                                                        <div className="text-xs text-gray-500">
                                                            Max: ₹{coupon.max_discount_amount}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        <span className="font-semibold">{coupon.used_count}</span>
                                                        <span className="text-gray-500">
                                                            /{coupon.usage_limit || '∞'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`text-sm ${isExpired(coupon.expiry_date) ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                                        {formatDate(coupon.expiry_date)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(coupon)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2 flex-wrap">
                                                        <button
                                                            onClick={() => handleEdit(coupon)}
                                                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-sm font-medium"
                                                            title="Edit Coupon"
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleStatus(coupon._id)}
                                                            className={`px-3 py-1 rounded hover:opacity-80 transition text-sm font-medium ${
                                                                coupon.is_active
                                                                    ? 'bg-orange-100 text-orange-700'
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}
                                                            title={coupon.is_active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {coupon.is_active ? '⏸️ Disable' : '▶️ Enable'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(coupon._id)}
                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium"
                                                            title="Delete Coupon"
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

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Coupon Code */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Coupon Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                                        placeholder="e.g., SAVE20"
                                        required
                                        disabled={editingCoupon} // Don't allow changing code when editing
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Unique code that users will enter</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g., 20% off on all campaigns"
                                        required
                                    />
                                </div>

                                {/* Discount Type & Value */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Discount Type *
                                        </label>
                                        <select
                                            value={formData.discount_type}
                                            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Discount Value *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder={formData.discount_type === 'percentage' ? 'e.g., 20' : 'e.g., 50'}
                                            min="0"
                                            max={formData.discount_type === 'percentage' ? '100' : undefined}
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Min Purchase & Max Discount */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Min Purchase Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.min_purchase_amount}
                                            onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    {formData.discount_type === 'percentage' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Max Discount Amount (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.max_discount_amount}
                                                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="Optional"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Expiry Date & Usage Limit */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Expiry Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.expiry_date}
                                            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Usage Limit
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.usage_limit}
                                            onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Unlimited"
                                            min="0"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
                                    </div>
                                </div>

                                {/* Applicable Campaigns */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Applicable Campaigns
                                    </label>
                                    <select
                                        multiple
                                        value={formData.applicable_campaigns}
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            setFormData({ ...formData, applicable_campaigns: selected });
                                        }}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        size="4"
                                    >
                                        {campaigns.map(campaign => (
                                            <option key={campaign._id} value={campaign._id}>
                                                {campaign.name} - ₹{campaign.entry_fee.amount}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Leave empty to apply to all campaigns. Hold Ctrl/Cmd to select multiple.
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
                                    >
                                        {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManagement;


