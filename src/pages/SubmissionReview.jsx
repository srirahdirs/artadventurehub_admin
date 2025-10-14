import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config/api.js';

const SubmissionReview = ({ onLogout }) => {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [rating, setRating] = useState(0);
    const [notes, setNotes] = useState('');
    const [showPrizeDistribution, setShowPrizeDistribution] = useState(false);
    const [firstWinner, setFirstWinner] = useState('');
    const [secondWinner, setSecondWinner] = useState('');
    const [distributing, setDistributing] = useState(false);

    useEffect(() => {
        fetchCampaignDetails();
    }, [campaignId]);

    const fetchCampaignDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/campaigns/admin/${campaignId}`);
            if (response.data.success) {
                setCampaign(response.data.campaign);
                setSubmissions(response.data.submissions || []);
            }
        } catch (err) {
            console.error('Error fetching campaign:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async (submissionId, prizePosition = null) => {
        try {
            await axios.put(`${API_BASE_URL}/api/campaigns/admin/submission/${submissionId}/rate`, {
                rating,
                notes,
                prize_position: prizePosition
            });

            alert(`Submission ${prizePosition ? `marked as ${prizePosition} prize winner!` : 'rated successfully!'}`);
            fetchCampaignDetails();
            setSelectedSubmission(null);
            setRating(0);
            setNotes('');
        } catch (err) {
            alert(err.response?.data?.message || 'Error rating submission');
        }
    };

    const distributePrizes = async () => {
        if (!firstWinner || !secondWinner) {
            alert('Please select both first and second prize winners');
            return;
        }

        if (firstWinner === secondWinner) {
            alert('First and second prize winners must be different');
            return;
        }

        setDistributing(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/campaigns/admin/distribute-prizes`, {
                campaign_id: campaignId,
                first_winner_id: firstWinner,
                second_winner_id: secondWinner
            });

            if (response.data.success) {
                const results = response.data.results;
                alert(`Prizes distributed successfully!\n\n🏆 First Prize: ₹${results.first_winner.prize_amount}\n🥈 Second Prize: ₹${results.second_winner.prize_amount}\n🎁 Participation Points: ${results.participation_rewards.non_winners_count} participants received 100 points each`);

                fetchCampaignDetails();
                setShowPrizeDistribution(false);
                setFirstWinner('');
                setSecondWinner('');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error distributing prizes');
        } finally {
            setDistributing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar currentPage="campaigns" onLogout={onLogout} />

            <div className="flex-1 p-4 sm:p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <button
                        onClick={() => navigate('/campaigns')}
                        className="flex items-center text-purple-600 hover:text-purple-700 font-medium mb-6"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Campaigns
                    </button>

                    {campaign && (
                        <>
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
                                        <p className="text-gray-600">{submissions.length} submissions to review</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600">Prize Pool</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            ₹{campaign.prizes.first_prize + campaign.prizes.second_prize}
                                        </div>
                                    </div>
                                </div>

                                {/* Prize Distribution Button */}
                                {submissions.length >= 2 && campaign.status === 'active' && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => setShowPrizeDistribution(true)}
                                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center"
                                        >
                                            <span className="text-xl mr-2">🏆</span>
                                            Distribute Prizes & Award Points
                                        </button>
                                        <p className="text-sm text-gray-600 mt-2">
                                            💡 This will award 100 points to all non-winning participants
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Submissions Grid */}
                            {submissions.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-12 text-center">
                                    <div className="text-6xl mb-4">📭</div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
                                    <p className="text-gray-600">Waiting for participants to submit their artwork</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {submissions.map((submission) => (
                                        <div key={submission._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                            {/* Image */}
                                            <div className="relative h-64 bg-gray-200">
                                                <img
                                                    src={submission.submission_image}
                                                    alt={submission.title}
                                                    className="w-full h-full object-cover cursor-pointer"
                                                    onClick={() => setSelectedSubmission(submission)}
                                                />
                                                {submission.status === 'winner' && (
                                                    <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                                                        🏆 Winner
                                                    </div>
                                                )}
                                                {submission.status === 'runner_up' && (
                                                    <div className="absolute top-3 left-3 bg-gray-300 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                                                        🥈 Runner Up
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="p-4">
                                                <div className="flex items-center mb-3">
                                                    <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-white font-bold mr-2 text-sm">
                                                        {submission.user_id?.username?.[0].toUpperCase() || '?'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm">{submission.user_id?.username || 'Anonymous'}</div>
                                                        <div className="text-xs text-gray-500">{submission.user_id?.mobile_number}</div>
                                                    </div>
                                                </div>

                                                <h3 className="font-semibold text-gray-900 mb-1">{submission.title || 'Untitled'}</h3>
                                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{submission.description}</p>

                                                {/* Stats */}
                                                <div className="flex justify-between text-xs text-gray-600 mb-3">
                                                    <span>❤️ {submission.likes} likes</span>
                                                    <span>👍 {submission.votes} votes</span>
                                                    <span>⭐ {submission.admin_rating}/10</span>
                                                </div>

                                                {/* Quick Actions */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedSubmission(submission);
                                                        setRating(submission.admin_rating || 0);
                                                        setNotes(submission.admin_notes || '');
                                                    }}
                                                    className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-sm font-medium"
                                                >
                                                    View & Rate
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Rating Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">Rate Submission</h2>
                                <button
                                    onClick={() => setSelectedSubmission(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <img
                                src={selectedSubmission.submission_image}
                                alt={selectedSubmission.title}
                                className="w-full rounded-lg mb-4"
                            />

                            <h3 className="font-bold text-lg mb-2">{selectedSubmission.title}</h3>
                            <p className="text-gray-600 mb-4">{selectedSubmission.description}</p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-10)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={rating}
                                    onChange={(e) => setRating(parseFloat(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add feedback for the artist..."
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => handleRate(selectedSubmission._id)}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                                >
                                    Save Rating & Notes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Prize Distribution Modal */}
            {showPrizeDistribution && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">🏆 Distribute Prizes</h2>
                            <button
                                onClick={() => setShowPrizeDistribution(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">📋 Prize Distribution Info</h3>
                            <div className="text-sm text-blue-800 space-y-1">
                                <p>🏆 <strong>First Prize:</strong> ₹{campaign.prizes.first_prize}</p>
                                <p>🥈 <strong>Second Prize:</strong> ₹{campaign.prizes.second_prize}</p>
                                <p>🎁 <strong>Participation Points:</strong> 100 points to all non-winners</p>
                                <p>📊 <strong>Total Participants:</strong> {submissions.length}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* First Prize Winner */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🏆 Select First Prize Winner
                                </label>
                                <select
                                    value={firstWinner}
                                    onChange={(e) => setFirstWinner(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">Choose first prize winner...</option>
                                    {submissions.map((submission) => (
                                        <option key={submission._id} value={submission._id}>
                                            {submission.user_id?.username || 'Anonymous'} - {submission.title || 'Untitled'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Second Prize Winner */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🥈 Select Second Prize Winner
                                </label>
                                <select
                                    value={secondWinner}
                                    onChange={(e) => setSecondWinner(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">Choose second prize winner...</option>
                                    {submissions.map((submission) => (
                                        <option key={submission._id} value={submission._id}>
                                            {submission.user_id?.username || 'Anonymous'} - {submission.title || 'Untitled'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowPrizeDistribution(false)}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                                disabled={distributing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={distributePrizes}
                                disabled={distributing || !firstWinner || !secondWinner}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {distributing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Distributing...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xl mr-2">🏆</span>
                                        Distribute Prizes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubmissionReview;

