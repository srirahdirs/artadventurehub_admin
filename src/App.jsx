import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CampaignManagement from './pages/CampaignManagement';
import CreateCampaign from './pages/CreateCampaign';
import EditCampaign from './pages/EditCampaign';
import UserManagement from './pages/UserManagement';
import SubmissionReview from './pages/SubmissionReview';
import WithdrawalManagement from './pages/WithdrawalManagement';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem('admin_authenticated') === 'true'
    );

    const handleLogin = () => {
        localStorage.setItem('admin_authenticated', 'true');
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_authenticated');
        setIsAuthenticated(false);
    };

    return (
        <BrowserRouter>
            <Routes>
                {!isAuthenticated ? (
                    <>
                        <Route path="/login" element={<AdminLogin onLogin={handleLogin} />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </>
                ) : (
                    <>
                        <Route path="/" element={<AdminDashboard onLogout={handleLogout} />} />
                        <Route path="/campaigns" element={<CampaignManagement onLogout={handleLogout} />} />
                        <Route path="/campaigns/create" element={<CreateCampaign onLogout={handleLogout} />} />
                        <Route path="/campaigns/edit/:id" element={<EditCampaign onLogout={handleLogout} />} />
                        <Route path="/users" element={<UserManagement onLogout={handleLogout} />} />
                        <Route path="/submissions/:campaignId" element={<SubmissionReview onLogout={handleLogout} />} />
                        <Route path="/withdrawals" element={<WithdrawalManagement onLogout={handleLogout} />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </>
                )}
            </Routes>
        </BrowserRouter>
    );
}

export default App;

