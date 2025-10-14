import React, { useState } from 'react';

const AdminLogin = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple authentication (In production, use proper backend authentication)
        if (username === 'admin' && password === 'admin123') {
            onLogin();
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-gray-600">ArtAdventureHub</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter admin username"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                    >
                        Sign In
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Default: admin / admin123
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;

