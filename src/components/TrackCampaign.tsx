'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AnalyticsView from './AnalyticsView';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Campaign {
  _id: string;
  name: string;
  subject: string;
  status: 'draft' | 'sending' | 'sent';
  campaignToken: string;
  sentAt?: string;
  openCount?: number;
  clickCount?: number;
}

export default function TrackCampaign({ activeTab }: { activeTab: string }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCampaignToken, setSelectedCampaignToken] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchCampaigns = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/api/campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch campaigns.');
      const data = await response.json();
      setCampaigns(data.campaigns);
    } catch (err) {
      setError('Could not load campaign data.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'track-campaign') {
      fetchCampaigns();
    }
  }, [activeTab, fetchCampaigns]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Draft</span>;
      case 'sending':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Sending</span>;
      case 'sent':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Sent</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (selectedCampaignToken) {
    return (
      <AnalyticsView 
        campaignToken={selectedCampaignToken} 
        onBack={() => {
          setSelectedCampaignToken(null);
          fetchCampaigns(); 
        }} 
      />
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Track Campaigns</h1>
      
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      
      {loading ? (
        <p>Loading campaigns...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opens / Clicks</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map(campaign => (
                <tr key={campaign._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    <div className="text-sm text-gray-500">{campaign.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getStatusChip(campaign.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(campaign.sentAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {campaign.openCount || 0} / {campaign.clickCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedCampaignToken(campaign.campaignToken)}
                      disabled={campaign.status === 'draft' || campaign.status === 'sending'}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      View Analytics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaigns.length === 0 && <p className="p-6 text-center text-gray-500">No campaigns found.</p>}
        </div>
      )}
    </div>
  );
}