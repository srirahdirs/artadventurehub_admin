import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const AdminDashboard = ({ onLogout }) => {
    const [stats, setStats] = useState({
        total_campaigns: 0,
        active_campaigns: 0,
        completed_campaigns: 0,
        total_submissions: 0,
        total_revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            console.log('📊 Fetching admin stats...');
            const response = await axios.get('http://localhost:3033/api/campaigns/admin/stats');
            console.log('📊 Stats response:', response.data);
            if (response.data.success) {
                console.log('✅ Setting stats:', response.data.stats);
                setStats(response.data.stats);
            } else {
                console.error('❌ Stats fetch failed:', response.data);
            }
        } catch (err) {
            console.error('❌ Error fetching stats:', err);
            console.error('Error details:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar currentPage="dashboard" onLogout={onLogout} />

            <div className="flex-1 p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                        <p className="text-gray-600">Welcome to ArtAdventureHub Admin Panel</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Campaigns</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total_campaigns}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">🎨</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Active Campaigns</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.active_campaigns}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">✅</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Submissions</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.total_submissions}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">🖼️</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                    <p className="text-3xl font-bold text-yellow-600">₹{stats.total_revenue}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">💰</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Link
                            to="/campaigns/create"
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition group"
                        >
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition">
                                    <span className="text-2xl">➕</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Create Campaign</h3>
                                    <p className="text-sm text-gray-600">Start a new contest</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/campaigns"
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition group"
                        >
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition">
                                    <span className="text-2xl">📋</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Manage Campaigns</h3>
                                    <p className="text-sm text-gray-600">View and edit contests</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/users"
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition group"
                        >
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition">
                                    <span className="text-2xl">👥</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">User Management</h3>
                                    <p className="text-sm text-gray-600">View all users</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

