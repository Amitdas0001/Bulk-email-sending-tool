'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';


const API_URL = process.env.NEXT_PUBLIC_API_URL;


interface AnalyticsData {
  campaign: {
    name: string;
    subject: string;
    status: string;
    sentAt?: string;
  };
  summary: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
  rates: {
    openRate: number;
    clickRate: number;
    bounceRate: number;
  };
  
  timeline: {
    type: 'open' | 'click';
    date: string;
    email: string;
    url?: string;
  }[];
}

interface AnalyticsViewProps {
  campaignToken: string;
  onBack: () => void;
}

export default function AnalyticsView({ campaignToken, onBack }: AnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token || !campaignToken) return;
      
      setLoading(true);
      setError('');
      try {
        
        const response = await fetch(`${API_URL}/api/track/analytics/${campaignToken}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data.');
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token, campaignToken]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!analytics) {
    return <div className="p-6">No analytics data available.</div>;
  }

  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        &larr; Back to Campaigns
      </button>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{analytics.campaign.name}</h1>
      <p className="text-lg text-gray-600 mb-4">Subject: {analytics.campaign.subject}</p>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Recipients</h3>
          <p className="text-3xl font-semibold text-gray-900">{analytics.summary.totalRecipients}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Sent</h3>
          <p className="text-3xl font-semibold text-gray-900">{analytics.summary.sent}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Open Rate</h3>
          <p className="text-3xl font-semibold text-green-600">{analytics.rates.openRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Click Rate</h3>
          <p className="text-3xl font-semibold text-blue-600">{analytics.rates.clickRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Activity Timeline</h2>
        <div className="max-h-96 overflow-y-auto">
          <ul>
            {analytics.timeline.map((event, index) => (
              <li key={`event-${index}`} className="border-b py-2">
                {event.type === 'click' ? (
                  <>
                    <p>
                      <span className="font-bold text-blue-600">🖱️ Click:</span> {event.email} clicked on{' '}
                      <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline truncate">
                        {event.url}
                      </a>
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                  </>
                ) : (
                  <>
                    <p><span className="font-bold text-green-600">👁️ Open:</span> {event.email} opened the email.</p>
                    <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                  </>
                )}
              </li>
            ))}
            {analytics.timeline.length === 0 && (
              <p className="text-gray-500">No open or click activity recorded yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}