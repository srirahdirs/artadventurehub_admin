import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ currentPage, onLogout }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/' },
        { id: 'campaigns', label: 'Campaigns', icon: '🎨', path: '/campaigns' },
        { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/notifications' },
        { id: 'coupons', label: 'Coupons', icon: '🎟️', path: '/coupons' },
        { id: 'users', label: 'Users', icon: '👥', path: '/users' },
        { id: 'withdrawals', label: 'Withdrawals', icon: '💰', path: '/withdrawals' },
    ];

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen p-4 hidden lg:block">
            {/* Logo */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-1">ArtAdventureHub</h2>
                <p className="text-sm text-gray-400">Admin Panel</p>
            </div>

            {/* Menu */}
            <nav className="space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={`flex items-center px-4 py-3 rounded-lg transition ${currentPage === item.id
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                            }`}
                    >
                        <span className="mr-3 text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Logout Button */}
            <button
                onClick={onLogout}
                className="mt-8 w-full flex items-center px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition"
            >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Logout</span>
            </button>
        </div>
    );
};

export default Sidebar;

